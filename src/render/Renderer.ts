import { mat4 } from 'gl-matrix';
import Node from '../graph/Node';
import { Parameter, ParameterType } from '../graph/Operator';

export interface ShaderResource {
  program: WebGLProgram;
  vertex: WebGLShader;
  fragment: WebGLShader;
}

/** Renders a node into an HTML canvas element. */
export default class Renderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private unitSquare: WebGLBuffer;
  private viewMatrix: mat4;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.gl = this.canvas.getContext('webgl');

    // Allocate a buffer containing a unit square
    const gl = this.gl;
    const positions = [
      -1, -1, 0, 0,
      -1, 1, 0, 1,
      1, -1, 1, 0,
      1, 1, 1, 1,
    ];
    this.unitSquare = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.unitSquare);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    this.viewMatrix = mat4.create();
    mat4.identity(this.viewMatrix);
  }

  public render(node: Node, width: number, height: number, out: CanvasRenderingContext2D) {
    this.canvas.width = width;
    this.canvas.height = height;

    const gl = this.gl;
    gl.viewport(0, 0, width, height);
    // gl.clearColor(0.0, 0.0, 0.4, 1.0);  // Clear to black, fully opaque
    gl.clear(gl.COLOR_BUFFER_BIT);

    node.render(this);
    out.drawImage(this.canvas, 0, 0);
  }

  public setShaderUniforms(
    params: Parameter[],
    resource: ShaderResource,
    paramValues: Map<string, any> = new Map(),
    paramPrefix: string) {
    const gl = this.gl;
    for (const param of params) {
      const value = paramValues.has(param.id)
          ? paramValues.get(param.id)
          : param.default !== undefined ? param.default : 0;
      switch (param.type) {
        case ParameterType.INTEGER:
          gl.uniform1i(
            gl.getUniformLocation(resource.program, `u${paramPrefix}_${param.id}`),
            value);
        case ParameterType.FLOAT:
          gl.uniform1f(
            gl.getUniformLocation(resource.program, `u${paramPrefix}_${param.id}`),
            value);
      }
    }
  }

  public executeShaderProgram(
      resource: ShaderResource,
      setShaderVars?: (gl: WebGLRenderingContext) => void) {
    const gl = this.gl;

    gl.useProgram(resource.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.unitSquare);

    // Set up the vertex buffer
    const vertexPosition = gl.getAttribLocation(resource.program, 'aVertexPosition');
    gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 4 * 4, 0);
    gl.enableVertexAttribArray(vertexPosition);

    const textureCoords = gl.getAttribLocation(resource.program, 'aTextureCoords');
    gl.vertexAttribPointer(textureCoords, 2, gl.FLOAT, false, 4 * 4, 2 * 4);
    gl.enableVertexAttribArray(textureCoords);

    // Set up the view transform
    // gl.uniformMatrix4fv(
    //   gl.getUniformLocation(resource.program, 'uViewMatrix'), false, this.viewMatrix);
    if (setShaderVars) {
      setShaderVars(gl);
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  public compileShaderProgram(vsSource: string, fsSource: string): ShaderResource {
    const gl = this.gl;
    const vertexShader = this.compileShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }

    return {
      program: shaderProgram,
      vertex: vertexShader,
      fragment: fragmentShader,
    };
  }

  public deleteShaderProgram(resource: ShaderResource) {
    const gl = this.gl;
    gl.deleteProgram(resource.program);
    gl.deleteShader(resource.fragment);
    gl.deleteShader(resource.vertex);
  }

  private compileShader(type: number, source: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
}
