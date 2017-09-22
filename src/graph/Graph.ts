import { computed, observable } from 'mobx';
import Bounds from './Bounds';
import Connection from './Connection';
import InputTerminal from './InputTerminal';
import Node from './Node';
import OutputTerminal from './OutputTerminal';
import Terminal from './Terminal';

const DOC_WIDTH = 4000;

export default class Graph {
  public name: string;
  @observable public nodes: Node[];
  @observable public bounds: Bounds;

  private nodeCount = 0;

  constructor() {
    this.name = 'untitled';
    this.nodes = [];
    this.bounds = new Bounds(-DOC_WIDTH / 2, -DOC_WIDTH / 2, DOC_WIDTH / 2, DOC_WIDTH / 2);
  }

  /** Add a node to the list. */
  public add(node: Node) {
    this.nodeCount += 1;
    node.id = `n${this.nodeCount}`;
    this.nodes.push(node);
  }

  /** Locate a node by id. */
  public findNode(id: string): Node {
    return this.nodes.find(n => n.id === id);
  }

  /** Locate a terminal by id. */
  public findTerminal(nodeId: string, terminalId: string): Terminal {
    const node = this.findNode(nodeId);
    return node && node.findTerminal(terminalId);
  }

  public connect(srcNode: Node | string, srcTerm: string, dstNode: Node | string, dstTerm: string) {
    const sn: Node = typeof(srcNode) === 'string' ? this.findNode(srcNode) : srcNode;
    const dn: Node = typeof(dstNode) === 'string' ? this.findNode(dstNode) : dstNode;
    if (sn && dn) {
      const st: OutputTerminal = sn.findOutputTerminal(srcTerm);
      const dt: InputTerminal = dn.findInputTerminal(dstTerm);
      if (st && dt) {
        this.connectTerminals(st, dt);
        return true;
      }
    }
    return false;
  }

  public connectTerminals(src: OutputTerminal, dst: InputTerminal) {
    if (!src.output) {
      throw Error('Attempt to connect source to input terminal');
    }
    if (dst.output) {
      throw Error('Attempt to connect destination to output terminal');
    }
    if (dst.connection) {
      if (dst.connection.source === src) {
        return;
      }
      // Disconnect existing connection
      dst.connection.source.disconnect(dst.connection);
      dst.connection = null;
    }
    // Create new connection
    const conn: Connection = {
      source: src,
      dest: dst,
      recalc: true,
    };
    src.connections.push(conn);
    dst.connection = conn;
  }

  /** Return a list of all selected nodes. */
  @computed public get selection(): Node[] {
    return this.nodes.filter(node => node.selected);
  }

  /** Clear the current selection. */
  public clearSelection() {
    this.nodes.forEach(n => { n.selected = false; });
  }
}
