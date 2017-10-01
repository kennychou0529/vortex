import { DataType, Input, Operator, Output, Parameter } from '..';
import { GraphNode } from '../../graph';
import { Expr } from '../../render/Expr';
import Renderer, { ShaderResource } from '../../render/Renderer';
import ShaderAssembly from '../../render/ShaderAssembly';

interface Resources {
  shader: ShaderResource;
}

class Modulus extends Operator {
  public readonly inputs: Input[] = [
    {
      id: 'input',
      name: 'In',
      type: DataType.FLOAT,
    },
  ];
  public readonly outputs: Output[] = [{
    id: 'out',
    name: 'Out',
    type: DataType.RGBA,
  }];
  public readonly params: Parameter[] = [
    {
      id: 'frequency',
      name: 'Frequency',
      type: DataType.INTEGER,
      min: 1,
      max: 100,
      default: 2,
    },
    {
      id: 'offset',
      name: 'Offset',
      type: DataType.FLOAT,
      min: 0,
      max: 1,
      precision: 2,
      increment: .01,
      default: 0,
    },
    {
      id: 'phase',
      name: 'Phase',
      type: DataType.FLOAT,
      min: 0,
      max: 1,
      precision: 2,
      increment: .01,
      default: 1,
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
Performs a modulus operation on the input. A monotonically increasing input signal will be
converted into a sequence of sawtooth waves.
* **frequency** - indicates how often the input value should repeat.
* **offset** - amount to be added to the value before applying the mod operator.
* **phase** - used to control where the 'peak' of the output is within the interval. Setting
  the value to 1 produces a sawtooth wave, while setting it to .5 will produce a triangle wave.
* **color** - maps the output value through a gradient.
`;

  constructor() {
    super('filter', 'Modulus', 'filter_modulus');
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

  public readOutputValue(assembly: ShaderAssembly, node: GraphNode, out: string, uv: Expr): Expr {
    if (assembly.start(node)) {
      assembly.declareUniforms(this, node.id, this.params);
      assembly.addCommon('gradient-color.glsl', require('./shaders/gradient-color.glsl'));
      assembly.addCommon('modulus.glsl', require('./shaders/modulus.glsl'));
      assembly.finish(node);
    }

    const colorName = this.uniformName(node.id, 'color');
    return assembly.call('modulus', [
      assembly.readInputValue(node, 'input', DataType.FLOAT, uv),
      assembly.ident(this.uniformName(node.id, 'frequency'), DataType.FLOAT),
      assembly.ident(this.uniformName(node.id, 'offset'), DataType.FLOAT),
      assembly.ident(this.uniformName(node.id, 'phase'), DataType.FLOAT),
      assembly.ident(`${colorName}_colors`, DataType.OTHER),
      assembly.ident(`${colorName}_positions`, DataType.OTHER),
    ], DataType.RGBA);
  }

  // Release any GL resources we were holding on to.
  public cleanup(renderer: Renderer, node: GraphNode, resources: Resources) {
    if (resources.shader) {
      renderer.deleteShaderProgram(resources.shader);
      delete resources.shader;
    }
  }
}

export default new Modulus();
