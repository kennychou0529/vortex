// import { vec4 } from 'gl-matrix';
import { DataType, Operator, Output, Parameter, ParameterType } from '..';
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
      type: ParameterType.INTEGER,
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
  ];
  public readonly description = `
Generates a simple gradient.
`;

  private commonSrc: string = require('./shaders/gradient.glsl');

  constructor() {
    super('generator', 'Gradient', 'generator_gradient');
  }

  // Render a node with the specified renderer.
  public render(renderer: Renderer, node: GraphNode, resources: Resources) {
    const fragmentSrc = this.build(node);
    if (!resources.shader) {
      resources.shader = renderer.compileShaderProgram(
        require('./shaders/Basic.vs'),
        fragmentSrc);
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
    if (assembly.start(node.id)) {
      assembly.declareUniforms(this, node.id, this.params);
      assembly.addCommon(this.id, this.commonSrc);
      assembly.finish(node.id);
    }

    // TODO: type conversion
    const args = [
      assembly.literal('vTextureCoord'),
      ...this.params.map(param => assembly.ident(this.uniformName(node.id, param.id))),
    ];
    return assembly.call('gradient', args);
  }
}

export default new Gradient();
