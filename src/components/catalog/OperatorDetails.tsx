import { Component, h } from 'preact';
import { Operator } from '../../operators';
import Markdown from '../controls/Markdown';

import './OperatorDetails.scss';

interface Props {
  operator?: Operator;
}

export default class OperatorDetails extends Component<Props, undefined> {
  public render({ operator }: Props) {
    return (
      <Markdown className="operator-details" markdown={operator && operator.description || ''} />
    );
  }
}
