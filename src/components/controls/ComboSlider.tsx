import bind from 'bind-decorator';
import * as classNames from 'classnames';
import { Component, h } from 'preact';

import './ComboSlider.scss';

// TODO: arrow auto-increment, log scale testing, auto-focus on input, prepop input

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
  inputValue: string;
}

export default class ComboSlider extends Component<Props, State> {
  private element: HTMLElement;
  private centerEl: HTMLElement;
  private inputEl: HTMLElement;
  private dragOrigin: number;
  private dragValue: number;
  private pointerId: number = -1;

  constructor(props: Props) {
    super(props);
    this.state = {
      leftDown: false,
      rightDown: false,
      textActive: false,
      inputValue: '',
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
      { textActive, leftDown, rightDown, inputValue }: State) {
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
        <div
            className={classNames('left', { active: leftDown })}
            onMouseDown={this.onLeftDown}
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
              value={inputValue}
              onBlur={this.onBlurInput}
              ref={el => { this.inputEl = el as HTMLElement; }}
            />
        </div>
        <div
            className={classNames('right', { active: rightDown })}
            onMouseDown={this.onRightDown}
        />
      </div>
    );
  }

  @bind
  private onLeftDown(e: MouseEvent) {
    const { value, increment = 1 } = this.props;
    this.setValue(value - increment);
  }

  @bind
  private onRightDown(e: MouseEvent) {
    const { value, increment = 1 } = this.props;
    this.setValue(value + increment);
  }

  @bind
  private onDoubleClick(e: MouseEvent) {
    this.setState({ textActive: true });
    window.setTimeout(() => {
      this.inputEl.focus();
    }, 5);
  }

  @bind
  private onBlurInput(e: FocusEvent) {
    this.setState({ textActive: false });
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
