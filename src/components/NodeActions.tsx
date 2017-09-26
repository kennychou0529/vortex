import bind from 'bind-decorator';
import * as classNames from 'classnames';
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
  repeat: number;
}

@observer
export default class NodeActions extends Component<Props, State> {
  constructor() {
    super();
    this.state = {
      showSource: false,
      repeat: 1,
    };
  }

  public render({ node }: Props, { showSource, repeat }: State) {
    return (
      <section className="node-actions">
        <section className="button-group">
          <button
              className={classNames({ selected: repeat === 1 })}
              onClick={() => this.setRepeat(1)}
          >
            1x1
          </button>
          <button
              className={classNames({ selected: repeat === 2 })}
              onClick={() => this.setRepeat(2)}
          >
            2x2
          </button>
          <button
              className={classNames({ selected: repeat === 3 })}
              onClick={() => this.setRepeat(3)}
          >
              3x3
          </button>
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

  @bind
  private setRepeat(repeat: number) {
    this.setState({ repeat });
  }
}