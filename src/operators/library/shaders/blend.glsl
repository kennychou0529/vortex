vec4 blend(
  vec4 a,
  vec4 b,
  int op) {
  vec3 value;
  vec3 ca = a.rgb;
  vec3 cb = b.rgb;
  const vec3 ONE = vec3(1.0, 1.0, 1.0);
  const vec3 ZERO = vec3(0.0, 0.0, 0.0);
  // const vec3 SMALL = vec3(1.0/256.0, 1.0/256.0, 1.0/256.0);
  if (op == 0) { // Identity
    value = ca * 0.5;
  } else if (op == 1) { // Add
    value = min(ca + cb, ONE);
  } else if (op == 2) { // Subtract
    value = max(ca - cb, ZERO);
  } else if (op == 3) { // Multiply
    value = ca * cb;
  } else if (op == 4) { // Difference
    value = abs(ca - cb);
  } else if (op == 5) { // Screen
    value = ONE - (ONE - ca) * (ONE - cb);
  } else if (op == 6) { // Overlay
    value = ca * (ca + 2.0 * cb * (ONE - ca));
  } else if (op == 7) { // Dodge
    // value = ca /
  } else if (op == 8) { // Burn
  }

  // TODO: Normalize

  return vec4(value, a.a);
}
