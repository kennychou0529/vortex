import bind from 'bind-decorator';
import * as classNames from 'classnames';
import { Component, h } from 'preact';
import { Operator } from '../../graph/Operator';

import './OperatorCatalog.scss';

interface Props {
  operator: Operator;
  selected: boolean;
  onSelect: (id: string) => void;
  img: HTMLImageElement;
}

export default class OperatorCatalogEntry extends Component<Props, undefined> {
  public render({ operator, selected }: Props) {
    const { group, name } = operator;
    return (
      <div
          className={classNames('row', { selected })}
          key={`${group}/${name}`}
          data-id={`${group}/${name}`}
          onClick={this.onClick}
          onDragStart={this.onDragStart}
          draggable={true}
      >
        <div className="group">{group}</div>
        <div className="name">{name}</div>
      </div>
    );
  }

  @bind
  private onClick(e: any) {
    e.preventDefault();
    this.props.onSelect(e.currentTarget.dataset.id);
  }

  @bind
  private onDragStart(e: DragEvent) {
    const { group, name } = this.props.operator;
    e.dataTransfer.dropEffect = 'copy';
    e.dataTransfer.setDragImage(this.props.img, 45, 60);
    e.dataTransfer.setData('application/x-scintil-operator', `${group}/${name}`);
  }
}
