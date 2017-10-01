import { DataType, Operator, Output, Parameter } from '..';
import { GraphNode } from '../../graph';
import { Expr } from '../../render/Expr';
import Renderer, { ShaderResource } from '../../render/Renderer';
import ShaderAssembly from '../../render/ShaderAssembly';

interface Resources {
  shader: ShaderResource;
}

class Waves extends Operator {
  public readonly outputs: Output[] = [{
    id: 'out',
    name: 'Out',
    type: DataType.RGBA,
  }];

  public readonly params: Parameter[] = [
    {
      id: '0',
      name: 'Wave source 1',
      type: DataType.GROUP,
      children: [
        {
          id: 'fx0',
          name: 'X Frequency',
          type: DataType.INTEGER,
          min: -20,
          max: 20,
          default: 1,
        },
        {
          id: 'fy0',
          name: 'Y Frequency',
          type: DataType.INTEGER,
          min: -20,
          max: 20,
          default: 0,
        },
        {
          id: 'phase0',
          name: 'Phase',
          type: DataType.FLOAT,
          min: 0,
          max: 1,
          precision: 2,
          increment: 0.01,
          default: 0,
        },
      ],
    },
    {
      id: '1',
      name: 'Wave source 2',
      type: DataType.GROUP,
      children: [
        {
          id: 'fx1',
          name: 'X Frequency',
          type: DataType.INTEGER,
          min: -20,
          max: 20,
          default: 0,
        },
        {
          id: 'fy1',
          name: 'Y Frequency',
          type: DataType.INTEGER,
          min: -20,
          max: 20,
          default: 0,
        },
        {
          id: 'phase1',
          name: 'Phase',
          type: DataType.FLOAT,
          min: 0,
          max: 1,
          precision: 2,
          increment: 0.01,
          default: 0,
        },
      ],
    },
    {
      id: '0',
      name: 'Wave source 3',
      type: DataType.GROUP,
      children: [
        {
          id: 'fx2',
          name: 'X Frequency',
          type: DataType.INTEGER,
          min: 0,
          max: 10,
          default: 1,
        },
        {
          id: 'fy2',
          name: 'Y Frequency',
          type: DataType.INTEGER,
          min: -20,
          max: 20,
          default: 0,
        },
        {
          id: 'phase2',
          name: 'Phase',
          type: DataType.FLOAT,
          min: -20,
          max: 20,
          precision: 2,
          increment: 0.01,
          default: 0,
        },
      ],
    },
    {
      id: 'amplitude',
      name: 'Amplitude',
      type: DataType.FLOAT,
      min: 0,
      max: 1,
      default: 0.5,
      precision: 2,
    },
    {
      id: 'color',
      name: 'Color',
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
Sums together up to three wave generators.
`;

  constructor() {
    super('generator', 'Waves', 'generator_waves');
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

  public readOutputValue(assembly: ShaderAssembly, node: GraphNode, out: string, uv: Expr): Expr {
    if (assembly.start(node)) {
      assembly.declareUniforms(this, node.id, this.params);
      assembly.addCommon('gradient-color.glsl', require('./shaders/gradient-color.glsl'));
      assembly.addCommon('waves.glsl', require('./shaders/waves.glsl'));
      assembly.finish(node);
    }

    const colorName = this.uniformName(node.id, 'color');
    const args = [
      uv,
      assembly.uniform(node, 'fx0'),
      assembly.uniform(node, 'fy0'),
      assembly.uniform(node, 'phase0'),
      assembly.uniform(node, 'fx1'),
      assembly.uniform(node, 'fy1'),
      assembly.uniform(node, 'phase1'),
      assembly.uniform(node, 'fx2'),
      assembly.uniform(node, 'fy2'),
      assembly.uniform(node, 'phase2'),
      assembly.uniform(node, 'amplitude'),
      assembly.ident(`${colorName}_colors`, DataType.OTHER),
      assembly.ident(`${colorName}_positions`, DataType.OTHER),
    ];
    return assembly.call('waves', args, DataType.RGBA);
  }

  // Release any GL resources we were holding on to.
  public cleanup(renderer: Renderer, node: GraphNode, resources: Resources) {
    if (resources.shader) {
      renderer.deleteShaderProgram(resources.shader);
      delete resources.shader;
    }
  }
}

export default new Waves();
