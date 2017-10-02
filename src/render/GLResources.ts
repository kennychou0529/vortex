/** Object that tracks the allocated GL resources (shaders, buffers, etc.) that are alloccated
    by a node.
*/
export default class GLResources {
  public program: WebGLProgram;
  public fragment: WebGLShader;
  public textures: Map<string, WebGLTexture> = new Map<string, WebGLTexture>();

  private textureIndex: number = 0;

  public resetTextureIndex() {
    this.textureIndex = 0;
  }

  public nextTextureIndex(): number {
    const result = this.textureIndex;
    this.textureIndex += 1;
    return result;
  }
}
