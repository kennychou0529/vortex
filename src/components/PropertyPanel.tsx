import bind from 'bind-decorator';
import { Component, h } from 'preact';
import { observer } from 'preact-mobx';
import { Graph, GraphNode } from '../graph';
import NodeActions from './NodeActions';
import PropertyEditor from './propedit/PropertyEditor';
import RenderedImage from './RenderedImage';

import './PropertyPanel.scss';

interface Props {
  graph: Graph;
}

interface State {
  tiling: number;
  lockedNode: GraphNode;
}

@observer
export default class PropertyPanel extends Component<Props, State> {
  constructor() {
    super();
    this.state = {
      tiling: 1,
      lockedNode: null,
    };
  }

  public render({ graph }: Props, { tiling, lockedNode }: State) {
    const selection = graph.selection;
    const selectedNode = selection.length === 1 ? selection[0] : null;
    const previewNode = lockedNode || selectedNode;
    return (
      <aside id="property-panel">
        {selectedNode && <PropertyEditor graph={graph} node={selectedNode} />}
        {selectedNode && (
          <NodeActions
            node={selectedNode}
            locked={lockedNode !== null}
            onSetTiling={this.onSetTiling}
            onLock={this.onLock}
          />)}
        {selectedNode &&
            <RenderedImage node={previewNode} width={320} height={320} tiling={tiling} />}
      </aside>
    );
  }

  @bind
  private onSetTiling(tiling: number) {
    this.setState({ tiling });
  }

  @bind
  private onLock(lock: boolean) {
    const selection = this.props.graph.selection;
    const selectedNode = selection.length === 1 ? selection[0] : null;
    this.setState({ lockedNode: (lock ? selectedNode : null) });
  }
}
