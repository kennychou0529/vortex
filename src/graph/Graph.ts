import Node from './Node';

export default class Graph {
  public name: string;
  public nodes: Node[];

  constructor() {
    this.name = 'untitled';
    this.nodes = [];
  }
}
