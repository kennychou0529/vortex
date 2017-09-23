import { observable } from 'mobx';
import AbstractTerminal from './AbstractTerminal';
import { Connection } from './Connection';
import { ChangeType, GraphNode } from './GraphNode';

export class OutputTerminal extends AbstractTerminal {
  // List of output connections
  @observable public connections: Connection[] = [];

  constructor(node: GraphNode, name: string, id: string, x: number, y: number) {
    super(node, name, id, x, y, true);
  }

  /** Delete a connection from the list of connections. */
  public disconnect(connection: Connection): boolean {
    connection.source.node.notifyChange(ChangeType.CONNECTION_CHANGED);
    connection.dest.node.notifyChange(ChangeType.CONNECTION_CHANGED);
    const index = this.connections.findIndex(conn => conn.dest === connection.dest);
    if (index >= 0) {
      this.connections.splice(index, 1);
      return true;
    }
    return false;
  }
}
