import { Component, h } from 'preact';
import { observer } from 'preact-mobx';
import Graph from '../graph/Graph';
import ColorPicker from './controls/ColorPicker';
import GradientSlider from './controls/GradientSlider';
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
    const properties = selectedNode ? selectedNode.operator.params : [];
    return (
      <aside id="property-panel">
        <section className="property-editor">
          <header>{selectedNode && selectedNode.name}</header>
          {properties.map(prop => (
            <div className="prop" key={prop.id}>{prop.name}</div>
          ))}
          <ColorPicker red={0} green={0} blue={0} onChange={() => null} />
        </section>
        {selectedNode && <RenderedImage node={selectedNode} width={320} height={320} />}
      </aside>
    );
  }
}
