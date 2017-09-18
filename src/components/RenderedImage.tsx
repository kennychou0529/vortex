import { Component, h } from 'preact';
import Node from '../graph/Node';
import Renderer from '../render/Renderer';

interface Props {
  node: Node;
  width: number;
  height: number;
}

export default class RenderedImage extends Component<Props, undefined> {
  private canvas: HTMLCanvasElement;

  public componentDidMount() {
    const { node } = this.props;
    const renderer: Renderer = this.context.renderer;
    const context = this.canvas.getContext('2d');
    renderer.render(node, this.canvas.clientWidth, this.canvas.offsetHeight, context);
  }

  public render({ width, height }: Props) {
    return (
      <canvas
          className="rendered-image"
          width={width}
          height={height}
          ref={el => this.canvas = el as HTMLCanvasElement}
      />
    );
  }
}
