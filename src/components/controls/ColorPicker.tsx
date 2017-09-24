import bind from 'bind-decorator';
import { Component, h } from 'preact';
import {
  formatCssColor,
  formatRGBAColor,
  hsl2rgb,
  hsla2rgba,
  HSLAColor,
  rgba2hsla,
  RGBAColor,
} from './colors';
import GradientSlider from './GradientSlider';

import './ColorPicker.scss';

interface Props {
  onChange: (color: RGBAColor) => void;
  disabled?: boolean;
  alpha?: boolean;
}

interface State {
  color: HSLAColor;
}

const HUE_COLORS = [
  '#f00',
  '#ff0',
  '#0f0',
  '#0ff',
  '#00f',
  '#f0f',
  '#f00',
];

// TODO: Support optional alpha
/** Edit an RGB or HSL color. Note that this control is stateful because we want the HSL
    color to be the source of truth while editing; otherwise we run into problems with
    precision errors and 'gimble-lock' with the hue slider. */
export default class ColorPicker extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      color: [0, 0,  0, 0],
    };
  }

  /** Set the current color given an RGBA color.
      @param preserve If true and the input color is such that either hue and saturation values
          are indeterminate (for example, if the lightness is set to 0 then hue and saturation
          don't matter), this preserves the existing values instead of setting the to 0.
  */
  public setRGBA(rgba: RGBAColor, preserve = false) {
    const color = rgba2hsla(rgba);
    if (preserve) {
      if (color [2] < 0.0001 || color[2] > 0.99) {
        color[0] = this.state.color[0];
        color[1] = this.state.color[1];
      } else if (color[1] < 0.0001) {
        color[0] = this.state.color[0];
      }
    }
    this.setState({ color });
  }

  public setHSLA(hsla: HSLAColor) {
    this.setState({ color: hsla });
  }

  public render({ alpha: showAlpha, disabled }: Props, { color }: State) {
    const [hue, saturation, lightness, alpha] = color;
    const [r, g, b] = hsl2rgb(color);
    const cssColor = formatCssColor([r, g, b]);
    const satGradient = [
      formatCssColor(hsl2rgb([hue, 0, lightness])),
      formatCssColor(hsl2rgb([hue, 1, lightness])),
    ];
    const lightGradient = [
      formatCssColor(hsl2rgb([hue, saturation, 0])),
      formatCssColor(hsl2rgb([hue, saturation, 0.5])),
      formatCssColor(hsl2rgb([hue, saturation, 1])),
    ];
    const alphaGradient = [
      formatRGBAColor([r, g, b, 0]),
      formatRGBAColor([r, g, b, 1]),
    ];
    return (
      <section className="color-picker">
        <section className="sliders">
          <GradientSlider
              className="hue"
              colors={HUE_COLORS}
              value={hue}
              max={1.0}
              onChange={this.onChangeHue}
              disabled={disabled}
          />
          <GradientSlider
              className="saturation"
              colors={satGradient}
              value={saturation}
              max={1.0}
              onChange={this.onChangeSaturation}
              disabled={disabled}
          />
          <GradientSlider
              className="lightness"
              colors={lightGradient}
              value={lightness}
              max={1.0}
              onChange={this.onChangeLightness}
              disabled={disabled}
          />
          {showAlpha && <GradientSlider
              className="alpha"
              colors={alphaGradient}
              value={alpha}
              max={1.0}
              onChange={this.onChangeAlpha}
              disabled={disabled}
          />}
        </section>
        <section className="color">
          <div className="swatch" style={{ backgroundColor: cssColor }}/>
          <input className="hex" type="text" value={cssColor} disabled={disabled} />
        </section>
      </section>
    );
  }

  @bind
  private onChangeHue(hue: number) {
    const { color } = this.state;
    const newColor: HSLAColor = [hue, color[1], color[2], color[3]];
    this.setState({ color: newColor });
    this.props.onChange(hsla2rgba(newColor));
  }

  @bind
  private onChangeSaturation(saturation: number) {
    const { color } = this.state;
    const newColor: HSLAColor = [color[0], saturation, color[2], color[3]];
    this.setState({ color: newColor });
    this.props.onChange(hsla2rgba(newColor));
  }

  @bind
  private onChangeLightness(lightness: number) {
    const { color } = this.state;
    const newColor: HSLAColor = [color[0], color[1], lightness, color[3]];
    this.setState({ color: newColor });
    this.props.onChange(hsla2rgba(newColor));
  }

  @bind
  private onChangeAlpha(alpha: number) {
    const { color } = this.state;
    const newColor: HSLAColor = [color[0], color[1], color[2], alpha];
    this.setState({ color: newColor });
    this.props.onChange(hsla2rgba(newColor));
  }
}
