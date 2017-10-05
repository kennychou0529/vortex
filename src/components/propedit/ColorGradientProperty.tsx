import { action } from 'mobx';
import { Component, h } from 'preact';
import { observer } from 'preact-mobx';
import { ChangeType, Graph, GraphNode } from '../../graph';
import { Parameter } from '../../operators';
import ColorGradientEditor from '../controls/ColorGradientEditor';

interface Props {
  parameter: Parameter;
  graph: Graph;
  node: GraphNode;
}

@observer
export default class ColorGradientProperty extends Component<Props, undefined> {
  constructor(props: Props) {
    super(props);
    const { parameter, node } = props;
    if (!node.paramValues.has(parameter.id)) {
      node.paramValues.set(parameter.id, parameter.default !== undefined ? parameter.default : []);
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    const { parameter, node } = nextProps;
    if (!node.paramValues.has(parameter.id)) {
      node.paramValues.set(parameter.id, parameter.default !== undefined ? parameter.default : []);
    }
  }

  public render({ parameter, node }: Props) {
    const value = node.paramValues.get(parameter.id);
    return (
      <ColorGradientEditor
          caption={parameter.name}
          value={value}
          onChange={this.onChange}
      />
    );
  }

  @action.bound
  private onChange() {
    const { node, graph } = this.props;
    node.notifyChange(ChangeType.PARAM_VALUE_CHANGED);
    graph.modified = true;
  }
}
