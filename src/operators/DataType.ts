/** Data types for expressions. */
export enum DataType {
  SCALAR, // Scalar per pixel
  UV,     // vec2
  XYZ,    // vec3
  XYZW,   // For normal and displacement maps
  RGBA,   // vec4 rgba
  OTHER,  // Placeholder, not used as operator output
}
