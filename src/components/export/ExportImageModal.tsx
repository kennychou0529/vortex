import bind from 'bind-decorator';
// import * as classNames from 'classnames';
import { Component, h } from 'preact';
import { observer } from 'preact-mobx';
import { GraphNode } from '../../graph';
import Modal from '../controls/Modal';
import RenderedImage from '../RenderedImage';

import './ExportImageModal.scss';

interface Props {
  show: boolean;
  onHide: () => void;
  node: GraphNode;
}

interface State {
  size: number;
}

@observer
export default class ExportImageModal extends Component<Props, State> {
  constructor() {
    super();
    this.state = {
      size: 512,
    };
  }

  public render({ node, show, onHide }: Props, { size }: State) {
    return (
      <Modal className="export-image" open={show} onHide={onHide} >
        <Modal.Header>Generated shader code for {node.operator.name}:{node.id}</Modal.Header>
        <Modal.Body>
          <RenderedImage node={node} width={size} height={size} />
        </Modal.Body>
        <Modal.Footer className="modal-buttons">
          <button className="close" onClick={onHide}>Close</button>
          <button className="close" onClick={this.onClickDownload}>Download</button>
        </Modal.Footer>
      </Modal>
    );
  }

  @bind
  private onClickDownload(e: MouseEvent) {
    this.props.onHide();
    // this.setState({ showSource: true });
  }
}
