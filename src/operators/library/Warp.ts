import { DataType, Input, Operator, Output, Parameter, ParameterType } from '..';
import { GraphNode } from '../../graph';
import { Expr } from '../../render/Expr';
import Renderer, { ShaderResource } from '../../render/Renderer';
import ShaderAssembly from '../../render/ShaderAssembly';

interface Resources {
  shader: ShaderResource;
}

class Warp extends Operator {
  public readonly inputs: Input[] = [
    {
      id: 'in',
      name: 'In',
      type: DataType.RGBA,
    },
    {
      id: 'duv',
      name: 'dUV',
      type: DataType.XYZW,
    }];
  public readonly outputs: Output[] = [{
    id: 'out',
    name: 'Out',
    type: DataType.RGBA,
  }];
  public readonly params: Parameter[] = [
    {
      id: 'intensity',
      name: 'Intensity',
      type: ParameterType.FLOAT,
      min: 0,
      max: 1,
      precision: 2,
      increment: 0.01,
      default: 0.05,
    },
  ];

  public readonly description =
    `Dispaces the input pixels based on the normal vector of the displacement input.`;

  constructor() {
    super('transform', 'Warp', 'transform_warp');
  }

  // Render a node with the specified renderer.
  public render(renderer: Renderer, node: GraphNode, resources: Resources) {
    if (!resources.shader) {
      resources.shader = renderer.compileShaderProgram(this.build(node));
    }

    if (resources.shader) {
      const program: WebGLProgram = resources.shader.program;
      renderer.executeShaderProgram(resources.shader, gl => {
        renderer.setShaderUniforms(
            this.params,
            resources.shader.program,
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
      assembly.finish(node);
    }

    const intensity = this.uniformName(node.id, 'intensity');
    const iuv = `${this.localPrefix(node.id)}_uv`;
    assembly.assign(iuv, 'vec2', uv);
    const duv = `${this.localPrefix(node.id)}_duv`;
    assembly.assign(duv, 'vec4', assembly.readInputValue(node, 'duv', DataType.XYZW, uv));

    return assembly.readInputValue(
        node, 'in', DataType.RGBA,
        assembly.literal(
            `${iuv} + (${duv}.xy - 0.5) * vec2(1.0, -1.0) * ${intensity}`,
            DataType.UV));
  }
}

export default new Warp();
