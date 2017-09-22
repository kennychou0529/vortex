import Node from './Node';

export default interface Terminal {
  // Node this terminal belongs to
  readonly node: Node;

  // Id of terminal within that node.
  readonly id: string;

  // Coordinates of terminal, relative to the node
  readonly x: number;
  readonly y: number;

  // human-readable name of this terminal
  readonly name: string;

  // Whether this is an input or output terminal
  readonly output: boolean;
}
