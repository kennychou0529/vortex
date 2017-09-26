import bind from 'bind-decorator';
// import * as classNames from 'classnames';
import { Component, h } from 'preact';
import { observer } from 'preact-mobx';
import { GraphNode } from '../../graph';
import Modal from '../controls/Modal';

import './GraphActions.scss';

interface Props {
  graph: GraphNode;
}

interface State {
  showConfirmClear: boolean;
  repeat: number;
}

@observer
export default class NodeActions extends Component<Props, State> {
  constructor() {
    super();
    this.state = {
      showConfirmClear: false,
      repeat: 1,
    };
  }

  public render({ graph }: Props, { showConfirmClear, repeat }: State) {
    return (
      <section className="graph-actions">
        <section className="button-group">
          <button onClick={this.onClickLoad}>Load...</button>
          <button onClick={this.onClickSave}>Save</button>
          <button onClick={this.onClickSaveAs}>Save As...</button>
          <button onClick={this.onClickClear}>Clear</button>
        </section>
        <Modal className="confirm" open={showConfirmClear} onHide={this.onHideConfirmClear} >
          <Modal.Header>Clear graph</Modal.Header>
          <Modal.Body>Erase all document data?</Modal.Body>
          <Modal.Footer>
            <button className="close" onClick={this.onClickCancelClear}>Cancel</button>
            <button className="close" onClick={this.onClickConfirmClear}>Clear</button>
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
    // this.setState({ showSource: false });
  }

  @bind
  private onClickSaveAs() {
    //
  }

  @bind
  private onClickClear() {
    this.setState({ showConfirmClear: true });
  }

  @bind
  private onClickConfirmClear(e: MouseEvent) {
    this.setState({ showConfirmClear: false });
  }

  @bind
  private onClickCancelClear(e: MouseEvent) {
    this.setState({ showConfirmClear: false });
  }

  @bind
  private onHideConfirmClear() {
    this.setState({ showConfirmClear: false });
  }
}
