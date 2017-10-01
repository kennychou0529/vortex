import bind from 'bind-decorator';
import { action } from 'mobx';
import { Component, h } from 'preact';
import { observer } from 'preact-mobx';
import ColorPicker from '../controls/ColorPicker';
import ComboSlider from '../controls/ComboSlider';
import { ColorGradient, ColorStop, formatRGBAColor, RGBAColor } from './colors';
import ColorStopDragger from './ColorStopDragger';

import './ColorGradientEditor.scss';

interface Props {
  caption: string;
  value: ColorGradient;
  onChange: () => void;
}

interface State {
  position: number;
  selected: number;
}

@observer
export default class ColorGradientEditor extends Component<Props, State> {
  private colorPicker: ColorPicker;
  private gradientEl: HTMLElement;
  private pointerId: number;

  constructor() {
    super();
    this.pointerId = undefined;
    this.state = {
      position: 0,
      selected: -1,
    };
  }

  public componentWillUnmount() {
    this.endDragging();
  }

  public render({ caption, value }: Props, { position, selected }: State) {
    const gradient = this.renderGradient(value);
    return (
      <div className="color-gradient-editor">
        <div className="color-stops property-group">
          <div className="caption">{caption}</div>
          <div
              className="gradient"
              style={{ backgroundImage: gradient }}
              ref={(el: HTMLElement) => { this.gradientEl = el; }}
              onClick={this.onClick}
              onDblClick={this.onDoubleClick}
          >
            {value.map((cs, i) => (
              <ColorStopDragger
                  color={cs.value}
                  value={cs.position}
                  index={i}
                  selected={i === selected}
                  onChange={null}
                  onSelect={this.onSelectStop}
                  onDelete={this.onDeleteStop}
              />))}
          </div>
          <ComboSlider
              name="Position"
              value={position}
              max={1}
              min={0}
              increment={1 / 256.0}
              precision={2}
              onChange={this.onChangePosition}
          />
        </div>
        <ColorPicker
            ref={(el: ColorPicker) => { this.colorPicker = el; }}
            onChange={this.onChangeColor}
            disabled={selected < 0}
            alpha={true}
        />
      </div>
    );
  }

  public renderGradient(gradient: ColorGradient) {
    if (gradient.length === 0) {
      return undefined;
    }
    const colorStops = gradient.map(({ value, position }) =>
        `${formatRGBAColor(value)} ${Math.round(position * 1000) / 10}%`);
    return `linear-gradient(to right, ${colorStops.join(', ')})`;
  }

  @bind
  private onClick(e: MouseEvent) {
    const position = this.clickPos(e);
    const stop = this.getColorAt(position);
    this.setState({ selected: -1 });
    this.colorPicker.setRGBA(stop.value, true);
  }

  @bind
  private onDoubleClick(e: MouseEvent) {
    if (this.props.value.length < 32) { // Our shaders only support 32 stops
      const fraction = this.clickPos(e);
      const nextIndex = this.findEnclosingStops(fraction)[1];
      const newStop = this.getColorAt(fraction);
      this.props.value.splice(nextIndex, 0, newStop);
      const color = Array.from(this.props.value[nextIndex].value) as RGBAColor;
      this.setState({ selected: nextIndex });
      this.colorPicker.setRGBA(color, true);
      this.props.onChange();
    }
  }

  @bind
  private onSelectStop(selected: number, e: PointerEvent) {
    e.preventDefault();
    const color = Array.from(this.props.value[selected].value) as RGBAColor;
    this.setState({ selected });
    this.colorPicker.setRGBA(color, true);
    if (selected > 0 && selected < this.props.value.length - 1) {
      this.beginDragging(e.pointerId);
    }
  }

  @bind
  private onDeleteStop(index: number) {
    if (index > 0 && index < this.props.value.length - 1) {
      this.props.value.splice(index, 1);
    }
  }

  @action.bound
  private onChangeColor(color: RGBAColor) {
    const { selected } = this.state;
    if (selected >= 0) {
      this.props.value[selected].value = color;
      this.props.onChange();
    }
  }

  @bind
  private onChangePosition(value: number) {
    const { selected } = this.state;
    if (selected >= 0) {
      this.props.value[selected].position = Math.max(0, Math.min(1, value));
      this.props.onChange();
    }
  }

  @bind
  private onPointerMove(e: PointerEvent) {
    const { value } = this.props;
    const { selected } = this.state;
    if (selected >= 0 && this.pointerId !== undefined) {
      const fraction = this.clickPos(e);
      const min = selected > 0 ? value[selected - 1].position : 0;
      const max = selected < value.length - 1 ? value[selected + 1].position : 1;
      this.props.value[selected].position = Math.max(min, Math.min(max, fraction));
      this.props.onChange();
    }
  }

  @bind
  private onPointerUp(e: PointerEvent) {
    this.endDragging();
  }

  private beginDragging(pointerId: number) {
    if (this.pointerId === undefined) {
      this.pointerId = pointerId;
      this.gradientEl.addEventListener('pointerup', this.onPointerUp);
      this.gradientEl.addEventListener('pointermove', this.onPointerMove);
      this.gradientEl.setPointerCapture(pointerId);
    }
  }

  private endDragging() {
    if (this.pointerId !== undefined) {
      this.gradientEl.releasePointerCapture(this.pointerId);
      this.gradientEl.removeEventListener('pointerup', this.onPointerUp);
      this.gradientEl.removeEventListener('pointermove', this.onPointerMove);
      this.pointerId = undefined;
    }
  }

  private getColorAt(position: number): ColorStop {
    const [prevIndex, nextIndex] = this.findEnclosingStops(position);
    const prev = this.props.value[prevIndex];
    const next = this.props.value[nextIndex];
    const t = next.position > prev.position ?
        (position - prev.position) / (next.position - prev.position) : 0;
    return {
      position: Math.max(prev.position, Math.min(next.position, position)),
      value: [
        prev.value[0] + t * (next.value[0] - prev.value[0]),
        prev.value[1] + t * (next.value[1] - prev.value[1]),
        prev.value[2] + t * (next.value[2] - prev.value[2]),
        prev.value[3] + t * (next.value[3] - prev.value[3]),
      ],
    };
  }

  /** Given a position value in the range [0, 1], returns the index of the color stops
      before and after that position. If the input value is before the first stop then both
      numbers will be zero; if the input value is after the last stop then both numbers will
      be the index of the last stop.

      The idea is that these would be used to interpolate between the two stops to get the
      color at that point in the gradient. In the case where the position is before the first
      or after the last stop, the color is constant so the interpolation degenerates into a
      constant color.
  */
  private findEnclosingStops(position: number): [number, number] {
    const index = this.props.value.findIndex(cs => cs.position > position);
    let next: number;
    let prev: number;
    if (index < 0) {
      next = prev = this.props.value.length - 1;
    } else {
      next = index;
      prev = Math.max(0, index - 1);
    }
    return [prev, next];
  }

  /** Convert a click on the gradient element into a fraction between [0, 1]. */
  private clickPos(event: MouseEvent | PointerEvent): number {
    return Math.min(1.0, Math.max(0, event.offsetX / this.base.offsetWidth));
  }
}
