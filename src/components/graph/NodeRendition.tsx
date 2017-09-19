import * as classNames from 'classnames';
import { action } from 'mobx';
import { Component, h } from 'preact';
import { observer } from 'preact-mobx';
import Graph from '../../graph/Graph';
import Node from '../../graph/Node';
import RenderedImage from '../RenderedImage';

import './NodeRendition.scss';

interface Props {
  node: Node;
  graph: Graph;
}

/** A visual representation of a node in the graph. */
@observer
export default class NodeRendition extends Component<Props, undefined> {
  public render({ node }: Props): any {
    const style = {
      left: `${node.x}px`,
      top: `${node.y}px`,
    };

    return (
      <div className={classNames('node', { selected: node.selected })} style={style}>
        <div className="body" onClick={this.onClick}>
          <header>{node.name}</header>
          <section className="preview">
            <RenderedImage width={80} height={80} node={node} />
          </section>
        </div>
        <div className="connectors input left" />
        <div className="connectors output right">
          <div className="connector">Out</div>
        </div>
      </div>
    );
  }

  @action.bound
  private onClick(e: MouseEvent) {
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
  }
}
