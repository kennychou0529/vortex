export enum DataType {
  ANY,    // Can accept any input type
  SCALAR, // Scalar per pixel
  RGBA,   // vec4 rgba
  XYZW,   // For normal and displacement maps
}

/** Defines an output terminal. */
export interface Input {
  // Variable name of this input
  id: string;

  // Human-readable name of this input
  name: string;

  // Data type
  type: DataType;

  // Whether this input requires a complete buffer (for sampling and such)
  buffered?: boolean;
}

export interface Output {
  // Variable name of this output
  id: string;

  // Human-readable name of this output
  name: string;

  // Output data type
  type: DataType;
}

/** Defines a type of node. */
export interface Operator {
  group: string;  // Which group, e.g. 'math', 'generator', 'filter', 'display'
  name: string;   // Type name, e.g. 'noise'
  inputs?: Input[];
  outputs?: Output[];
}
