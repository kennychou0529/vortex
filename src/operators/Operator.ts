import { GraphNode } from '../graph';
import { Expr } from '../render/Expr';
import Renderer, { ShaderResource } from '../render/Renderer';
import ShaderAssembly from '../render/ShaderAssembly';
import { Input } from './Input';
import { Output } from './Output';
import { Parameter } from './Parameter';

/** Defines a type of node. */
export abstract class Operator {
  public readonly group: string;  // Which group, e.g. 'math', 'generator', 'filter', 'display'
  public readonly name: string;   // Type name, e.g. 'noise'
  public readonly id: string;     // Unique id of this operator
  public readonly inputs?: Input[] = [];
  public readonly outputs?: Output[] = [];
  public readonly params?: Parameter[] = [];
  public abstract readonly description?: string;

  constructor(group: string, name: string, id: string) {
    this.group = group;
    this.name = name;
    this.id = id;
  }

  // Render a node with the specified renderer.
  public abstract render(renderer: Renderer, node: GraphNode, resources: any): void;

  // Set the shader uniform values in preparation for rendering.
  public setUniformValues(renderer: Renderer, node: GraphNode, shader: ShaderResource) {
    renderer.setShaderUniforms(
        this.params, shader.program, node.paramValues, this.uniformPrefix(node.id));
  }

  // Release any GL resources we were holding on to.
  public abstract cleanup(renderer: Renderer, node: GraphNode, resources: any): void;

  /** Locate an operator input by id. */
  public getInput(id: string): Input {
    const result = this.inputs && this.inputs.find(i => i.id === id);
    if (!result) {
      throw Error(`Operator input not found: ${this.id}:${id}`);
    }
    return result;
  }

  /** Locate an operator output by id. */
  public getOutput(id: string): Output {
    const result = this.outputs && this.outputs.find(i => i.id === id);
    if (!result) {
      throw Error(`Operator outputs not found: ${this.id}:${id}`);
    }
    return result;
  }

  /** Returns an expression object representing the output of this node. */
  public abstract readOutputValue(assembly: ShaderAssembly, node: GraphNode, output: string): Expr;

  /** Build the shader for this operator and its current input connections.
      The shader will include the source for this operator and any operators it depends on.
      If an input is buffered, then it will not include the code to generate that input,
      but rather generate a reference to a texture sampler which contains the buffered result. */
  public build(node: GraphNode): string {
    if (this.outputs.length > 0) {
      const assembly = new ShaderAssembly();
      assembly.main(this.readOutputValue(assembly, node, this.outputs[0].id));
      // assembly.dump();
      // console.log(assembly.toString());
      return assembly.toString();
    }
  }

  public localPrefix(nodeId: number) {
    const opName = this.id.slice(0, 1).toUpperCase() + this.id.slice(1);
    return `t${opName}${nodeId}`;
  }

  public uniformPrefix(nodeId: number) {
    const opName = this.id.slice(0, 1).toUpperCase() + this.id.slice(1);
    return `u${opName}${nodeId}`;
  }

  public uniformName(nodeId: number, param: Parameter | string) {
    if (typeof param === 'string') {
      return `${this.uniformPrefix(nodeId)}_${param}`;
    }
    return `${this.uniformPrefix(nodeId)}_${param.id}`;
  }
}
