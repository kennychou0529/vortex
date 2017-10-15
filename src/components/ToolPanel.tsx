import bind from 'bind-decorator';
import { Component, h } from 'preact';
import { Operator } from '../operators';
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
        <section className="note">
          Drag an operator to the graph:
        </section>
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
