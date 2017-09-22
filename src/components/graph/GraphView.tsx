import bind from 'bind-decorator';
import { action } from 'mobx';
import { Component, h } from 'preact';
import Graph from '../../graph/Graph';
import Node from '../../graph/Node';
import Terminal from '../../graph/Terminal';
import CompassRose from '../controls/CompassRose';
import ConnectionRendition from './ConnectionRendition';
import NodeRendition from './NodeRendition';

import './GraphView.scss';

interface Props {
  graph: Graph;
}

interface State {
  xScroll: number;
  yScroll: number;
  dragOrigin?: Terminal;
  dragTarget?: Terminal;
  dragX: number;
  dragY: number;
  dragOver: boolean;
}

export default class GraphView extends Component<Props, State> {
  private scrollEl: HTMLElement;

  constructor() {
    super();
    this.state = {
      xScroll: 0,
      yScroll: 0,
      dragOrigin: null,
      dragTarget: null,
      dragX: 0,
      dragY: 0,
      dragOver: false,
    };
  }

  public getChildContext() {
    return {
      graph: this.props.graph,
      getDragOrigin: this.onGetDragOrigin,
      getDragTarget: this.onGetDragTarget,
      setDragOrigin: this.onSetDragOrigin,
      setDragTarget: this.onSetDragTarget,
    };
  }

  public render({ graph }: Props, { xScroll, yScroll }: State): any {
    const bounds = graph.bounds.clone().expand(50, 50);
    return (
      <section
          id="graph"
          onDragEnter={this.onDragEnter}
          onDragOver={this.onDragOver}
          onDragLeave={this.onDragLeave}
      >
        <section className="backdrop" onMouseDown={this.onMouseDown} />
        <div
          className="scroll"
          style={{ left: `${xScroll}px`, top: `${yScroll}px` }}
          ref={el => { this.scrollEl = el as HTMLElement; }}
          // onDragLeave={this.onDragLeave}
        >
          {graph.nodes.map(node => (
              <NodeRendition node={node} graph={graph} onScroll={this.onScroll} />))}
          <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox={`0 0 ${bounds.width} ${bounds.height}`}
              className="connectors"
              width={bounds.width}
              height={bounds.height}
              onMouseDown={this.onConnectionMouseDown}
          >
            <defs>
              <filter id="dropShadow" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                <feOffset dx="0" dy="2" />
              </filter>
            </defs>
            {graph.nodes.map(node => this.renderNodeConnections(node))}
            {this.renderDragConnection()}
          </svg>
        </div>
        <CompassRose onScroll={this.onScroll} />
      </section>
    );
  }

  private renderNodeConnections(node: Node) {
    const result: JSX.Element[] = [];
    for (const output of node.outputs) {
      for (const connection of output.connections) {
        result.push(
          <ConnectionRendition
              key={`${node.id}_${output.id}`}
              ts={connection.source}
              te={connection.dest}
          />);
      }
    }
    return result;
  }

  private renderDragConnection(): JSX.Element {
    const { dragOrigin, dragTarget, dragX, dragY, dragOver } = this.state;
    // In order for there to be a drag preview:
    // There must either be both an origin or a target
    // Or there must be a valid drag coordinate (dragOver) and either an origin or target
    if (dragOrigin || dragTarget && ((dragOrigin && dragTarget) || dragOver)) {
      let dragStart: Terminal;
      let dragEnd: Terminal;
      // Input on the left, output on the right.
      if ((dragOrigin && dragOrigin.output) || (dragTarget && !dragTarget.output)) {
        dragStart = dragTarget;
        dragEnd = dragOrigin;
      } else {
        dragStart = dragOrigin;
        dragEnd = dragTarget;
      }
      return (
        <ConnectionRendition
            ts={dragOrigin}
            xs={dragX}
            ys={dragY}
            te={dragTarget}
            xe={dragX}
            ye={dragY}
            pending={!dragOrigin || !dragTarget}
        />
      );
    }
    return null;
  }

  @action.bound
  private onMouseDown(e: MouseEvent) {
    e.preventDefault();
    this.props.graph.clearSelection();
  }

  @bind
  private onConnectionMouseDown(e: MouseEvent) {
    e.preventDefault();
    this.props.graph.clearSelection();
  }

  @bind
  private onScroll(dx: number, dy: number) {
    this.setState({ xScroll: this.state.xScroll + dx, yScroll: this.state.yScroll + dy });
  }

  @bind
  private onDragEnter(e: DragEvent) {
    this.setState({
      dragX: e.clientX - this.base.offsetLeft,
      dragY: e.clientY - this.base.offsetTop,
      dragOver: true,
    });
  }

  @bind
  private onDragOver(e: DragEvent) {
    this.setState({
      dragX: e.clientX - this.base.offsetLeft,
      dragY: e.clientY - this.base.offsetTop,
      // dragOver: true,
    });
  }

  @bind
  private onDragLeave(e: DragEvent) {
    this.setState({ dragOver: false });
  }

  @bind
  private onGetDragOrigin() {
    return this.state.dragOrigin;
  }

  @bind
  private onGetDragTarget() {
    return this.state.dragTarget;
  }

  @bind
  private onSetDragOrigin(terminal: Terminal) {
    this.setState({ dragOrigin: terminal, dragOver: false });
    if (terminal) {
      this.setState({
        dragX: terminal.x + terminal.node.x,
        dragY: terminal.y + terminal.node.y,
      });
    }
  }

  @bind
  private onSetDragTarget(terminal: Terminal) {
    this.setState({ dragTarget: terminal });
  }
}
