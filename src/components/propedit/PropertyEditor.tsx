import { h } from 'preact';
import { Graph, GraphNode } from '../../graph';
import { DataType, Parameter } from '../../operators';
import ColorGradientProperty from './ColorGradientProperty';
import ColorProperty from './ColorProperty';
import ImageProperty from './ImageProperty';
import ScalarProperty from './ScalarProperty';

interface Props {
  graph: Graph;
  node: GraphNode;
}

export default function PropertyEditor({ node, graph }: Props) {
  const children: JSX.Element[] = [];
  let group: JSX.Element[] = [];

  function makeGroups(params: Parameter[]) {
    params.forEach(param => {
      if (param.type === DataType.FLOAT || param.type === DataType.INTEGER) {
        group.push(<ScalarProperty key={param.id} graph={graph} node={node} parameter={param} />);
      } else if (param.type === DataType.RGBA) {
        if (group.length > 0) {
          children.push(<section className="property-group">{group}</section>);
        }
        children.push(<ColorProperty key={param.id} graph={graph} node={node} parameter={param} />);
        group = [];
      } else if (param.type === DataType.IMAGE) {
        if (group.length > 0) {
          children.push(<section className="property-group">{group}</section>);
        }
        children.push(<ImageProperty key={param.id} graph={graph} node={node} parameter={param} />);
        group = [];
      } else if (param.type === DataType.RGBA_GRADIENT) {
        if (group.length > 0) {
          children.push(<section className="property-group">{group}</section>);
        }
        children.push(
            <ColorGradientProperty key={param.id} graph={graph} node={node} parameter={param} />);
        group = [];
      } else if (param.type === DataType.GROUP) {
        if (group.length > 0) {
          children.push(<section className="property-group">{group}</section>);
        }
        group = [];
        group.push(<header>{param.name}</header>);
        makeGroups(param.children);
        children.push(<section className="property-group">{group}</section>);
        group = [];
      } else {
        if (group.length > 0) {
          children.push(<section className="property-group">{group}</section>);
          group = [];
        }
      }
    });
  }

  makeGroups(node.operator.params);
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
