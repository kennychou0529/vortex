import Node from './Node';

export default interface Terminal {
  // Node this terminal belongs to
  readonly node: Node;

  // Coordinates of terminal, relative to the node
  readonly x: number;
  readonly y: number;
}
