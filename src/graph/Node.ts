import { observable } from 'mobx';
import Renderer from '../render/Renderer';
import InputTerminal from './InputTerminal';
import { Operator } from './Operator';
import OutputTerminal from './OutputTerminal';
import Terminal from './Terminal';

type Watcher = () => void;

/** A node in the graph. */
export default class Node {
  // Unique ID of this node within the graph
  public id: number;

  // Node coordinates
  @observable public x: number = 0;
  @observable public y: number = 0;

  // Node i/o
  public inputs: InputTerminal[] = [];
  public outputs: OutputTerminal[] = [];

  // Node parameters
  @observable public paramValues: Map<string, any> = new Map();

  // Node selection state
  @observable public selected: boolean = false;

  // Preview needs recalculation
  public modified: boolean;

  // Defines what this node does.
  public readonly operator: Operator;

  // GL resources allocated by the operator for this node.
  private resources: any;

  // List of entities that need to be notified when any of the node properties change.
  private watchers: Set<Watcher> = new Set();

  constructor(operator: Operator) {
    this.operator = operator;
    this.resources = {};
    let y = 30;
    (operator.inputs || []).forEach(input => {
      this.inputs.push(new InputTerminal(this, input.name, input.id, -18, y));
      y += 36;
    });
    y = 30;
    (operator.outputs || []).forEach(output => {
      this.outputs.push(new OutputTerminal(this, output.name, output.id, 92, y));
      y += 36;
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

  public findInputTerminal(id: string): InputTerminal {
    return this.inputs.find(t => t.id === id);
  }

  public findOutputTerminal(id: string): OutputTerminal {
    return this.outputs.find(t => t.id === id);
  }

  public findTerminal(id: string): Terminal {
    return this.findInputTerminal(id) || this.findInputTerminal(id);
  }

  public setModified() {
    if (!this.modified) {
      this.modified = true;
      for (const out of this.outputs) {
        out.node.setModified();
      }
      window.requestAnimationFrame(() => {
        if (this.modified) {
          this.modified = false;
          this.watchers.forEach(watcher => { watcher(); });
        }
      });
    }
  }

  public watch(watcher: Watcher) {
    this.watchers.add(watcher);
  }

  public unwatch(watcher: Watcher) {
    this.watchers.delete(watcher);
  }

  public toJs(): any {
    const params: any = {};
    this.operator.params.forEach(param => {
      if (this.paramValues.has(param.id)) {
        params[param.id] = this.paramValues.get(param.id);
      } else if (param.default !== undefined) {
        params[param.id] = param.default;
      }
    });
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      operator: this.operator.id,
      params,
    };
  }
}
