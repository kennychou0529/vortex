precision mediump float;

// Uniforms for pattern_bricks1
uniform int uBricks_count_x;
uniform int uBricks_count_y;
uniform float uBricks_spacing_x;
uniform float uBricks_spacing_y;
uniform float uBricks_blur_x;
uniform float uBricks_blur_y;
uniform float uBricks_offset_x;
uniform float uBricks_offset_y;
uniform float uBricks_stagger;
uniform int uBricks_corner;

varying highp vec2 vTextureCoord;

vec4 bricks(
    vec2 uv,
    int xCount,
    int yCount,
    float xSpacing,
    float ySpacing,
    float xBlur,
    float yBlur,
    float xOffset,
    float yOffset,
    float stagger,
    int corner) {
  float y = (uv.y + yOffset) * float(yCount);
  float yr = floor(y);
  float yi = floor(y + 0.5);
  float yf = smoothstep(ySpacing, ySpacing + yBlur, abs(y - yi));
  float x = (uv.x + xOffset) * float(xCount) + (floor(yr * 0.5) * 2.0 == yr ? stagger : 0.0);
  float xi = floor(x + 0.5);
  float xf = smoothstep(xSpacing, xSpacing + xBlur, abs(x - xi));
  float value;
  if (corner == 1) { // Mitered
    value = max(0., (xf + yf) - 1.0);
  } else if (corner == 2) { // Rounded
    value = max(0., 1. - sqrt((1.-xf) * (1.-xf) + (1.-yf) * (1.-yf)));
  } else { // Sqare
    value = min(xf, yf);
  }
  return vec4(vec3(1.0, 1.0, 1.0) * value, 1);
}

void main() {
  gl_FragColor = bricks(
      vTextureCoord,
      uBricks_count_x,
      uBricks_count_y,
      uBricks_spacing_x,
      uBricks_spacing_y,
      uBricks_blur_x,
      uBricks_blur_y,
      uBricks_offset_x,
      uBricks_offset_y,
      uBricks_stagger,
      uBricks_corner);
}
