import bind from 'bind-decorator';
import { Component, h } from 'preact';
import { observer } from 'preact-mobx';
import { Graph } from '../graph';
import NodeActions from './NodeActions';
import PropertyEditor from './propedit/PropertyEditor';
import RenderedImage from './RenderedImage';

import './PropertyPanel.scss';

interface Props {
  graph: Graph;
}

interface State {
  tiling: number;
}

@observer
export default class PropertyPanel extends Component<Props, State> {
  constructor() {
    super();
    this.state = {
      tiling: 1,
    };
  }

  public render({ graph }: Props, { tiling }: State) {
    const selection = graph.selection;
    const selectedNode = selection.length === 1 ? selection[0] : null;
    return (
      <aside id="property-panel">
        {selectedNode && <PropertyEditor node={selectedNode} />}
        {selectedNode && <NodeActions node={selectedNode} onSetTiling={this.onSetTiling} />}
        {selectedNode &&
            <RenderedImage node={selectedNode} width={320} height={320} tiling={tiling} />}
      </aside>
    );
  }

  @bind
  private onSetTiling(tiling: number) {
    this.setState({ tiling });
  }
}
