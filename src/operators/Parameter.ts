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

/** Defines an operator parameter. */
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
