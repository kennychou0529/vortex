import bind from 'bind-decorator';
import * as classNames from 'classnames';
import { Component, h } from 'preact';

import './GradientSlider.scss';

interface Props {
  value: number;
  min?: number;
  max: number;
  className?: string;
  colors: string[];
  onChange: (value: number) => void;
}

export default class GradientSlider extends Component<Props, undefined> {
  private element: HTMLElement;
  private pointerId: number = -1;

  public componentDidMount() {
    this.element.addEventListener('pointerdown', this.onPointerDown);
  }

  public componentWillUnmount() {
    this.element.removeEventListener('pointerdown', this.onPointerDown);
    this.endDragging();
  }

  public render({ value, max, min = 0, className, colors }: Props) {
    const gradient = `linear-gradient(to right, ${colors.join(', ')})`;
    return (
      <div
          className={classNames('gradient-slider', className)}
          ref={el => { this.element = el as HTMLElement; }}
      >
        <div className="bg">
          <div className="left" style={{ backgroundColor: colors[0] }} />
          <div className="middle" style={{ backgroundImage: gradient }} />
          <div className="right" style={{ backgroundColor: colors[colors.length - 1] }}  />
        </div>
        <div className="track">
          <div className="thumb" style={{ left: `${(value - min) * 100 / (max - min)}%` }} />
        </div>
      </div>
    );
  }

  @bind
  private onPointerDown(e: PointerEvent) {
    e.preventDefault();
    this.props.onChange(this.valueFromX(e.x));
    this.beginDragging(e.pointerId);
  }

  @bind
  private onPointerMove(e: PointerEvent) {
    if (this.pointerId >= 0) {
      this.props.onChange(this.valueFromX(e.x));
    }
  }

  @bind
  private onPointerUp(e: PointerEvent) {
    this.endDragging();
  }

  private valueFromX(x: number): number {
    const { min = 0, max } = this.props;
    const dx = x - this.element.offsetLeft - 13;
    const value = dx * (max - min) / (this.element.offsetWidth - 26) + min;
    return Math.min(max, Math.max(min, value));
  }

  private beginDragging(pointerId: number) {
    if (this.pointerId < 0) {
      this.pointerId = pointerId;
      this.element.addEventListener('pointerup', this.onPointerUp);
      this.element.addEventListener('pointermove', this.onPointerMove);
      this.element.setPointerCapture(pointerId);
    }
  }

  private endDragging() {
    if (this.pointerId >= 0) {
      this.element.releasePointerCapture(this.pointerId);
      this.element.removeEventListener('pointerup', this.onPointerUp);
      this.element.removeEventListener('pointermove', this.onPointerMove);
      this.pointerId = -1;
    }
  }
}
