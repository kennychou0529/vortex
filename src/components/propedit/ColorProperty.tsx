import { action } from 'mobx';
import { Component, h } from 'preact';
import { observer } from 'preact-mobx';
import { ChangeType, GraphNode } from '../../graph';
import { Parameter } from '../../operators';
import ColorPicker from '../controls/ColorPicker';
import { RGBAColor } from '../controls/colors';

interface Props {
  parameter: Parameter;
  node: GraphNode;
}

/** Property editor for RGBA colors. */
@observer
export default class ColorProperty extends Component<Props, undefined> {
  private colorPicker: ColorPicker;

  public componentDidMount() {
    this.updateColor(this.props);
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.node !== this.props.node) {
      this.updateColor(nextProps);
    }
  }

  public render({ parameter, node }: Props) {
    return (
      <ColorPicker
          ref={(el: ColorPicker) => { this.colorPicker = el; }}
          onChange={this.onChange}
          alpha={true}
      />
    );
  }

  @action.bound
  private onChange(value: RGBAColor) {
    const { parameter, node } = this.props;
    node.paramValues.set(parameter.id, value);
    node.notifyChange(ChangeType.PARAM_VALUE_CHANGED);
  }

  private updateColor(props: Props) {
    const { node, parameter } = props;
    const value = node.paramValues.has(parameter.id)
        ? node.paramValues.get(parameter.id)
        : (parameter.default !== undefined ? parameter.default : [0, 0, 0, 1]);
    this.colorPicker.setRGBA(value);
  }
}
