import bind from 'bind-decorator';
import { Component, h } from 'preact';
import { Graph } from '../graph';
import { Operator } from '../operators';
import GraphActions from './catalog/GraphActions';
import OperatorCatalog from './catalog/OperatorCatalog';
import OperatorDetails from './catalog/OperatorDetails';

import './ToolPanel.scss';

interface Props {
  graph: Graph;
}

interface State {
  operator: Operator;
}

export default class ToolPanel extends Component<Props, State> {
  constructor() {
    super();
    this.state = {
      operator: null,
    };
  }

  public render({ graph }: Props, { operator }: State) {
    return (
      <aside id="tool-panel">
        <GraphActions graph={graph} />
        <OperatorCatalog
            selected={operator}
            onSelect={this.onSelectorOperator}
        />
        <OperatorDetails operator={operator} />
      </aside>
    );
  }

  @bind
  private onSelectorOperator(id: string) {
    this.setState({ operator: this.context.registry.get(id) });
  }
}
