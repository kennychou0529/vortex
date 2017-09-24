import { ColorGradient, RGBAColor } from '../components/controls/colors';
import { GraphNode } from '../graph';
import { Parameter, ParameterType } from '../operators';

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

    // TODO: Create vertex arrays for 2x2, 3x3 etc.
  }

  public render(
      node: GraphNode,
      width: number,
      height: number, out: CanvasRenderingContext2D,
      rebuildShader: boolean = false) {
    this.canvas.width = width;
    this.canvas.height = height;

    const gl = this.gl;
    gl.viewport(0, 0, width, height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (rebuildShader) {
      node.destroy(this);
    }
    node.render(this);
    out.drawImage(this.canvas, 0, 0);
  }

  public executeShaderProgram(
      resource: ShaderResource,
      setShaderVars?: (gl: WebGLRenderingContext) => void) {

    // This will happen if the shader failed to compile.
    if (resource === null) {
      return;
    }

    const gl = this.gl;

    gl.useProgram(resource.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.unitSquare);

    // Set up the vertex buffer
    const vertexPosition = gl.getAttribLocation(resource.program, 'aVertexPosition');
    gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 4 * 4, 0);
    gl.enableVertexAttribArray(vertexPosition);

    const textureCoords = gl.getAttribLocation(resource.program, 'aTextureCoords');
    if (textureCoords >= 0) {
      // If there's no generators connected, then no texture coords.
      gl.vertexAttribPointer(textureCoords, 2, gl.FLOAT, false, 4 * 4, 2 * 4);
      gl.enableVertexAttribArray(textureCoords);
    }

    if (setShaderVars) {
      setShaderVars(gl);
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  public setShaderUniforms(
    params: Parameter[],
    program: WebGLProgram,
    paramValues: Map<string, any> = new Map(),
    paramPrefix: string) {
    const gl = this.gl;
    for (const param of params) {
      const value = paramValues.has(param.id)
          ? paramValues.get(param.id)
          : param.default !== undefined ? param.default : 0;
      const uniformName = `${paramPrefix}_${param.id}`;
      switch (param.type) {
        case ParameterType.INTEGER:
          gl.uniform1i(gl.getUniformLocation(program, uniformName), value);
          break;
        case ParameterType.FLOAT:
          gl.uniform1f(gl.getUniformLocation(program, uniformName), value);
          break;
        case ParameterType.COLOR_GRADIENT: {
          // Shader requires a fixed-length array of 32 entries. Copy the colors into the
          // array and then pad the rest of the array with the final color;
          const gradient: ColorGradient = value;
          const colors: RGBAColor[] = [];
          const positions: number[] = [];
          let lastColor: RGBAColor = [0, 0, 0, 1];
          gradient.forEach((cs, i) => {
            const color = Array.from(cs.value) as RGBAColor;
            if (colors.length < 32) {
              if (i === 0 && cs.position > 0) {
                colors.push(color);
                positions.push(0);
              }
              colors.push(color);
              positions.push(cs.position);
              lastColor = color;
            }
          });
          while (colors.length < 32) {
            colors.push(lastColor);
            positions.push(1);
          }
          // Trick with concat() to flatten the color array.
          gl.uniform4fv(
              gl.getUniformLocation(program, `${uniformName}_colors`),
              [].concat(...colors));
          gl.uniform1fv(gl.getUniformLocation(program, `${uniformName}_positions`), positions);
          break;
        }
      }
    }
  }

  public compileShaderProgram(vsSource: string, fsSource: string): ShaderResource {
    const gl = this.gl;
    const vertexShader = this.compileShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!fragmentShader) {
      console.error('Compilation failed');
      console.debug(fsSource);
      return null;
      // console.log(fragmentShader);
      //
      // const compiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
      // console.log('Shader compiled successfully: ' + compiled);
      // const compilationLog = gl.getShaderInfoLog(fragmentShader);
      // console.log('Shader compiler log: ' + compilationLog);
    }

    // Create the shader program
    const shaderProgram = gl.createProgram();
    try {
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);
    } catch (e) {
      console.log(e);
      console.debug(fsSource);
      return null;
    }

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
