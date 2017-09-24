import { Component, h } from 'preact';
import { observer } from 'preact-mobx';
import { Graph } from '../graph';
import PropertyEditor from './propedit/PropertyEditor';
import RenderedImage from './RenderedImage';

import './PropertyPanel.scss';

interface Props {
  graph: Graph;
}

@observer
export default class PropertyPanel extends Component<Props, undefined> {
  public render({ graph }: Props) {
    const selection = graph.selection;
    const selectedNode = selection.length === 1 ? selection[0] : null;
    return (
      <aside id="property-panel">
        {selectedNode && <PropertyEditor node={selectedNode} />}
        <section className="buttons">
          <section className="button-group">
            <button>1x1</button>
            <button>2x2</button>
            <button>3x3</button>
          </section>
          <div className="spacer" />
          <button>Shader source...</button>
        </section>
        {selectedNode && <RenderedImage node={selectedNode} width={320} height={320} />}
      </aside>
    );
  }
}
