import bind from 'bind-decorator';
import { Component, h } from 'preact';
import GradientSlider from './GradientSlider';

type RGBColor = [number, number, number];
type HSLColor = [number, number, number];

const hsl2rgb: (hsl: HSLColor) => RGBColor = require('float-hsl2rgb');
const rgb2hsl: (rgb: RGBColor) => HSLColor = require('float-rgb2hsl');

import './ColorPicker.scss';

interface Props {
  red: number;
  green: number;
  blue: number;
  // TODO: Support optional alpha
  // alpha?: boolean;
  onChange: (r: number, g: number, b: number, a?: number) => void;
}

interface State {
  hue: number;
  saturation: number;
  lightness: number;
}

function cc(v: number) {
  return ('00' + Math.round(v * 255).toString(16)).substr(-2);
}

function formatCssColor([r, g, b]: [number, number, number]) {
  return `#${cc(r)}${cc(g)}${cc(b)}`;
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

export default class ColorPicker extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const [hue, saturation, lightness] = rgb2hsl([props.red, props.green, props.blue]);
    this.state = {
      hue,
      saturation,
      lightness,
    };
  }

  public render(props: Props, { hue, saturation, lightness }: State) {
    const [r, g, b] = hsl2rgb([hue, saturation, lightness]);
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
    return (
      <section className="color-picker">
        <section className="sliders">
          <GradientSlider
              className="hue"
              colors={HUE_COLORS}
              value={hue}
              max={1.0}
              onChange={this.onChangeHue}
          />
          <GradientSlider
              className="saturation"
              colors={satGradient}
              value={saturation}
              max={1.0}
              onChange={this.onChangeSaturation}
          />
          <GradientSlider
              className="lightness"
              colors={lightGradient}
              value={lightness}
              max={1.0}
              onChange={this.onChangeLightness}
          />
        </section>
        <section className="color">
          <div className="swatch" style={{ backgroundColor: cssColor }}/>
          <input className="hex" type="text" value={cssColor} />
        </section>
      </section>
    );
  }

  @bind
  private onChangeHue(hue: number) {
    this.setState({ hue });
  }

  @bind
  private onChangeSaturation(saturation: number) {
    this.setState({ saturation });
  }

  @bind
  private onChangeLightness(lightness: number) {
    this.setState({ lightness });
  }
}
