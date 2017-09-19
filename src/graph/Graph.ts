import { computed } from 'mobx';
import Node from './Node';

export default class Graph {
  public name: string;
  public nodes: Node[];

  constructor() {
    this.name = 'untitled';
    this.nodes = [];
  }

  /** Add a node to the list. */
  public add(node: Node) {
    this.nodes.push(node);
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
