import { DataType, Input, Operator, Output, Parameter } from '..';
import { GraphNode } from '../../graph';
import { Expr } from '../../render/Expr';
import Renderer, { ShaderResource } from '../../render/Renderer';
import ShaderAssembly from '../../render/ShaderAssembly';

interface Resources {
  shader: ShaderResource;
}

class Illuminate extends Operator {
  public readonly inputs: Input[] = [
    {
      id: 'in',
      name: 'In',
      type: DataType.RGBA,
    },
    {
      id: 'normal',
      name: 'Normal',
      type: DataType.XYZW,
    },
  ];
  public readonly outputs: Output[] = [{
    id: 'out',
    name: 'Out',
    type: DataType.RGBA,
  }];

  public readonly params: Parameter[] = [
    {
      id: 'azimuth',
      name: 'Azimuth',
      type: DataType.FLOAT,
      min: 0,
      max: 360,
      precision: 0,
      increment: 1,
      default: 45,
    },
    {
      id: 'elevation',
      name: 'Elevation',
      type: DataType.FLOAT,
      min: 0,
      max: 90,
      precision: 0,
      increment: 1,
      default: 45,
    },
    {
      id: 'shininess',
      name: 'Shininess',
      type: DataType.FLOAT,
      min: 0,
      max: 100,
      precision: 0,
      increment: 1,
      default: 0,
    },
    {
      id: 'ambient',
      name: 'Ambient Color',
      type: DataType.RGBA,
      default: [1.0, 1.0, 1.0, 1.0],
    },
    {
      id: 'diffuse',
      name: 'Diffuse Color',
      type: DataType.RGBA,
      default: [1.0, 1.0, 1.0, 1.0],
    },
    {
      id: 'specular',
      name: 'Specular Color',
      type: DataType.RGBA,
      default: [1.0, 1.0, 1.0, 1.0],
    },
  ];

  public readonly description = `
Illuminate the input texture.
`;

  constructor() {
    super('filter', 'Illuminate', 'filter_illuminate');
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
      assembly.addCommon('illuminate.glsl', require('./shaders/illuminate.glsl'));
      assembly.finish(node);
    }

    const input = assembly.readInputValue(node, 'in', DataType.RGBA, uv);
    const normal = assembly.readInputValue(node, 'normal', DataType.XYZW, uv);

    const args = [
      input,
      normal,
      ...this.params.map(param =>
          assembly.ident(this.uniformName(node.id, param.id), DataType.OTHER)),
    ];

    return assembly.call('illuminate', args, DataType.RGBA);
  }

  // Release any GL resources we were holding on to.
  public cleanup(renderer: Renderer, node: GraphNode, resources: Resources) {
    if (resources.shader) {
      renderer.deleteShaderProgram(resources.shader);
      delete resources.shader;
    }
  }
}

export default new Illuminate();
