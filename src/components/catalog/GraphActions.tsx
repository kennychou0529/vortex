import bind from 'bind-decorator';
// import * as classNames from 'classnames';
import { Component, h } from 'preact';
import { observer } from 'preact-mobx';
import { Graph } from '../../graph';
import Modal from '../controls/Modal';

import './GraphActions.scss';

interface Props {
  graph: Graph;
  onSave: () => void;
}

interface State {
  showConfirmClear: boolean;
  showDownload: boolean;
  repeat: number;
}

@observer
export default class GraphActions extends Component<Props, State> {
  private downloadEl: HTMLAnchorElement;
  private graphNameEl: HTMLInputElement;

  constructor() {
    super();
    this.state = {
      showConfirmClear: false,
      showDownload: false,
      repeat: 1,
    };
  }

  public render({ graph }: Props, { showConfirmClear, showDownload, repeat }: State) {
    return (
      <section className="graph-actions">
        <a ref={(el: HTMLAnchorElement) => { this.downloadEl = el; }} style={{ display: 'none' }} />
        <section className="button-group">
          <button onClick={this.onClickLoad}>Load...</button>
          <button onClick={this.onClickSave} disabled={!graph.modified}>Save</button>
          <button onClick={this.onClickDownload}>Download...</button>
          <button onClick={this.onClickClear}>Clear</button>
        </section>
        <Modal className="confirm" open={showConfirmClear} onHide={this.onHideConfirmClear} >
          <Modal.Header>Clear graph</Modal.Header>
          <Modal.Body>Erase all document data?</Modal.Body>
          <Modal.Footer className="modal-buttons">
            <button className="close" onClick={this.onClickCancelClear}>Cancel</button>
            <button className="close" onClick={this.onClickConfirmClear}>Clear</button>
          </Modal.Footer>
        </Modal>
        <Modal className="download" open={showDownload} onHide={this.onHideDownload} >
          <Modal.Header>Download graph</Modal.Header>
          <Modal.Body>
            Name of this graph:
            <input
                ref={(el: HTMLInputElement) => { this.graphNameEl = el; }}
                type="text"
                value={graph.name}
                autofocus={true}
            />
          </Modal.Body>
          <Modal.Footer className="modal-buttons">
            <button className="close" onClick={this.onHideDownload}>Cancel</button>
            <button className="close" onClick={this.onClickConfirmDownload}>Download</button>
          </Modal.Footer>
        </Modal>
      </section>
    );
  }

  @bind
  private onClickLoad(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    // this.setState({ showSource: true });
  }

  @bind
  private onClickSave(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.props.onSave();
  }

  @bind
  private onClickDownload(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ showDownload: true });
  }

  @bind
  private onClickClear() {
    this.setState({ showConfirmClear: true });
  }

  @bind
  private onClickConfirmClear(e: MouseEvent) {
    this.setState({ showConfirmClear: false });
    const { graph } = this.props;
    graph.clear();
  }

  @bind
  private onClickCancelClear(e: MouseEvent) {
    this.setState({ showConfirmClear: false });
  }

  @bind
  private onHideConfirmClear() {
    this.setState({ showConfirmClear: false });
  }

  @bind
  private onClickConfirmDownload() {
    const { graph } = this.props;
    graph.name = this.graphNameEl.value;
    this.setState({ showDownload: false });

    const text = JSON.stringify(graph.toJs(), null, 2);
    this.downloadEl.setAttribute(
        'href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
    this.downloadEl.setAttribute('download', graph.name + '.vor.json');
    this.downloadEl.click();
  }

  @bind
  private onHideDownload() {
    this.setState({ showDownload: false });
  }
}
