import { h } from 'preact';
import { GraphNode } from '../../graph';
import { ParameterType } from '../../operators';
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
    } else {
      if (group.length > 0) {
        children.push(<section className="property-group">{group}</section>);
        group = [];
      }
      // TODO: colors and gradients
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
