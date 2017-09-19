import { action } from 'mobx';
import { Component, h } from 'preact';
import Graph from '../../graph/Graph';
import NodeRendition from './NodeRendition';

import './GraphView.scss';

interface Props {
  graph: Graph;
}

export default class GraphView extends Component<Props, undefined> {
  public render({ graph }: Props): any {
    return (
      <section id="graph" onClick={this.onClick}>
        {graph.nodes.map(node => (<NodeRendition node={node} graph={graph} />))}
      </section>
    );
  }

  @action.bound
  private onClick(e: MouseEvent) {
    e.preventDefault();
    this.props.graph.clearSelection();
  }
}
