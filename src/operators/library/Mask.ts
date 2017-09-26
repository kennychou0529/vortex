import { DataType, Input, Operator, Output, Parameter, ParameterType } from '..';
import { GraphNode } from '../../graph';
import { Expr } from '../../render/Expr';
import Renderer, { ShaderResource } from '../../render/Renderer';
import ShaderAssembly from '../../render/ShaderAssembly';

interface Resources {
  shader: ShaderResource;
}

class Mask extends Operator {
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
    {
      id: 'mask',
      name: 'Mask',
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
      id: 'invert',
      name: 'Invert',
      type: ParameterType.INTEGER,
      enumVals: [
        { name: 'Off', value: 0 },
        { name: 'On', value: 1 },
      ],
      default: 0,
    },
  ];
  public readonly description = `
Blends two source images based on a grayscale mask.
`;

  constructor() {
    super('filter', 'Mask', 'filter_mask');
  }

  // Render a node with the specified renderer.
  public render(renderer: Renderer, node: GraphNode, resources: Resources) {
    if (!resources.shader) {
      resources.shader = renderer.compileShaderProgram(this.build(node));
    }

    if (resources.shader) {
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
  }

  public readOutputValue(assembly: ShaderAssembly, node: GraphNode, output: string): Expr {
    if (assembly.start(node)) {
      assembly.declareUniforms(this, node.id, this.params);
      assembly.addCommon('mask.glsl', require('./shaders/mask.glsl'));
      assembly.finish(node);
    }

    // TODO: type conversion
    const inputA = assembly.readInputValue(node, 'a', DataType.RGBA);
    const inputB = assembly.readInputValue(node, 'b', DataType.RGBA);
    const mask = assembly.readInputValue(node, 'mask', DataType.SCALAR);
    const invert = assembly.ident(this.uniformName(node.id, 'invert'));
    return assembly.call('mask', [inputA, inputB, mask, invert]);
  }

  // Release any GL resources we were holding on to.
  public cleanup(renderer: Renderer, node: GraphNode, resources: Resources) {
    if (resources.shader) {
      renderer.deleteShaderProgram(resources.shader);
      delete resources.shader;
    }
  }
}

export default new Mask();
