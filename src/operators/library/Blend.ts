// import { vec4 } from 'gl-matrix';
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
        { name: 'Identity', value: 0 },
        { name: 'Add', value: 1 },
        { name: 'Subtract', value: 2 },
        { name: 'Multiply', value: 3 },
        { name: 'Difference', value: 4 },
        { name: 'Screen', value: 5 },
        { name: 'Overlay', value: 6 },
        { name: 'Dodge', value: 7 },
        { name: 'Burn', value: 8 },
      ],
      default: 0,
    },
  ];
  public readonly description = `
Blends two source images, similar to layer operations in GIMP or PhotoShop.
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
    return assembly.call('blend', [inputA, inputB, op]);
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
