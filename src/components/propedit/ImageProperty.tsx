import bind from 'bind-decorator';
import { action } from 'mobx';
import { Component, h } from 'preact';
import { ChangeType, GraphNode } from '../../graph';
import { Parameter } from '../../operators';
import ImageStore from '../../render/ImageStore';
import Renderer from '../../render/Renderer';

interface Props {
  parameter: Parameter;
  node: GraphNode;
}

interface State {
  imageName: string;
}

/** Property editor for RGBA colors. */
export default class ImageProperty extends Component<Props, State> {
  private fileEl: HTMLInputElement;

  constructor() {
    super();
    this.state = {
      imageName: null,
    };
  }

  public componentWillMount() {
    const { parameter, node } = this.props;
    const key = node.paramValues.get(parameter.id);
    this.context.imageStore.get(key, (err: any, file: File) => {
      if (err) {
        console.error(err);
      } else if (file) {
        this.setState({ imageName: file.name });
      }
    });
  }

  public render({ parameter, node }: Props, { imageName }: State) {
    return (
      <section className="image-property">
        <input
            ref={(el: HTMLInputElement) => { this.fileEl = el; }}
            type="file"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={this.onFileChanged}
        />
        <button onClick={this.onClick}>
          <span className="name">{parameter.name}:&nbsp;</span>
          <span className="value">{imageName}</span>
        </button>
      </section>
    );
  }

  @bind
  private onClick(e: MouseEvent) {
    e.preventDefault();
    this.fileEl.click();
  }

  @action.bound
  private onFileChanged(e: any) {
    const { parameter, node } = this.props;
    const imgStore: ImageStore = this.context.imageStore;
    const renderer: Renderer = this.context.renderer;
    if (this.fileEl.files.length > 0) {
      const file = this.fileEl.files[0];
      const value = imgStore.put(file, (err, id) => {
        if (err) {
          console.error(err);
          alert(err);
        } else {
          renderer.loadTexture(file, texture => {
            node.glResources.textures.set(parameter.id, texture);
            node.paramValues.set(parameter.id, value);
          });
        }
      });
    } else {
      node.paramValues.set(parameter.id, null);
    }
    node.notifyChange(ChangeType.PARAM_VALUE_CHANGED);
  }
}
