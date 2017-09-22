precision mediump float;

vec4 blend(
  vec4 a,
  vec4 b,
  int op) {
  vec4 value;
  if (op == 0) { // Identity
    value = a;
  } else if (op == 1) { // Add
    value = min(a + b, vec4(1.0, 1.0, 1.0, 1.0));
  } else if (op == 2) { // Subtract
    value = max(a - b, vec4(0.0, 0.0, 0.0, 0.0));
  } else if (op == 3) { // Multiply
    value = a * b;
  } else if (op == 4) { // Divide
  } else if (op == 5) { // Difference
  } else if (op == 6) { // Screen
  } else if (op == 7) { // Overlay
  } else if (op == 8) { // Dodge
  } else if (op == 9) { // Burn
  }

  return value;
}

void main() {
  gl_FragColor = vec4(0., 0., 0., 0.);
}
