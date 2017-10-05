import { ColorGradient, RGBAColor } from '../components/controls/colors';
import { GraphNode } from '../graph';
import { DataType } from '../operators';
import GLResources from './GLResources';

export interface ShaderResource {
  program: WebGLProgram;
  fragment: WebGLShader;
}

/** Renders a node into an HTML canvas element. */
export default class Renderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private vertexShader: WebGLShader;
  private tiling: number;
  private vertexBuffers: WebGLBuffer[];

  constructor() {
    this.canvas = document.createElement('canvas');
    this.gl = this.canvas.getContext('webgl2') as WebGLRenderingContext;
    this.tiling = 1;
    const gl = this.gl;
    this.vertexBuffers = [
      null,
      this.createBuffer(1),
      this.createBuffer(2),
      this.createBuffer(3),
    ];
    this.vertexShader = this.compileShader(gl.VERTEX_SHADER, `#version 300 es
in vec4 aVertexPosition;
in vec4 aTextureCoords;
out highp vec2 vTextureCoord;

void main() {
  vTextureCoord = aTextureCoords.xy;
  gl_Position = aVertexPosition;
}`);
  }

  public setTiling(tiling: number) {
    this.tiling = tiling;
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

    if (!node.glResources) {
      node.glResources = new GLResources();
    }

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
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers[this.tiling]);

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

    gl.drawArrays(gl.TRIANGLES, 0, this.tiling ** 2 * 6);
  }

  public setShaderUniforms(node: GraphNode, program: WebGLProgram) {
    const params = node.operator.paramList;
    const paramValues = node.paramValues;
    const gl = this.gl;
    for (const param of params) {
      const value = paramValues.has(param.id)
          ? paramValues.get(param.id)
          : param.default;
      const uniformName = node.operator.uniformName(node.id, param.id);
      switch (param.type) {
        case DataType.INTEGER:
          gl.uniform1i(gl.getUniformLocation(program, uniformName),
              value !== undefined ? value : 0);
          break;
        case DataType.FLOAT:
          gl.uniform1f(gl.getUniformLocation(program, uniformName),
              value !== undefined ? value : 0);
          break;
        case DataType.RGBA:
          if (value !== undefined) {
            gl.uniform4f(
                gl.getUniformLocation(program, uniformName),
                value[0], value[1], value[2], value[3]);
          } else {
            gl.uniform4f(gl.getUniformLocation(program, uniformName), 0, 0, 0, 1);
          }
          break;
        case DataType.RGBA_GRADIENT: {
          // Shader requires a fixed-length array of 32 entries. Copy the colors into the
          // array and then pad the rest of the array with the final color;
          const gradient: ColorGradient = value !== undefined ? value : [];
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
        case DataType.IMAGE: {
          gl.activeTexture(gl.TEXTURE0);
          if (value) {
            gl.bindTexture(gl.TEXTURE_2D, node.glResources.textures.get(param.id));
          } else {
            gl.bindTexture(gl.TEXTURE_2D, null);
          }
          gl.uniform1i(gl.getUniformLocation(program, uniformName), 0);
          break;
        }
      }
    }
  }

  public compileShaderProgram(fsSource: string): ShaderResource {
    const gl = this.gl;
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
      gl.attachShader(shaderProgram, this.vertexShader);
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
      fragment: fragmentShader,
    };
  }

  public deleteResources(resources: GLResources) {
    this.deleteShaderResources(resources);
    this.deleteTextureResources(resources);
  }

  public deleteShaderProgram(resource: ShaderResource) {
    const gl = this.gl;
    gl.deleteProgram(resource.program);
    gl.deleteShader(resource.fragment);
  }

  public deleteShaderResources(resources: ShaderResource) {
    const gl = this.gl;
    if (resources) {
      if (resources.program) {
        gl.deleteProgram(resources.program);
        resources.program = null;
      }
      if (resources.fragment) {
        gl.deleteProgram(resources.fragment);
        resources.fragment = null;
      }
    }
  }

  public deleteTextureResources(resources: GLResources) {
    const gl = this.gl;
    if (resources) {
      resources.textures.forEach(texture => gl.deleteTexture(texture));
      resources.textures.clear();
    }
  }

  public loadTexture(file: Blob, callback: (texture: WebGLTexture) => void) {
    const gl = this.gl;

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const pixel = new Uint8Array([0, 100, 0, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

    const image = new Image();
    image.onload = function() {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        gl.generateMipmap(gl.TEXTURE_2D);
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
      callback(texture);
    };

    const reader = new FileReader();
    reader.onload = function(event) {
      image.src = (event.target as any).result;
    };
    reader.readAsDataURL(file);
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

  private createBuffer(tiling: number): WebGLBuffer {
    const gl = this.gl;
    const positions: number[] = [];
    for (let y = 0; y < tiling; y += 1) {
      const y0 = y * 2 / tiling - 1;
      const y1 = (y + 1) * 2 / tiling - 1;
      for (let x = 0; x < tiling; x += 1) {
        const x0 = x * 2 / tiling - 1;
        const x1 = (x + 1) * 2 / tiling - 1;
        positions.splice(positions.length, 0,
          x0, y0, 0, 1,
          x0, y1, 0, 0,
          x1, y0, 1, 1,

          x0, y1, 0, 0,
          x1, y0, 1, 1,
          x1, y1, 1, 0,
        );
      }
    }
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    return buffer;
  }
}

function isPowerOf2(value: number) {
  return (value & (value - 1)) === 0;
}
