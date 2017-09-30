import { DataType, Input, Operator, Output, Parameter, ParameterType } from '..';
import { GraphNode } from '../../graph';
import { Expr } from '../../render/Expr';
import Renderer, { ShaderResource } from '../../render/Renderer';
import ShaderAssembly from '../../render/ShaderAssembly';

interface Resources {
  shader: ShaderResource;
}

class NormalMap extends Operator {
  public readonly inputs: Input[] = [
    {
      id: 'in',
      name: 'In',
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
      id: 'scale',
      name: 'Height Scale',
      type: ParameterType.FLOAT,
      min: -0.5,
      max: 0.5,
      precision: 3,
      increment: 0.01,
      default: 0.2,
    },
  ];

  public readonly description = `
Treating the grayscale input as a height map, computes normals.
`;

  constructor() {
    super('filter', 'Normal Map', 'filter_normal_map');
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
        // gl.hint(ext.FRAGMENT_SHADER_DERIVATIVE_HINT_OES, gl.NICEST);
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
      assembly.finish(node);
    }

    const inputA = assembly.readInputValue(node, 'in', DataType.RGBA, uv);
    const scale = this.uniformName(node.id, 'scale');
    const t = `${this.localPrefix(node.id)}_t`;
    const h = `${this.localPrefix(node.id)}_h`;
    const dx = `${this.localPrefix(node.id)}_dx`;
    const dy = `${this.localPrefix(node.id)}_dy`;
    const normal = `${this.localPrefix(node.id)}_normal`;
    assembly.assign(t, 'vec4', inputA);
    assembly.assign(h, 'float',
        assembly.literal(`(${t}.x + ${t}.y + ${t}.z) * ${scale} / 3.0`, DataType.SCALAR));
    assembly.assign(dx, 'vec3',
        assembly.literal(`dFdx(vec3(vTextureCoord, ${h}))`, DataType.XYZ));
    assembly.assign(dy, 'vec3',
        assembly.literal(`dFdy(vec3(vTextureCoord, ${h}))`, DataType.XYZ));
    assembly.assign(normal, 'vec3',
        assembly.literal(`normalize(cross(${dx}, ${dy}))`, DataType.XYZ));
    return assembly.literal(`vec4(${normal} * vec3(-0.5, 0.5, 0.5) + 0.5, 1.0)`, DataType.XYZW);
  }

  // Release any GL resources we were holding on to.
  public cleanup(renderer: Renderer, node: GraphNode, resources: Resources) {
    if (resources.shader) {
      renderer.deleteShaderProgram(resources.shader);
      delete resources.shader;
    }
  }
}

export default new NormalMap();
