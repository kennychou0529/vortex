import { Operator } from './Operator';

/** Maintains the list of operators. */
export default class Registry {
  private operators = new Map<string, Operator>();

  constructor() {
    const catalog = require.context('./operators', false, /[A-Za-z0-9_]\.ts$/);
    catalog.keys().forEach(k => {
      if (k.endsWith('.ts') && k.startsWith('./')) {
        const op = (catalog(k) as any).default as Operator;
        const id = `${op.group}/${op.name}`;
        this.operators.set(id, op);
      }
    });
  }

  public has(name: string) {
    return this.operators.has(name);
  }

  public get(name: string) {
    if (!this.operators.has(name)) {
      throw Error(`Operator not found: ${name}.`);
    }
    return this.operators.get(name);
  }

  public get list(): Operator[] {
    return Array.from(this.operators.values());
  }
}
