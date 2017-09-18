import { DataType, Operator, Output } from '../Operator';

class Bricks implements Operator {
  public readonly group: string = 'generators';
  public readonly name: string = 'Bricks';
  public readonly outputs: Output[] = [{
    id: 'out',
    name: 'Out',
    type: DataType.SCALAR,
  }];
}

export default new Bricks();
