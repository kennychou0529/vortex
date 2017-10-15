import { action, computed, observable } from 'mobx';
import { DataType, Registry } from '../operators';
import { Bounds } from './Bounds';
import { Connection } from './Connection';
import { ChangeType, GraphNode } from './GraphNode';
import { InputTerminal } from './InputTerminal';
import { OutputTerminal } from './OutputTerminal';
import { Terminal } from './Terminal';

const DOC_WIDTH = 4000;

export class Graph {
  @observable public name: string;
  @observable public author: string;
  @observable public id: string;
  @observable.shallow public nodes: GraphNode[];
  @observable public bounds: Bounds;
  @observable public modified: boolean = false;
  @observable public ownedByUser: boolean = false;

  private nodeCount = 0;

  constructor() {
    this.name = 'untitled';
    this.nodes = [];
    this.bounds = new Bounds(-DOC_WIDTH / 2, -DOC_WIDTH / 2, DOC_WIDTH / 2, DOC_WIDTH / 2);
  }

  /** Add a node to the list. */
  public add(node: GraphNode) {
    if (node.id === undefined) {
      this.nodeCount += 1;
      node.id = this.nodeCount;
    } else {
      this.nodeCount = Math.max(this.nodeCount, node.id + 1);
    }
    this.nodes.push(node);
    this.modified = true;
  }

  /** Locate a node by id. */
  public findNode(id: number): GraphNode {
    return this.nodes.find(n => n.id === id);
  }

  /** Locate a terminal by id. */
  public findTerminal(nodeId: number, terminalId: string): Terminal {
    const node = this.findNode(nodeId);
    return node && node.findTerminal(terminalId);
  }

  public connect(
      srcNode: GraphNode | number, srcTerm: string, dstNode: GraphNode | number, dstTerm: string) {
    const sn: GraphNode = typeof(srcNode) === 'number' ? this.findNode(srcNode) : srcNode;
    const dn: GraphNode = typeof(dstNode) === 'number' ? this.findNode(dstNode) : dstNode;
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
    src.node.notifyChange(ChangeType.CONNECTION_CHANGED);
    dst.node.notifyChange(ChangeType.CONNECTION_CHANGED);
    this.modified = true;
  }

  /** Return a list of all selected nodes. */
  @computed public get selection(): GraphNode[] {
    return this.nodes.filter(node => node.selected);
  }

  /** Clear the current selection. */
  public clearSelection() {
    this.nodes.forEach(n => { n.selected = false; });
  }

  @action
  public deleteSelection() {
    // Disconnect all selected nodes
    this.selection.forEach(node => {
      node.outputs.forEach(output => {
        output.connections.forEach(connection => {
          output.disconnect(connection);
        });
      });
      node.inputs.forEach(input => {
        if (input.connection) {
          input.connection.source.disconnect(input.connection);
        }
      });
      // Release any rendering resources
      node.setDeleted();
    });
    // Delete all selected nodes
    this.nodes = this.nodes.filter(n => !n.selected);
    this.modified = true;
  }

  @action
  public clear() {
    this.nodes.forEach(node => {
      node.outputs.forEach(output => {
        output.connections.forEach(connection => {
          output.disconnect(connection);
        });
      });
      node.inputs.forEach(input => {
        if (input.connection) {
          input.connection.source.disconnect(input.connection);
        }
      });
      // Release any rendering resources
      node.setDeleted();
    });
    this.nodes = [];
    this.modified = true;
  }

  @computed public get asJson() {
    return this.toJs();
  }

  public toJs(): any {
    const connections: any[] = [];
    this.nodes.forEach(node => {
      node.outputs.forEach(output => {
        output.connections.forEach(connection => {
          connections.push({
            source: {
              node: connection.source.node.id,
              terminal: connection.source.id,
            },
            destination: {
              node: connection.dest.node.id,
              terminal: connection.dest.id,
            },
          });
        });
      });
    });
    return {
      name: this.name,
      nodes: this.nodes.map(node => node.toJs()),
      connections,
    };
  }

  public fromJs(json: any, registry: Registry) {
    if (typeof json.name === 'string') {
      this.name = json.name;
    }
    json.nodes.forEach((node: any) => {
      const n = new GraphNode(registry.get(node.operator));
      n.id = node.id;
      n.x = node.x;
      n.y = node.y;
      n.operator.params.forEach(param => {
        if (param.type === DataType.GROUP) {
          param.children.forEach(childParam => {
            if (childParam.id in node.params) {
              n.paramValues.set(childParam.id, node.params[childParam.id]);
            }
          });
        } else if (param.id in node.params) {
          n.paramValues.set(param.id, node.params[param.id]);
        }
      });
      this.add(n);
    });
    json.connections.forEach((connection: any) => {
      this.connect(
        connection.source.node, connection.source.terminal,
        connection.destination.node, connection.destination.terminal);
    });
    this.modified = false;
  }
}
