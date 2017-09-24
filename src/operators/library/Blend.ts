import { DataType, Input, Operator, Output, Parameter, ParameterType } from '..';
import { GraphNode } from '../../graph';
import { Expr } from '../../render/Expr';
import Renderer, { ShaderResource } from '../../render/Renderer';
import ShaderAssembly from '../../render/ShaderAssembly';

interface Resources {
  shader: ShaderResource;
}

class Blend extends Operator {
  public readonly inputs: Input[] = [
    {
      id: 'a',
      name: 'A',
      type: DataType.RGBA,
    },
    {
      id: 'b',
      name: 'B',
      type: DataType.RGBA,
    },
  ];
  public readonly outputs: Output[] = [{
    id: 'out',
    name: 'Out',
    type: DataType.RGBA,
  }];
  public readonly params: Parameter[] = [
    {
      id: 'op',
      name: 'Operator',
      type: ParameterType.INTEGER,
      enumVals: [
        { name: 'Add', value: 1 },
        { name: 'Subtract', value: 2 },
        { name: 'Multiply', value: 3 },
        { name: 'Difference', value: 4 },
        { name: 'Lighten', value: 10 },
        { name: 'Darken', value: 11 },
        { name: 'Screen', value: 20 },
        { name: 'Overlay', value: 21 },
        { name: 'Color Dodge', value: 22 },
        { name: 'Color Burn', value: 23 },
      ],
      default: 1,
    },
    {
      id: 'strength',
      name: 'Strength',
      type: ParameterType.FLOAT,
      min: 0,
      max: 1,
      default: 1,
    },
    {
      id: 'norm',
      name: 'Normalize',
      type: ParameterType.INTEGER,
      enumVals: [
        { name: 'Off', value: 0 },
        { name: 'On', value: 1 },
      ],
      default: 1,
    },
  ];
  public readonly description = `
Blends two source images, similar to layer operations in GIMP or PhotoShop.
* *strength* affects how much of the original image shows through.
* *normalize* controls whether the result is clamped to a [0..1] range.
`;

  private commonSrc: string = require('./shaders/blend.glsl');

  constructor() {
    super('filter', 'Blend', 'filter_blend');
  }

  // Render a node with the specified renderer.
  public render(renderer: Renderer, node: GraphNode, resources: Resources) {
    if (!resources.shader) {
      const fragmentSrc = this.build(node);
      resources.shader = renderer.compileShaderProgram(
        require('./shaders/Basic.vs'),
        fragmentSrc);
    }

    const program: WebGLProgram = resources.shader.program;
    renderer.executeShaderProgram(resources.shader, gl => {
      // Set the uniforms for this node and all upstream nodes.
      renderer.setShaderUniforms(
          this.params,
          program,
          node.paramValues,
          this.uniformPrefix(node.id));
      node.visitUpstreamNodes((upstream, termId) => {
        const upstreamOp = upstream.operator;
        renderer.setShaderUniforms(
            upstreamOp.params,
            program,
            upstream.paramValues,
            upstreamOp.uniformPrefix(upstream.id));
      });
    });
  }

  public readOutputValue(assembly: ShaderAssembly, node: GraphNode, output: string): Expr {
    if (assembly.start(node.id)) {
      assembly.declareUniforms(this, node.id, this.params);
      assembly.addCommon(this.id, this.commonSrc);
      assembly.finish(node.id);
    }

    // TODO: type conversion
    const inputA = assembly.readInputValue(node, 'a');
    const inputB = assembly.readInputValue(node, 'b');
    const op = assembly.ident(this.uniformName(node.id, 'op'));
    const strength = assembly.ident(this.uniformName(node.id, 'strength'));
    const norm = assembly.ident(this.uniformName(node.id, 'norm'));
    return assembly.call('blend', [inputA, inputB, op, strength, norm]);
  }

  // Release any GL resources we were holding on to.
  public cleanup(renderer: Renderer, node: GraphNode, resources: Resources) {
    if (resources.shader) {
      renderer.deleteShaderProgram(resources.shader);
      delete resources.shader;
    }
  }

  protected addHelperFuncs(node: GraphNode, assembly: ShaderAssembly) {
    assembly.addCommon(this.id, this.commonSrc);
  }
}

export default new Blend();
