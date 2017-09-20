// import { vec4 } from 'gl-matrix';
import Renderer from '../../render/Renderer';
import Node from '../Node';
import { DataType, Operator, Output, Parameter, ParameterType } from '../Operator';

class Bricks implements Operator {
  public readonly group: string = 'generators';
  public readonly name: string = 'Bricks';
  public readonly outputs: Output[] = [{
    id: 'out',
    name: 'Out',
    type: DataType.SCALAR,
  }];
  public readonly params: Parameter[] = [
    {
      id: 'count_x',
      name: 'Count X',
      type: ParameterType.INTEGER,
      min: 1,
      max: 16,
      default: 2,
    },
    {
      id: 'count_y',
      name: 'Count Y',
      type: ParameterType.INTEGER,
      min: 1,
      max: 16,
      default: 4,
    },
    {
      id: 'spacing_x',
      name: 'Spacing X',
      type: ParameterType.FLOAT,
      min: 0,
      max: .5,
      default: .025,
    },
    {
      id: 'spacing_y',
      name: 'Spacing Y',
      type: ParameterType.FLOAT,
      min: 0,
      max: .5,
      default: .05,
    },
    {
      id: 'blur_x',
      name: 'Blur X',
      type: ParameterType.FLOAT,
      min: 0,
      max: .5,
      default: .1,
    },
    {
      id: 'blur_y',
      name: 'Blur Y',
      type: ParameterType.FLOAT,
      min: 0,
      max: .5,
      default: .2,
    },
    {
      id: 'offset_x',
      name: 'Offset X',
      type: ParameterType.FLOAT,
      min: 0,
      max: .5,
    },
    {
      id: 'offset_y',
      name: 'Offset Y',
      type: ParameterType.FLOAT,
      min: 0,
      max: .5,
    },
    {
      id: 'stagger',
      name: 'Stagger',
      type: ParameterType.FLOAT,
      min: 0,
      max: 1,
      default: .5,
    },
    {
      id: 'corner',
      name: 'Corner Shape',
      type: ParameterType.INTEGER,
      enumVals: [
        { name: 'Square', value: 1 },
        { name: 'Mitered', value: 2 },
        { name: 'Rounded', value: 3 },
      ],
      default: 0,
    },
  ];

  // Render a node with the specified renderer.
  public render(renderer: Renderer, node: Node, resources: any) {
    if (!resources.shader) {
      resources.shader = renderer.compileShaderProgram(
        require('./Basic.vs'),
        require('./Bricks.fs'));
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

export default new Bricks();
