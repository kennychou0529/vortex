import { Component, h } from 'preact';
import Node from '../../graph/Node';
import RenderedImage from '../RenderedImage';

import './NodeRendition.scss';

interface Props {
  node: Node;
}

/** A visual representation of a node in the graph. */
export default class NodeRendition extends Component<Props, undefined> {
  public render({ node }: Props): any {
    const style = {
      left: `${node.x}px`,
      top: `${node.y}px`,
    };

    return (
      <div className="node" style={style}>
        <div className="body">
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
}
