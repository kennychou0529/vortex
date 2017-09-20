import { action } from 'mobx';
import { Component, h } from 'preact';
import { observer } from 'preact-mobx';
import Node from '../../graph/Node';
import { Parameter, ParameterType } from '../../graph/Operator';
import ComboSlider from '../controls/ComboSlider';

interface Props {
  parameter: Parameter;
  node: Node;
}

@observer
export default class ScalarProperty extends Component<Props, undefined> {
  public render({ parameter, node }: Props) {
    const value = node.paramValues.has(parameter.id)
        ? node.paramValues.get(parameter.id)
        : (parameter.default !== undefined ? parameter.default : 0);
    let min: number = parameter.min;
    let max: number = parameter.max !== undefined ? parameter.max : min + 1;
    if (parameter.enumVals) {
      min = 0;
      max = parameter.enumVals.length - 1;
    }
    const precision = parameter.type === ParameterType.INTEGER
        ? 0
        : (parameter.precision !== undefined ? parameter.precision : 2);
    const increment = parameter.increment !== undefined
        ? parameter.increment
        : parameter.type === ParameterType.INTEGER ? 1 : 10 ** -precision;
    return (
      <ComboSlider
          name={parameter.name}
          value={value}
          max={max}
          min={min}
          increment={increment}
          precision={precision}
          logScale={parameter.logScale}
          enumVals={parameter.enumVals && parameter.enumVals.map(ev => ev.name)}
          onChange={this.onChange}
      />
    );
  }

  @action.bound
  private onChange(value: number) {
    const { parameter, node } = this.props;
    node.paramValues.set(parameter.id, value);
    node.setModified();
  }
}
