vec4 mask(
    vec4 a,
    vec4 b,
    vec4 mask,
    int invert) {
  float t = (mask.r + mask.g + mask.b) / 3.0;
  // if (invert !== 0) {
  //   t = 1.0 - t;
  // }
  return mix(a, b, t * mask.a);
}
