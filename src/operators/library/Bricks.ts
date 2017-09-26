import { DataType, Operator, Output, Parameter, ParameterType } from '..';
import { GraphNode } from '../../graph';
import { Expr } from '../../render/Expr';
import Renderer, { ShaderResource } from '../../render/Renderer';
import ShaderAssembly from '../../render/ShaderAssembly';

interface Resources {
  shader: ShaderResource;
}

class Bricks extends Operator {
  public readonly outputs: Output[] = [{
    id: 'out',
    name: 'Out',
    type: DataType.SCALAR,
  }];
  public readonly params: Parameter[] = [
    {
      id: 'count_x',
      name: 'Count X',
      type: ParameterType.INTEGER,
      min: 1,
      max: 16,
      default: 2,
    },
    {
      id: 'count_y',
      name: 'Count Y',
      type: ParameterType.INTEGER,
      min: 1,
      max: 16,
      default: 4,
    },
    {
      id: 'spacing_x',
      name: 'Spacing X',
      type: ParameterType.FLOAT,
      min: 0,
      max: .5,
      default: .025,
    },
    {
      id: 'spacing_y',
      name: 'Spacing Y',
      type: ParameterType.FLOAT,
      min: 0,
      max: .5,
      default: .05,
    },
    {
      id: 'blur_x',
      name: 'Blur X',
      type: ParameterType.FLOAT,
      min: 0,
      max: .5,
      default: .1,
    },
    {
      id: 'blur_y',
      name: 'Blur Y',
      type: ParameterType.FLOAT,
      min: 0,
      max: .5,
      default: .2,
    },
    {
      id: 'offset_x',
      name: 'Offset X',
      type: ParameterType.FLOAT,
      min: 0,
      max: .5,
    },
    {
      id: 'offset_y',
      name: 'Offset Y',
      type: ParameterType.FLOAT,
      min: 0,
      max: .5,
    },
    {
      id: 'stagger',
      name: 'Stagger',
      type: ParameterType.FLOAT,
      min: 0,
      max: 1,
      default: .5,
    },
    {
      id: 'corner',
      name: 'Corner Shape',
      type: ParameterType.INTEGER,
      enumVals: [
        { name: 'Square', value: 0 },
        { name: 'Mitered', value: 1 },
        { name: 'Rounded', value: 2 },
      ],
      default: 0,
    },
  ];
  public readonly description = `
Generates a pattern consisting of alternating rows of bricks.
`;

  private commonSrc: string = require('./shaders/bricks.glsl');

  constructor() {
    super('pattern', 'Bricks', 'pattern_bricks');
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

  public readOutputValue(assembly: ShaderAssembly, node: GraphNode, output: string): Expr {
    if (assembly.start(node)) {
      assembly.declareUniforms(this, node.id, this.params);
      assembly.addCommon(this.id, this.commonSrc);
      assembly.finish(node);
    }

    // TODO: type conversion
    const args = [
      assembly.literal('vTextureCoord'),
      ...this.params.map(param => assembly.ident(this.uniformName(node.id, param.id))),
    ];
    return assembly.call('bricks', args);
  }

  // Release any GL resources we were holding on to.
  public cleanup(renderer: Renderer, node: GraphNode, resources: Resources) {
    if (resources.shader) {
      renderer.deleteShaderProgram(resources.shader);
      delete resources.shader;
    }
  }
}

export default new Bricks();
