import bind from 'bind-decorator';
import { action } from 'mobx';
import { Component, h } from 'preact';
import Graph from '../../graph/Graph';
import NodeRendition from './NodeRendition';

import './GraphView.scss';

interface Props {
  graph: Graph;
}

interface State {
  xScroll: number;
  yScroll: number;
}

export default class GraphView extends Component<Props, State> {
  private scrollEl: HTMLElement;

  constructor() {
    super();
    this.state = {
      xScroll: 0,
      yScroll: 0,
    };
  }

  public render({ graph }: Props, { xScroll, yScroll }: State): any {
    return (
      <section id="graph" onMouseDown={this.onMouseDown}>
        <div
          className="scroll"
          style={{ left: `${xScroll}px`, top: `${yScroll}px` }}
          ref={el => { this.scrollEl = el as HTMLElement; }}
        >
          {graph.nodes.map(node => (
              <NodeRendition node={node} graph={graph} onScroll={this.onScroll} />))}
        </div>
      </section>
    );
  }

  @action.bound
  private onMouseDown(e: MouseEvent) {
    e.preventDefault();
    this.props.graph.clearSelection();
  }

  @bind
  private onScroll(dx: number, dy: number) {
    this.setState({ xScroll: this.state.xScroll + dx, yScroll: this.state.yScroll + dy });
  }
}
