import { observable } from 'mobx';
import Renderer from '../render/Renderer';
import InputTerminal from './InputTerminal';
import { Operator } from './Operator';
import OutputTerminal from './OutputTerminal';

/** A node in the graph. */
export default class Node {
  // Unique ID of this node
  public id: string;

  // Node coordinates
  @observable public x: number = 0;
  @observable public y: number = 0;

  // Node i/o
  public inputs: InputTerminal[] = [];
  public outputs: OutputTerminal[] = [];

  // Node parameters
  @observable public paramValues: { [name: string]: any } = {};

  // Node selection state
  @observable public selected: boolean = false;

  // Preview needs recalculation
  public modified: boolean;

  // Defines what this node does.
  public readonly operator: Operator;

  // GL resources allocated by the operator for this node.
  private resources: any;

  constructor(operator: Operator) {
    this.operator = operator;
    this.resources = {};
    (operator.inputs || []).forEach(input => {
      this.inputs.push(new InputTerminal(this));
    });
    (operator.outputs || []).forEach(output => {
      this.outputs.push(new OutputTerminal(this));
    });
  }

  // The human-readable name of this node.
  public get name(): string {
    return this.operator.name;
  }

  public render(renderer: Renderer) {
    this.operator.render(renderer, this, this.resources);
  }

  public destroy(renderer: Renderer) {
    this.operator.cleanup(renderer, this, this.resources);
  }

  // TODO: serialize
}
