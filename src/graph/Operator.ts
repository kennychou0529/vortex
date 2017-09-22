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

export enum ParameterType {
  INTEGER,  // Integer or enumeration
  FLOAT,    // Floating-point
  COLOR,    // Color
  COLOR_GRADIENT,  // Color gradient
  GROUP,    // Named group of params
}

export interface EnumValue {
  name: string;
  value: number;
}

export interface Parameter {
  // Variable name of this parameter
  id: string;

  // Human-readable name of this parameter
  name: string;

  // Parameter type
  type: ParameterType;

  // Type-specific constraints
  default?: any;
  min?: number;
  max?: number;
  increment?: number;
  precision?: number;
  logScale?: boolean;
  enumVals?: EnumValue[]; // For enumerations
  children?: Parameter[];  // If this is a group
}

/** Defines a type of node. */
export interface Operator {
  group: string;  // Which group, e.g. 'math', 'generator', 'filter', 'display'
  name: string;   // Type name, e.g. 'noise'
  inputs?: Input[];
  outputs?: Output[];
  params?: Parameter[];
  description?: string;

  // Render a node with the specified renderer.
  render(renderer: Renderer, node: Node, resources: any): void;

  // Release any GL resources we were holding on to.
  cleanup(renderer: Renderer, node: Node, resources: any): void;
}
