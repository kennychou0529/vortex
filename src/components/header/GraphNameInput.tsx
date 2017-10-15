import { action } from 'mobx';
import { Component, h } from 'preact';
import { Graph } from '../../graph';

interface Props {
  graph: Graph;
}

interface State {
  name: string;
}

export default class GraphNameInput extends Component<Props, State> {
  public render({ graph }: Props) {
    return (
      <input
          className="name-input"
          type="text"
          value={graph.name}
          onBlur={this.onBlur}
          onKeyDown={this.onKeyDown}
          maxLength={64}
      />
    );
  }

  @action.bound
  private onBlur() {
    const { graph } = this.props;
    graph.name = (this.base as HTMLInputElement).value;
    graph.modified = true;
  }

  @action.bound
  private onKeyDown(e: KeyboardEvent) {
    if (e.keyCode === 13) {
      const { graph } = this.props;
      graph.name = (this.base as HTMLInputElement).value;
      graph.modified = true;
      this.base.blur();
    }
  }
}
