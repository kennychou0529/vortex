import Node from '../../graph/Node';

/** Renders a node into a bitmap. */
export default class Renderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.gl = this.canvas.getContext('webgl');
  }

  public render(node: Node, width: number, height: number, out: CanvasRenderingContext2D) {
    this.canvas.width = width;
    this.canvas.height = height;

    const gl = this.gl;
    gl.clearColor(1.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clear(gl.COLOR_BUFFER_BIT);

    out.drawImage(this.canvas, 0, 0, width, height);
  }
}
