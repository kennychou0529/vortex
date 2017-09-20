import bind from 'bind-decorator';
import * as classNames from 'classnames';
import { Component, h } from 'preact';
import MomentaryButton from './MomentaryButton';

import './ComboSlider.scss';

// TODO: log scale testing

interface Props {
  name: string;
  value: number;
  min?: number;
  max: number;
  precision?: number; // 0 = integer, undefined == unlimited
  increment?: number;
  logScale?: boolean;
  enumVals?: string[];
  className?: string;
  onChange: (value: number) => void;
}

interface State {
  leftDown: boolean;
  rightDown: boolean;
  textActive: boolean;
}

export default class ComboSlider extends Component<Props, State> {
  private element: HTMLElement;
  private centerEl: HTMLElement;
  private inputEl: HTMLFormElement;
  private dragOrigin: number;
  private dragValue: number;
  private pointerId: number = -1;

  constructor(props: Props) {
    super(props);
    this.state = {
      leftDown: false,
      rightDown: false,
      textActive: false,
    };
  }

  public componentDidMount() {
    this.centerEl.addEventListener('pointerdown', this.onPointerDown);
  }

  public componentWillUnmount() {
    this.centerEl.removeEventListener('pointerdown', this.onPointerDown);
    this.endDragging();
  }

  public render(
      { name, value, min = 0, max, className, enumVals }: Props,
      { textActive, leftDown, rightDown }: State) {
    const percent = enumVals ? 100 : (value - min) * 100 / (max - min);
    const style = {
      backgroundImage:
        `linear-gradient(to right, #bbc 0, #bbc ${percent}%, #aab ${percent}%, #aab 100% )`,
    };
    const displayVal = enumVals ? enumVals[value] : value;
    return (
      <div
          className={classNames('combo-slider', className, { textActive })}
          ref={el => { this.element = el as HTMLElement; }}
          style={style}
      >
        <MomentaryButton
            className="left"
            onChange={this.onLeftChange}
            onHeld={this.onLeftHeld}
        />
        <div
            className="center"
            onDblClick={this.onDoubleClick}
            ref={el => { this.centerEl = el as HTMLElement; }}
        >
            <span className="name">{name}: </span><span className="value">{displayVal}</span>
            <input
                type="text"
                autofocus={true}
                onKeyDown={this.onInputKey}
                onBlur={this.onBlurInput}
                ref={el => { this.inputEl = el as HTMLFormElement; }}
            />
        </div>
        <MomentaryButton
            className="right"
            onChange={this.onRightChange}
            onHeld={this.onRightHeld}
        />
      </div>
    );
  }

  @bind
  private onLeftChange(active: boolean) {
    if (active) {
      const { value, increment = 1 } = this.props;
      this.setValue(value - increment);
    }
  }

  @bind
  private onLeftHeld() {
    const { value, increment = 1 } = this.props;
    this.setValue(value - increment);
  }

  @bind
  private onRightChange(active: boolean) {
    if (active) {
      const { value, increment = 1 } = this.props;
      this.setValue(value + increment);
    }
  }

  @bind
  private onRightHeld() {
    const { value, increment = 1 } = this.props;
    this.setValue(value + increment);
  }

  @bind
  private onDoubleClick(e: MouseEvent) {
    const { value, enumVals } = this.props;
    if (!enumVals) {
      this.inputEl.value = value.toString();
      this.inputEl.select();
      this.setState({ textActive: true });
      window.setTimeout(() => {
        this.inputEl.focus();
      }, 5);
    }
  }

  @bind
  private onBlurInput(e: FocusEvent) {
    this.setState({ textActive: false });
    const newValue = parseFloat(this.inputEl.value);
    if (!isNaN(newValue)) {
      this.setValue(newValue);
    }
  }

  @bind
  private onInputKey(e: KeyboardEvent) {
    if (e.keyCode === 13) {
      e.preventDefault();
      const newValue = parseFloat(this.inputEl.value);
      if (!isNaN(newValue)) {
        this.setValue(newValue);
        this.setState({ textActive: false });
      }
    }
  }

  @bind
  private onPointerDown(e: PointerEvent) {
    this.dragOrigin = e.x;
    this.dragValue = this.props.value;
    this.beginDragging(e.pointerId);
  }

  @bind
  private onPointerMove(e: PointerEvent) {
    if (this.pointerId >= 0) {
      this.setValue(this.valueFromX((e.x - this.dragOrigin) / this.element.offsetWidth));
    }
  }

  @bind
  private onPointerUp(e: PointerEvent) {
    this.endDragging();
  }

  private valueFromX(dx: number): number {
    const { min = 0, max, logScale } = this.props;
    let newValue = this.dragValue;
    if (logScale) {
      newValue = 2 ** (Math.log2(newValue) + dx * Math.log2(max - min));
    } else {
      newValue += dx * (max - min);
    }
    return newValue;
  }

  private setValue(value: number) {
    const { min = 0, max, precision } = this.props;
    let newValue = value;
    if (precision !== undefined) {
      const mag = 10 ** precision;
      newValue = Math.round(newValue * mag) / mag;
    }
    this.props.onChange(Math.min(max, Math.max(min, newValue)));
  }

  private beginDragging(pointerId: number) {
    if (this.pointerId < 0) {
      this.pointerId = pointerId;
      this.centerEl.addEventListener('pointerup', this.onPointerUp);
      this.centerEl.addEventListener('pointermove', this.onPointerMove);
      this.centerEl.setPointerCapture(pointerId);
    }
  }

  private endDragging() {
    if (this.pointerId >= 0) {
      this.centerEl.releasePointerCapture(this.pointerId);
      this.centerEl.removeEventListener('pointerup', this.onPointerUp);
      this.centerEl.removeEventListener('pointermove', this.onPointerMove);
      this.pointerId = -1;
    }
  }
}
