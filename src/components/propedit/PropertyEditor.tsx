import { h } from 'preact';
import { GraphNode } from '../../graph';
import { ParameterType } from '../../operators';
import ColorGradientProperty from './ColorGradientProperty';
import ColorProperty from './ColorProperty';
import ScalarProperty from './ScalarProperty';

interface Props {
  node: GraphNode;
}

export default function PropertyEditor({ node }: Props) {
  const children: JSX.Element[] = [];
  let group: JSX.Element[] = [];
  node.operator.params.forEach(param => {
    if (param.type === ParameterType.FLOAT || param.type === ParameterType.INTEGER) {
      group.push(<ScalarProperty key={param.id} node={node} parameter={param} />);
    } else if (param.type === ParameterType.COLOR) {
      children.push(<section className="property-group">{group}</section>);
      children.push(<ColorProperty key={param.id} node={node} parameter={param} />);
      group = [];
    } else if (param.type === ParameterType.COLOR_GRADIENT) {
      children.push(<section className="property-group">{group}</section>);
      children.push(<ColorGradientProperty key={param.id} node={node} parameter={param} />);
      group = [];
    } else {
      if (group.length > 0) {
        children.push(<section className="property-group">{group}</section>);
        group = [];
      }
      // TODO: scalar colors
    }
  });
  if (group.length > 0) {
    children.push(<section className="property-group">{group}</section>);
    group = [];
  }

  return (
    <section className="property-editor">
      <header>{node.name}</header>
      {children}
    </section>
  );
}
