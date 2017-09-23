import bind from 'bind-decorator';
import * as classNames from 'classnames';
import { action } from 'mobx';
import { Component, h } from 'preact';
import { observer } from 'preact-mobx';
import { Graph, GraphNode } from '../../graph';
import RenderedImage from '../RenderedImage';
import TerminalRendition from './TerminalRendition';

import './NodeRendition.scss';

interface Props {
  node: GraphNode;
  graph: Graph;
  onScroll: (dx: number, dy: number) => void;
}

/** A visual representation of a node in the graph. */
@observer
export default class NodeRendition extends Component<Props, undefined> {
  private dragPointer: number = undefined;
  private dragXOffset: number = 0;
  private dragYOffset: number = 0;
  private body: HTMLElement;
  private hScroll: number = 0;
  private vScroll: number = 0;
  private scrollTimer: number = undefined;

  public componentDidMount() {
    this.body.addEventListener('pointerdown', this.onPointerDown);
  }

  public componentWillUnmount() {
    this.releasePointer();
    this.body.removeEventListener('pointerdown', this.onPointerDown);
  }

  public render({ node, graph }: Props): any {
    const style = {
      left: `${node.x}px`,
      top: `${node.y}px`,
    };

    return (
      <div className={classNames('node', { selected: node.selected })} style={style}>
        <div
            className="body"
            onMouseDown={this.onMouseDown}
            ref={el => { this.body = el as HTMLElement; }}
        >
          <header>{node.name}</header>
          <section className="preview">
            <RenderedImage width={80} height={80} node={node} />
          </section>
        </div>
        {node.inputs && node.inputs.map(input => (
            <TerminalRendition node={node} graph={graph} terminal={input} />))}
        {node.outputs && node.outputs.map(output => (
            <TerminalRendition node={node} graph={graph} terminal={output} />))}
      </div>
    );
  }

  @bind
  private onMouseDown(e: MouseEvent) {
    e.preventDefault();
  }

  @action.bound
  private onPointerDown(e: PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    const { node, graph } = this.props;
    if (e.ctrlKey || e.metaKey) {
      node.selected = !node.selected;
    } else if (!node.selected) {
      if (!e.shiftKey) {
        graph.clearSelection();
      }
      node.selected = true;
    }

    if (node.selected && this.dragPointer === undefined) {
      const scrollEl = this.base.parentNode as HTMLElement;
      this.dragXOffset = e.clientX - node.x - scrollEl.offsetLeft;
      this.dragYOffset = e.clientY - node.y - scrollEl.offsetTop;
      this.body.addEventListener('pointermove', this.onPointerMove);
      this.body.addEventListener('pointerup', this.onPointerUp);
      this.body.setPointerCapture(e.pointerId);
      this.dragPointer = e.pointerId;
    }
  }

  @action.bound
  private onPointerMove(e: PointerEvent) {
    const { node } = this.props;
    const scrollEl = this.base.parentNode as HTMLElement;
    const graphEl = scrollEl.parentNode as HTMLElement;
    node.x = Math.min(
      graphEl.offsetLeft + graphEl.offsetWidth,
      Math.max(graphEl.offsetLeft, e.clientX)) - this.dragXOffset - scrollEl.offsetLeft;
    node.y = Math.min(
      graphEl.offsetTop + graphEl.offsetHeight,
      Math.max(graphEl.offsetTop, e.clientY)) - this.dragYOffset - scrollEl.offsetTop;

    let hScroll = 0;
    if (e.clientX < graphEl.offsetLeft) {
      hScroll = -1;
    } else if (e.clientX > graphEl.offsetLeft + graphEl.offsetWidth) {
      hScroll = 1;
    }

    let vScroll = 0;
    if (e.clientY < graphEl.offsetTop) {
      vScroll = -1;
    } else if (e.clientY > graphEl.offsetTop + graphEl.offsetHeight) {
      vScroll = 1;
    }

    if (hScroll !== 0 || vScroll !== 0) {
      if (this.scrollTimer === undefined) {
        this.scrollTimer = window.setInterval(() => {
          this.props.onScroll(-hScroll * 10, -vScroll * 10);
        }, 16);
      }
    } else if (this.scrollTimer !== undefined) {
      window.clearInterval(this.scrollTimer);
      this.scrollTimer = undefined;
    }
    this.hScroll = hScroll;
    this.vScroll = vScroll;
  }

  @bind
  private onPointerUp(e: PointerEvent) {
    this.releasePointer();
  }

  @bind
  private releasePointer() {
    if (this.dragPointer !== undefined) {
      this.body.releasePointerCapture(this.dragPointer);
      this.body.removeEventListener('pointerup', this.onPointerUp);
      this.body.removeEventListener('pointermove', this.onPointerMove);
      this.dragPointer = undefined;
    }
    if (this.scrollTimer !== undefined) {
      window.clearInterval(this.scrollTimer);
      this.scrollTimer = undefined;
    }
  }
}
