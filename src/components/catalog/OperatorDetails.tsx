import { Component, h } from 'preact';
import { Operator } from '../../graph/Operator';

import './OperatorDetails.scss';

interface Props {
  operator?: Operator;
}

export default class OperatorDetails extends Component<Props, undefined> {
  public render({ operator }: Props) {
    return (
      <section className="operator-details">
        {operator && operator.description}
      </section>
    );
  }
}
