import { DataType, Input, Operator, Output, Parameter } from '..';
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
      type: DataType.INTEGER,
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
        renderer.setShaderUniforms(node, program);
        node.visitUpstreamNodes((upstream, termId) => {
          renderer.setShaderUniforms(upstream, program);
        });
      });
    }
  }

  public readOutputValue(assembly: ShaderAssembly, node: GraphNode, out: string, uv: Expr): Expr {
    if (assembly.start(node)) {
      assembly.declareUniforms(this, node.id, this.params);
      assembly.addCommon('mask.glsl', require('./shaders/mask.glsl'));
      assembly.finish(node);
    }

    const inputA = assembly.readInputValue(node, 'a', uv);
    const inputB = assembly.readInputValue(node, 'b', uv);
    const mask = assembly.readInputValue(node, 'mask', uv);
    const invert = assembly.uniform(node, 'invert');
    return assembly.call('mask', [inputA, inputB, mask, invert], DataType.RGBA);
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
