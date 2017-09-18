import Renderer from '../render/Renderer';
import Node from './Node';

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

export enum ParamType {
  INTEGER,  // Integer
  FLOAT,    // Floating-point
  COLOR,    // Color
  COLOR_GRADIENT,  // Color gradient
  ENUM,     // Enumeration
}

export interface Parameter {
  // Variable name of this parameter
  id: string;

  // Human-readable name of this parameter
  name: string;

  // Parameter type
  type: ParamType;

  // Type-specific constraints
  minVal?: number;
  maxVal?: number;
  enumVals: Array<{ name: string, value: number }>;
}

/** Defines a type of node. */
export interface Operator {
  group: string;  // Which group, e.g. 'math', 'generator', 'filter', 'display'
  name: string;   // Type name, e.g. 'noise'
  inputs?: Input[];
  outputs?: Output[];
  params?: Parameter[];

  // Render a node with the specified renderer.
  render(renderer: Renderer, node: Node, resources: any): void;

  // Release any GL resources we were holding on to.
  cleanup(renderer: Renderer, node: Node, resources: any): void;
}
