import { observable } from 'mobx';
import AbstractTerminal from './AbstractTerminal';
import Connection from './Connection';
import Node from './Node';

export default class OutputTerminal extends AbstractTerminal {
  // List of output connections
  @observable public connections: Connection[] = [];

  constructor(node: Node, name: string, id: string, x: number, y: number) {
    super(node, name, id, x, y, true);
  }

  /** Delete a connection from the list of connections. */
  public disconnect(connection: Connection): boolean {
    const index = this.connections.findIndex(conn => conn === connection);
    if (index >= 0) {
      this.connections.splice(index, 1);
      return true;
    }
    return false;
  }
}
