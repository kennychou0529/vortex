import { vec4 } from 'gl-matrix';
import Renderer from '../../render/Renderer';
import Node from '../Node';
import { DataType, Operator, Output } from '../Operator';

class Bricks implements Operator {
  public readonly group: string = 'generators';
  public readonly name: string = 'Bricks';
  public readonly outputs: Output[] = [{
    id: 'out',
    name: 'Out',
    type: DataType.SCALAR,
  }];

  // Render a node with the specified renderer.
  public render(renderer: Renderer, node: Node, resources: any) {
    if (!resources.shader) {
      resources.shader = renderer.compileShaderProgram(
        require('./Basic.vs'),
        require('./Bricks.fs'));
    }

    renderer.executeShaderProgram(resources.shader, gl => {
      gl.uniform4fv(
        gl.getUniformLocation(resources.shader.program, 'uColor'),
        vec4.fromValues(1, 0, 0, 1));
    });
  }

  // Release any GL resources we were holding on to.
  public cleanup(renderer: Renderer, node: Node, resources: any) {
    renderer.deleteShaderProgram(resources.shader);
    delete resources.shader;
  }
}

export default new Bricks();
