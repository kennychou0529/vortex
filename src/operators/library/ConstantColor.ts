import { DataType, Operator, Output, Parameter, ParameterType } from '..';
import { GraphNode } from '../../graph';
import { Expr } from '../../render/Expr';
import Renderer, { ShaderResource } from '../../render/Renderer';
import ShaderAssembly from '../../render/ShaderAssembly';

interface Resources {
  shader: ShaderResource;
}

class ConstantColor extends Operator {
  public readonly outputs: Output[] = [{
    id: 'out',
    name: 'Out',
    type: DataType.RGBA,
  }];
  public readonly params: Parameter[] = [
    {
      id: 'color',
      name: 'Color',
      type: ParameterType.COLOR,
      default: [1.0, 1.0, 1.0, 1.0],
    },
  ];
  public readonly description = `
A constant color.
`;

  constructor() {
    super('generator', 'Constant Color', 'generator_constant_color');
  }

  // Render a node with the specified renderer.
  public render(renderer: Renderer, node: GraphNode, resources: Resources) {
    if (!resources.shader) {
      resources.shader = renderer.compileShaderProgram(this.build(node));
    }

    renderer.executeShaderProgram(resources.shader, gl => {
      renderer.setShaderUniforms(
          this.params,
          resources.shader.program,
          node.paramValues,
          this.uniformPrefix(node.id));
    });
  }

  // Release any GL resources we were holding on to.
  public cleanup(renderer: Renderer, node: GraphNode, resources: Resources) {
    if (resources.shader) {
      renderer.deleteShaderProgram(resources.shader);
      delete resources.shader;
    }
  }

  public readOutputValue(assembly: ShaderAssembly, node: GraphNode, output: string): Expr {
    if (assembly.start(node)) {
      assembly.declareUniforms(this, node.id, this.params);
      assembly.finish(node);
    }

    return assembly.literal(this.uniformName(node.id, 'color'), DataType.RGBA);
  }
}

export default new ConstantColor();
