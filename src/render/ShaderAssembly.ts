import { GraphNode } from '../graph';
import { DataType, Operator, Parameter, ParameterType } from '../operators';
import { Assignment, CallExpr, Expr, ExprKind, IdentExpr, LiteralExpr } from './Expr';

export enum TraversalState {
  IN_PROCESS,
  FINISHED,
}

/** Represents a combined shader from several operators. */
export default class ShaderAssembly {
  private traversalState = new Map<number, TraversalState>();
  private common = new Set<string>();
  private assignmentList: Assignment[] = [];
  private cachedValues = new Set<string>();
  private out: string[] = ['precision mediump float;\n'];
  private indentLevel: number = 0;

  public toString() {
    return this.out.join('\n');
  }

  public dump() {
    const s = this.toString();
    s.split('\n').forEach((line, i) => {
      console.debug(line);
      // console.debug(`${i + 1}: ${line}`);
    });
  }

  /** Indicate that we are beginning the compilation for a node. Use for de-duping and loop
      detection. */
  public start(node: GraphNode): boolean {
    const state = this.traversalState.get(node.id);
    if (state === undefined) {
      this.traversalState.set(node.id, TraversalState.IN_PROCESS);
      return true;
    }
    return false;
  }

  /** Indicate that we have finished compilation for a node. */
  public finish(node: GraphNode) {
    const state = this.traversalState.get(node.id);
    if (state === undefined) {
      this.traversalState.set(node.id, TraversalState.FINISHED);
    }
  }

  /** Add a common function to the shader source. */
  public addCommon(opId: string, src: string) {
    if (!this.common.has(opId)) {
      this.common.add(opId);
      this.out.push(`// Common code for ${opId}`);
      this.out.push(src);
    }
  }

  /** Construct a call expression. */
  public call(funcName: string, args: Expr[]): CallExpr {
    return { kind: ExprKind.CALL, funcName, args };
  }

  /** Construct an identifier expression. */
  public ident(name: string): IdentExpr {
    return { kind: ExprKind.IDENT, name };
  }

  /** Construct a literal expression. */
  public literal(value: string): LiteralExpr {
    return { kind: ExprKind.LITERAL, value };
  }

  /** Construct a reference to a uniform. */
  public uniform(op: Operator, nodeId: number, param: Parameter): IdentExpr {
    return { kind: ExprKind.IDENT, name: op.uniformName(nodeId, param) };
  }

  /** Return an expression representing the input to a terminal. This is the same as the
      value from the connected output terminal, unless the input is not connected in Which
      case the expression is zero. Also handles de-duping of expressions that are used in
      more than one place. */
  // TODO: type conversion
  public readInputValue(node: GraphNode, signalName: string, type?: DataType): Expr {
    const operator = node.operator;
    const input = operator.getInput(signalName);
    const inputTerminal = node.findInputTerminal(signalName);
    if (inputTerminal.connection === null) {
      switch (input.type) {
        case DataType.SCALAR: return this.literal('0.0');
        case DataType.RGBA: return this.literal('vec4(0., 0, 0., 0.)');
        case DataType.XYZW: return this.literal('vec4(0., 0, 0., 0.)');
      }
    }
    const outputTerminal = inputTerminal.connection.source;
    const outputNode = outputTerminal.node;
    const outputDefn = outputNode.operator.getOutput(outputTerminal.id);
    const outputType = this.outputDataType(outputDefn.type);
    if (outputTerminal.connections.length > 1) {
      const cachedValueId = `${outputNode.operator.localPrefix(node.id)}_${outputTerminal.id}`;
      if (!this.cachedValues.has(cachedValueId)) {
        this.cachedValues.add(cachedValueId);
        this.assignmentList.push({
          name: cachedValueId,
          type: outputType,
          value: outputNode.operator.readOutputValue(this, outputNode, outputTerminal.id),
        });
        return this.ident(cachedValueId);
      }
      return this.ident(cachedValueId);
    }
    return outputNode.operator.readOutputValue(this, outputNode, outputTerminal.id);
  }

  /** Assign shader uniform names for all of the parameters of the operator. */
  public declareUniforms(op: Operator, nodeId: number, params: Parameter[]) {
    this.out.push(`// Uniforms for ${op.id}${nodeId}`);
    for (const param of params) {
      this.addUniform(op, nodeId, param);
    }
    this.out.push('');
  }

  /** Assign a shader uniform names for an operator parameter. */
  public addUniform(op: Operator, nodeId: number, param: Parameter) {
    const uniformName = op.uniformName(nodeId, param);
    if (param.type === ParameterType.COLOR_GRADIENT) {
      this.out.push(`uniform vec4 ${uniformName}_colors[32];`);
      this.out.push(`uniform float ${uniformName}_positions[32];`);
    } else {
      this.out.push(`uniform ${this.paramDataType(param.type)} ${uniformName};`);
    }
  }

  /** Generate code for the shader's main function */
  public main(expr: Expr) {
    this.out.push('varying highp vec2 vTextureCoord;');
    this.out.push('');
    this.out.push('void main() {');
    this.indentLevel = 2;
    this.assignmentList.forEach(assigment => {
      this.out.push(`  vec4 ${assigment.name} = ${this.emitExpr(assigment.value)};`);
    });
    this.out.push(`  gl_FragColor = ${this.emitExpr(expr)};`);
    this.out.push('}');
  }

  public emitExpr(e: Expr): string {
    switch (e.kind) {
      case ExprKind.IDENT: {
        return (e as IdentExpr).name;
      }
      case ExprKind.LITERAL: {
        return (e as LiteralExpr).value;
      }
      case ExprKind.CALL: {
        const call = e as CallExpr;
        const result: string[] = [];
        result.push(call.funcName);
        result.push('(\n');
        this.indentLevel += 2;
        call.args.forEach((arg, i) => {
          if (i > 0) {
            result.push(',\n');
          }
          result.push(' '.repeat(this.indentLevel));
          result.push(this.emitExpr(arg));
        });
        this.indentLevel -= 2;
        result.push(')');
        return result.join('');
      }
    }
  }

  private paramDataType(type: ParameterType) {
    switch (type) {
      case ParameterType.FLOAT: return 'float';
      case ParameterType.COLOR: return 'vec4';
      case ParameterType.INTEGER: return 'int';
    }
  }

  private outputDataType(type: DataType) {
    switch (type) {
      case DataType.SCALAR: return 'float';
      case DataType.RGBA: return 'vec4';
      case DataType.XYZW: return 'vec4';
    }
  }
}
