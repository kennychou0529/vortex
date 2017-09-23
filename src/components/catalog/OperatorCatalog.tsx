import { Component, h } from 'preact';
import { Operator, Registry } from '../../operators';
import OperatorCatalogEntry from './OperatorCatalogEntry';

import './OperatorCatalog.scss';

const opDragImg: string = require('../../../images/opdrag.png');

interface Props {
  selected: Operator;
  onSelect: (id: string) => void;
}

export default class OperatorCatalog extends Component<Props, undefined> {
  private img: HTMLImageElement;

  constructor() {
    super();
    this.img = document.createElement('img');
    this.img.src = opDragImg;
  }

  public render({ selected, onSelect }: Props) {
    const registry: Registry = this.context.registry;
    const opList = registry.list.map((op: Operator) => [op.group, op.name, op]);
    opList.sort();
    return (
      <section className="operator-catalog">
        {opList.map(([group, name, op]: [string, string, Operator]) => (
          <OperatorCatalogEntry
              operator={op}
              selected={selected === op}
              onSelect={onSelect}
              img={this.img}
          />
        ))}
        <div />
      </section>
    );
  }
}
