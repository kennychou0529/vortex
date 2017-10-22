import bind from 'bind-decorator';
import { action } from 'mobx';
import { Component, h } from 'preact';
import { observer } from 'preact-mobx';
import { Connection, Graph, GraphNode, OutputTerminal, quantize, Terminal } from '../../graph';
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
  dragOrigin?: Terminal;    // The output terminal which is the origin of the drag
  dragTarget?: Terminal;    // The input terminal which is the origin of the drag
  dragX: number;            // The current drag coordinates
  dragY: number;
  dragValid: boolean;
  editConnection: Connection;
}

@observer
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
      dragValid: false,
      editConnection: null,
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
    const bounds = graph.bounds;
    return (
      <section
          id="graph"
          onDragEnter={this.onDragEnter}
          onDragOver={this.onDragOver}
          onDragLeave={this.onDragLeave}
          onDrop={this.onDrop}
          onMouseMove={this.onMouseMove}
          onMouseUp={this.onMouseUp}
      >
        <section className="backdrop" onMouseDown={this.onMouseDown} />
        <div
          className="scroll"
          style={{ left: `${xScroll}px`, top: `${yScroll}px` }}
          ref={el => { this.scrollEl = el as HTMLElement; }}
        >
          {graph.nodes.map(node => (
              <NodeRendition key={node.id} node={node} graph={graph} onScroll={this.onScroll} />))}
          <svg
              xmlns="http://www.w3.org/2000/svg"
              style={{ position: 'absolute', left: `${bounds.xMin}px`, top: `${bounds.yMin}px` }}
              viewBox={`${bounds.xMin} ${bounds.yMin} ${bounds.width} ${bounds.height}`}
              className="connectors"
              width={bounds.width}
              height={bounds.height}
              onMouseDown={this.onCanvasMouseDown}
          >
            {graph.nodes.map(node => this.renderNodeConnections(node))}
            {this.renderDragConnection()}
          </svg>
        </div>
        <CompassRose onScroll={this.onScroll} />
      </section>
    );
  }

  private renderNodeConnections(node: GraphNode) {
    const result: JSX.Element[] = [];
    for (const output of node.outputs) {
      for (const connection of output.connections) {
        const input = connection.dest;
        if (connection === this.state.editConnection) {
          continue;
        }
        result.push(
          <ConnectionRendition
              key={`${node.id}_${output.id}_${input.node.id}_${input.id}`}
              ts={connection.source}
              te={connection.dest}
              connection={connection}
              onEdit={this.onEditConnection}
          />);
      }
    }
    return result;
  }

  private renderDragConnection(): JSX.Element {
    const { dragOrigin, dragTarget, dragX, dragY, dragValid } = this.state;
    // In order for there to be a drag preview:
    // There must either be both an origin or a target
    // Or there must be a valid drag coordinate (dragValid) and either an origin or target
    if (dragOrigin || dragTarget && ((dragOrigin && dragTarget) || dragValid)) {
      let dragStart: Terminal;
      let dragEnd: Terminal;
      // Input on the left, output on the right.
      if ((dragOrigin && dragOrigin.output) || (dragTarget && !dragTarget.output)) {
        dragStart = dragOrigin;
        dragEnd = dragTarget;
      } else {
        dragStart = dragTarget;
        dragEnd = dragOrigin;
      }
      return (
        <ConnectionRendition
            ts={dragStart}
            xs={dragX}
            ys={dragY}
            te={dragEnd}
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
  private onMouseMove(e: MouseEvent) {
    // We can't use HTML5 DnD on SVG elements, so do it the hard way
    if (this.state.editConnection) {
      const { graph } = this.props;
      const { dragOrigin } = this.state;
      const target = e.target as HTMLElement;
      const classes = (target.getAttribute('class') || '').split(/\s+/);
      if (classes.indexOf('terminal') >= 0) {
        const terminal = this.props.graph.findTerminal(
            parseInt(target.dataset.node, 10),
            target.dataset.id);
        if (terminal) {
          console.log(terminal.output, dragOrigin.output);
        }
        if (terminal &&
            terminal.output !== dragOrigin.output &&
            !graph.detectCycle(dragOrigin, terminal)) {
          this.setState({
            dragTarget: terminal,
          });
          return;
        }
      }

      this.setState({
        dragX: e.clientX - this.base.offsetLeft - this.state.xScroll,
        dragY: e.clientY - this.base.offsetTop - this.state.yScroll,
        dragValid: true,
        dragTarget: null,
      });
    }
  }

  @action.bound
  private onMouseUp(e: MouseEvent) {
    // We can't use HTML5 DnD on SVG elements, so do it the hard way
    const { editConnection, dragOrigin, dragTarget } = this.state;
    if (editConnection && dragOrigin) {
      if (dragTarget === null) {
        editConnection.source.disconnect(editConnection);
        editConnection.dest.connection = null;
      } else {
        const { graph } = this.props;
        editConnection.source.disconnect(editConnection);
        editConnection.dest.connection = null;
        if (dragOrigin.output) {
          graph.connectTerminals(dragOrigin as OutputTerminal, dragTarget);
        } else {
          graph.connectTerminals(dragTarget as OutputTerminal, dragOrigin);
        }
      }
      this.setState({
        editConnection: null,
        dragOrigin: null,
        dragValid: false,
      });
    }
  }

  @bind
  private onCanvasMouseDown(e: MouseEvent) {
    e.preventDefault();
    this.props.graph.clearSelection();
  }

  @bind
  private onScroll(dx: number, dy: number) {
    this.setState({ xScroll: this.state.xScroll + dx, yScroll: this.state.yScroll + dy });
  }

  @bind
  private onDragEnter(e: DragEvent) {
    if (e.dataTransfer.types.indexOf('application/x-vortex-operator') >= 0) {
      e.preventDefault();
    }
    this.setState({
      dragX: e.clientX - this.base.offsetLeft - this.state.xScroll,
      dragY: e.clientY - this.base.offsetTop - this.state.yScroll,
      dragValid: true,
    });
  }

  @bind
  private onDragOver(e: DragEvent) {
    if (e.dataTransfer.types.indexOf('application/x-vortex-operator') >= 0) {
      e.preventDefault();
    }
    this.setState({
      dragX: e.clientX - this.base.offsetLeft - this.state.xScroll,
      dragY: e.clientY - this.base.offsetTop - this.state.yScroll,
      dragValid: true,
    });
  }

  @bind
  private onDragLeave(e: DragEvent) {
    this.setState({ dragValid: false });
  }

  @action.bound
  private onDrop(e: DragEvent) {
    const data = e.dataTransfer.getData('application/x-vortex-operator');
    if (data) {
      this.props.graph.clearSelection();
      const op = this.context.registry.get(data);
      const node = new GraphNode(op);
      node.x = quantize(e.clientX - this.base.offsetLeft - this.state.xScroll - 45);
      node.y = quantize(e.clientY - this.base.offsetTop - this.state.yScroll - 60);
      node.selected = true;
      this.props.graph.add(node);
    }
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
    this.setState({ dragOrigin: terminal, dragValid: false });
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

  @bind
  private onEditConnection(connection: Connection, output: boolean) {
    console.log('edit connection', output);
    if (output) {
      this.setState({
        editConnection: connection,
        dragOrigin: connection.source,
        dragTarget: null,
        dragX: connection.dest.node.x + connection.dest.x,
        dragY: connection.dest.node.y + connection.dest.y,
      });
    } else {
      this.setState({
        editConnection: connection,
        dragOrigin: connection.dest,
        dragTarget: null,
        dragX: connection.source.node.x + connection.source.x,
        dragY: connection.source.node.y + connection.source.y,
      });
    }
  }
}
