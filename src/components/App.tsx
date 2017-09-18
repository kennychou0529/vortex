import { Component, h } from 'preact';
import Graph from '../graph/Graph';
import Node from '../graph/Node';
import GraphView from './graph/GraphView';
import PropertyPanel from './PropertyPanel';
import ToolPanel from './ToolPanel';

import './App.scss';

interface State {
  graph: Graph;
}

const catalog = require.context('../graph/operators', false, /[A-Za-z0-9_]/);
const operatorNames = catalog.keys().filter(key => !key.endsWith('.ts'));

export default class App extends Component<undefined, State> {
  constructor() {
    super();
    this.state = {
      graph: new Graph(),
    };

    console.log(operatorNames);
    const node = new Node((catalog('./Bricks') as any).default);
    node.x = 20;
    node.y = 20;

    this.state.graph.nodes.push(node);
  }

  public render(props: any, { graph }: State): any {
    return (
      <section id="app">
        <ToolPanel />
        <GraphView graph={graph} />
        <PropertyPanel />
      </section>
    );
  }
}
