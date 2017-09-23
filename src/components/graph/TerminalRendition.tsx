import bind from 'bind-decorator';
import * as classNames from 'classnames';
import { action } from 'mobx';
import { Component, h } from 'preact';
import { observer } from 'preact-mobx';
import { Graph, GraphNode, Terminal } from '../../graph';
import DragType from './DragType';

import './TerminalRendition.scss';

interface Props {
  node: GraphNode;
  graph: Graph;
  terminal: Terminal;
}

interface State {
  active: boolean;
}

/** A visual representation of an input or output terminal in the graph. */
@observer
export default class TerminalRendition extends Component<Props, State> {
  constructor() {
    super();
    this.state = {
      active: false,
    };
  }

  public render({ terminal }: Props, { active }: State) {
    const output = terminal.output;
    return (
      <div
          className={classNames('terminal', { in: !output, out: output, active })}
          style={{ left: `${terminal.x}px`, top: `${terminal.y}px` }}
          draggable={true}
          onDragStart={this.onDragStart}
          onDragEnter={this.onDragEnter}
          onDragOver={this.onDragEnter}
          onDragLeave={this.onDragLeave}
          onDragEnd={this.onDragEnd}
          onDrop={this.onDrop}
      >
        <div className="caption">{terminal.name}</div>
        <div className="disc" />
      </div>
    );
  }

  @bind
  private onDragStart(e: DragEvent) {
    const { node, terminal } = this.props;
    this.context.setDragOrigin(terminal);
    e.dataTransfer.dropEffect = 'none';
    e.dataTransfer.setDragImage(new Image(), 0, 0);
    e.dataTransfer.setData(terminal.output ? DragType.OUTPUT : DragType.INPUT, JSON.stringify({
      node: node.id,
      terminal: terminal.id,
    }));
  }

  @bind
  private onDragEnter(e: DragEvent) {
    const { node, terminal } = this.props;
    const origin = this.context.getDragOrigin();
    if (origin && origin.node !== node) {
      if (e.dataTransfer.types.indexOf(terminal.output ? DragType.INPUT : DragType.OUTPUT) >= 0) {
        this.setState({ active: true });
        this.context.setDragTarget(terminal);
        e.preventDefault();
      }
    }
  }

  @bind
  private onDragLeave(e: DragEvent) {
    const { terminal } = this.props;
    if (this.context.getDragTarget() === terminal) {
      this.context.setDragTarget(null);
    }
    this.setState({ active: false });
  }

  @bind
  private onDragEnd(e: DragEvent) {
    const { terminal } = this.props;
    if (this.context.getDragOrigin() === terminal) {
      this.context.setDragOrigin(null);
    }
  }

  @action.bound
  private onDrop(e: DragEvent) {
    const { node } = this.props;
    const origin = this.context.getDragOrigin();
    const target = this.context.getDragTarget();
    if (origin && origin.node !== node) {
      if (origin.output) {
        this.context.graph.connectTerminals(origin, target);
      } else {
        this.context.graph.connectTerminals(target, origin);
      }
    }
    this.setState({ active: false });
    this.context.setDragOrigin(null);
    this.context.setDragTarget(null);
  }
}
