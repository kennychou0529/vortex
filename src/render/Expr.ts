export enum ExprKind {
  CALL,
  LITERAL,
  IDENT,
}

export interface Expr {
  kind: ExprKind;
}

export interface IdentExpr extends Expr {
  kind: ExprKind.IDENT;
  name: string;
}

export interface LiteralExpr extends Expr {
  kind: ExprKind.LITERAL;
  value: string;
}

export interface CallExpr extends Expr {
  kind: ExprKind.CALL;
  funcName: string;
  args: Expr[];
}

export interface Assignment {
  type: string;
  name: string;
  value: Expr;
}
