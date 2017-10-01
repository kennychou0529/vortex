import { DataType, Operator, Output, Parameter } from '..';
import { GraphNode } from '../../graph';
import { Expr } from '../../render/Expr';
import Renderer, { ShaderResource } from '../../render/Renderer';
import ShaderAssembly from '../../render/ShaderAssembly';

interface Resources {
  shader: ShaderResource;
}

class Gradient extends Operator {
  public readonly outputs: Output[] = [{
    id: 'out',
    name: 'Out',
    type: DataType.RGBA,
  }];
  public readonly params: Parameter[] = [
    {
      id: 'type',
      name: 'Gradient Type',
      type: DataType.INTEGER,
      enumVals: [
        { name: 'Linear Horizontal', value: 0 },
        { name: 'Linear Vertical', value: 1 },
        { name: 'Symmetric Horizontal', value: 2 },
        { name: 'Symmetric Vertical', value: 3 },
        { name: 'Radial', value: 4 },
        { name: 'Square', value: 5 },
      ],
      default: 0,
    },
    {
      id: 'color',
      name: 'Gradient color',
      type: DataType.RGBA_GRADIENT,
      max: 32,
      default: [
        {
          value: [0, 0, 0, 1],
          position: 0,
        },
        {
          value: [1, 1, 1, 1],
          position: 1,
        },
      ],
    },
  ];
  public readonly description = `
Generates a simple gradient.
`;

  constructor() {
    super('generator', 'Gradient', 'generator_gradient');
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

  public readOutputValue(assembly: ShaderAssembly, node: GraphNode, out: string, uv: Expr): Expr {
    if (assembly.start(node)) {
      assembly.declareUniforms(this, node.id, this.params);
      assembly.addCommon('gradient-color.glsl', require('./shaders/gradient-color.glsl'));
      assembly.addCommon('gradient.glsl', require('./shaders/gradient.glsl'));
      assembly.finish(node);
    }

    const colorName = this.uniformName(node.id, 'color');
    const args: Expr[] = [
      uv,
      assembly.ident(this.uniformName(node.id, 'type'), DataType.FLOAT),
      assembly.ident(`${colorName}_colors`, DataType.OTHER),
      assembly.ident(`${colorName}_positions`, DataType.OTHER),
    ];
    return assembly.call('gradient', args, DataType.RGBA);
  }
}

export default new Gradient();
