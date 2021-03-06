import bind from 'bind-decorator';
import * as download from 'downloadjs';
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
  private static readonly sizes = [64, 128, 256, 512, 1024, 2048];

  private image: RenderedImage;

  constructor() {
    super();
    this.state = {
      size: 512,
    };
  }

  public render({ node, show, onHide }: Props, { size }: State) {
    return (
      <Modal className="export-image" open={show} onHide={onHide} >
        <Modal.Header>Generated image for {node.operator.name}:{node.id}</Modal.Header>
        <Modal.Body>
          <RenderedImage node={node} width={size} height={size} ref={el => { this.image = el; }}/>
        </Modal.Body>
        <Modal.Footer className="modal-buttons">
          <select onChange={this.onChangeSize}>
            {ExportImageModal.sizes.map(sz => {
              const ss = sz.toString();
              return <option selected={size === sz} key={ss} value={ss}>{ss} x {ss}</option>;
            })}
          </select>
          <button className="close" onClick={onHide}>Close</button>
          <button className="close" onClick={this.onClickDownload}>Download</button>
        </Modal.Footer>
      </Modal>
    );
  }

  @bind
  private onClickDownload(e: MouseEvent) {
    const { node } = this.props;
    this.image.canvas.toBlob(img => {
      download(img, `${node.name}-${node.id}.png`, 'image/png');
    }, 'image/png');
  }

  @bind
  private onChangeSize(e: any) {
    this.setState({ size: Number(e.target.value) });
  }
}
