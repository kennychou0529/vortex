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
      <section id="graph">
        {graph.nodes.map(node => (<NodeRendition node={node} />))}
      </section>
    );
  }
}
