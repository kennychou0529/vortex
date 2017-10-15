import bind from 'bind-decorator';
import { Component, h } from 'preact';
import { observer } from 'preact-mobx';
import { Graph } from '../../graph';
import User from '../../user/User';
import Modal from '../controls/Modal';
import LoadGraphDialog from './LoadGraphDialog';

import './GraphActions.scss';

interface Props {
  graph: Graph;
  graphId: string;
  onSave: () => void;
  onNew: () => void;
}

interface State {
  showConfirmClear: boolean;
  showDownload: boolean;
  showLoad: boolean;
  repeat: number;
}

@observer
export default class GraphActions extends Component<Props, State> {
  private downloadEl: HTMLAnchorElement;

  constructor() {
    super();
    this.state = {
      showConfirmClear: false,
      showDownload: false,
      showLoad: false,
      repeat: 1,
    };
  }

  public render(
      { graph, graphId }: Props,
      { showConfirmClear, showDownload, showLoad, repeat }: State) {
    const user: User = this.context.user;
    return (
      <section className="graph-actions">
        <a ref={(el: HTMLAnchorElement) => { this.downloadEl = el; }} style={{ display: 'none' }} />
        <section className="button-group">
          <button onClick={this.onClickNew}>New</button>
          {user.isLoggedIn !== false && <button onClick={this.onClickLoad}>Load&hellip;</button>}
          {graphId
            ? <button onClick={this.onClickSave}>Fork</button>
            : <button onClick={this.onClickSave}>Save</button>
          }
          <button onClick={this.onClickDownload}>Download</button>
        </section>
        <Modal className="confirm" open={showConfirmClear} onHide={this.onHideConfirmClear} >
          <Modal.Header>Clear graph</Modal.Header>
          <Modal.Body>Erase all document data?</Modal.Body>
          <Modal.Footer className="modal-buttons">
            <button className="close" onClick={this.onClickCancelClear}>Cancel</button>
            <button className="close" onClick={this.onClickConfirmClear}>Clear</button>
          </Modal.Footer>
        </Modal>
        <LoadGraphDialog open={showLoad} onHide={this.onHideLoad} />
      </section>
    );
  }

  @bind
  private onClickLoad(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ showLoad: true });
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
    const { graph } = this.props;
    const text = JSON.stringify(graph.toJs(), null, 2);
    this.downloadEl.setAttribute(
        'href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
    this.downloadEl.setAttribute('download', graph.name + '.vortex.json');
    this.downloadEl.click();
  }

  @bind
  private onClickNew() {
    this.props.onNew();
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
  private onHideLoad() {
    this.setState({ showLoad: false });
  }
}
