import bind from 'bind-decorator';
import { Component, h } from 'preact';
import { observer } from 'preact-mobx';
import { GraphNode } from '../graph';
import Modal from './controls/Modal';

import './NodeActions.scss';

interface Props {
  node: GraphNode;
}

interface State {
  showSource: boolean;
}

@observer
export default class PropertyPanel extends Component<Props, State> {
  constructor() {
    super();
    this.state = {
      showSource: false,
    };
  }

  public render({ node }: Props, { showSource }: State) {
    return (
      <section className="node-actions">
        <section className="button-group">
          <button>1x1</button>
          <button>2x2</button>
          <button>3x3</button>
        </section>
        <div className="spacer" />
        <button onClick={this.onClickShowSource}>Shader source...</button>
        <Modal className="shader-source" open={showSource} onHide={this.onHideSource} >
          <Modal.Header>Generated shader code for {node.operator.name}:{node.id}</Modal.Header>
          <Modal.Body>
            <section class="source-scroll">
              <table className="source">
                <tbody>
                  {showSource && node.operator.build(node).split('\n').map((line, i) => (
                    <tr key={`${i}`}>
                      <td className="index">{i + 1}</td>
                      <td className="text">{line}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </Modal.Body>
          <Modal.Footer>
            <button className="close" onClick={this.onClickCloseSource}>Close</button>
          </Modal.Footer>
        </Modal>
      </section>
    );
  }

  @bind
  private onClickShowSource(e: MouseEvent) {
    this.setState({ showSource: true });
  }

  @bind
  private onClickCloseSource(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ showSource: false });
  }

  @bind
  private onHideSource() {
    this.setState({ showSource: false });
  }
}
