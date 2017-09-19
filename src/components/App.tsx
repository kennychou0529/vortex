import { Component, h } from 'preact';
import Graph from '../graph/Graph';
import Node from '../graph/Node';
import { Operator } from '../graph/Operator';
import Renderer from '../render/Renderer';
import GraphView from './graph/GraphView';
import PropertyPanel from './PropertyPanel';
import ToolPanel from './ToolPanel';

import './App.scss';

interface State {
  graph: Graph;
}

// TODO: Move to registry
const catalog = require.context('../graph/operators', false, /[A-Za-z0-9_]\.ts$/);
const operators: Operator[] = catalog.keys().map(k => (catalog(k) as any).default as Operator);

export default class App extends Component<undefined, State> {
  private renderer: Renderer;

  constructor() {
    super();
    this.renderer = new Renderer();
    this.state = {
      graph: new Graph(),
    };

    const node = new Node(operators[0]);
    node.x = 20;
    node.y = 20;
    this.state.graph.add(node);

    const node2 = new Node(operators[0]);
    node2.x = 250;
    node2.y = 120;
    this.state.graph.add(node2);
  }

  public getChildContext() {
    return {
      renderer: this.renderer,
    };
  }

  public render(props: any, { graph }: State): any {
    return (
      <section id="app">
        <ToolPanel />
        <GraphView graph={graph} />
        <PropertyPanel graph={graph} />
      </section>
    );
  }
}
