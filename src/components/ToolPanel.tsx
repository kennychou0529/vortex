import bind from 'bind-decorator';
import { Component, h } from 'preact';
import { Operator } from '../operators';
import GraphActions from './catalog/GraphActions';
import OperatorCatalog from './catalog/OperatorCatalog';
import OperatorDetails from './catalog/OperatorDetails';

import './ToolPanel.scss';

interface State {
  operator: Operator;
}

export default class ToolPanel extends Component<undefined, State> {
  constructor() {
    super();
    this.state = {
      operator: null,
    };
  }

  public render(_: any, { operator }: State) {
    return (
      <aside id="tool-panel">
        <GraphActions graph={this.context.graph} />
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
