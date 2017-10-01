import bind from 'bind-decorator';
import * as classNames from 'classnames';
import { Component, h } from 'preact';
import { formatCssColor, RGBAColor } from './colors';

import './ColorGradientEditor.scss';

interface Props {
  color: RGBAColor;
  selected: boolean;
  value: number;
  index: number;
  onChange: (value: number) => void;
  onSelect: (index: number, event: PointerEvent) => void;
  onDelete: (index: number) => void;
}

export default class ColorStopDragger extends Component<Props, undefined> {
  constructor() {
    super();
  }

  public componentDidMount() {
    this.base.addEventListener('pointerdown', this.onPointerDown);
  }

  public componentWillUnmount() {
    this.base.removeEventListener('pointerdown', this.onPointerDown);
  }

  public render({ color, value, selected }: Props) {
    return (
      <div
          className={classNames('color-stop-dragger', { selected })}
          style={{ left: `${value * 100}%` }}
          onClick={this.onClick}
          onDblClick={this.onDoubleClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="25" viewBox="-1 -1 16 24">
          <defs>
            <linearGradient id="a" gradientTransform="rotate(65 -4 -2)">
              <stop offset="0" stop-color="#dedede"/>
              <stop offset=".3" stop-color="#9d9d9d"/>
              <stop offset=".6" stop-color="#747474"/>
            </linearGradient>
          </defs>
          <path d="M2 8 L8 2 L14 8 V22 H2z" fill="#000" opacity=".3" />
          <path d="M1 7 L7 1 L13 7 V21 H1z" fill="url(#a)" />
        </svg>
        <div className="swatch" style={{ backgroundColor: formatCssColor(color) }} />
      </div>
    );
  }

  @bind
  private onClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  @bind
  private onDoubleClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.props.onDelete(this.props.index);
  }

  @bind
  private onPointerDown(e: PointerEvent) {
    this.props.onSelect(this.props.index, e);
  }
}
