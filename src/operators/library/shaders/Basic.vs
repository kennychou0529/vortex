attribute vec4 aVertexPosition;
attribute vec4 aTextureCoords;
varying highp vec2 vTextureCoord;

void main() {
  vTextureCoord = aTextureCoords.xy;
  gl_Position = aVertexPosition;
}
