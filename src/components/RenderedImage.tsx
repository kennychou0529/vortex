import bind from 'bind-decorator';
import { Component, h } from 'preact';
import { ChangeType, GraphNode } from '../graph';
import Renderer from '../render/Renderer';

interface Props {
  node: GraphNode;
  width: number;
  height: number;
}

export default class RenderedImage extends Component<Props, undefined> {
  private canvas: HTMLCanvasElement;

  public componentDidMount() {
    this.updateCanvas(ChangeType.CONNECTION_CHANGED);
    this.props.node.watch(this.updateCanvas);
  }

  public componentDidUpdate(prevProps: Props) {
    if (prevProps.node !== this.props.node) {
      prevProps.node.unwatch(this.updateCanvas);
      this.updateCanvas(ChangeType.CONNECTION_CHANGED);
      this.props.node.watch(this.updateCanvas);
    }
  }

  public componentWillUnmount() {
    this.props.node.unwatch(this.updateCanvas);
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

  @bind
  private updateCanvas(change: ChangeType) {
    const { node, width, height } = this.props;
    const renderer: Renderer = this.context.renderer;
    const context = this.canvas.getContext('2d');
    if (node.deleted) {
      node.destroy(renderer);
    } else {
      renderer.render(node, width, height, context, change === ChangeType.CONNECTION_CHANGED);
    }
  }
}
