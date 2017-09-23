// import { vec4 } from 'gl-matrix';
import Renderer from '../../render/Renderer';
import Node from '../Node';
import { DataType, Input, Operator, Output, Parameter, ParameterType } from '../Operator';

class Blend implements Operator {
  public readonly group: string = 'filter';
  public readonly name: string = 'Blend';
  public readonly id: string = 'filter.blend';
  public readonly inputs: Input[] = [
    {
      id: 'a',
      name: 'A',
      type: DataType.RGBA,
    },
    {
      id: 'b',
      name: 'B',
      type: DataType.RGBA,
    },
  ];
  public readonly outputs: Output[] = [{
    id: 'out',
    name: 'Out',
    type: DataType.RGBA,
  }];
  public readonly params: Parameter[] = [
    {
      id: 'op',
      name: 'Operator',
      type: ParameterType.INTEGER,
      enumVals: [
        { name: 'Identity', value: 0 },
        { name: 'Add', value: 1 },
        { name: 'Subtract', value: 2 },
        { name: 'Multiply', value: 3 },
        { name: 'Divide', value: 4 },
        { name: 'Difference', value: 5 },
        { name: 'Screen', value: 6 },
        { name: 'Overlay', value: 7 },
        { name: 'Dodge', value: 8 },
        { name: 'Burn', value: 9 },
      ],
      default: 0,
    },
  ];
  public readonly description = `
Blends two source images, similar to layer operations in GIMP or PhotoShop.
`;

  // Render a node with the specified renderer.
  public render(renderer: Renderer, node: Node, resources: any) {
    if (!resources.shader) {
      resources.shader = renderer.compileShaderProgram(
        require('./shaders/Basic.vs'),
        require('./shaders/Blend.glsl'));
    }

    renderer.executeShaderProgram(resources.shader, gl => {
      renderer.setShaderUniforms(this.params, resources.shader, node.paramValues, 'Bricks');
    });
  }

  // Release any GL resources we were holding on to.
  public cleanup(renderer: Renderer, node: Node, resources: any) {
    renderer.deleteShaderProgram(resources.shader);
    delete resources.shader;
  }
}

export default new Blend();
