import { Component, h } from 'preact';
import Graph from '../graph/Graph';
import Node from '../graph/Node';
import Registry from '../graph/Registry';
import Renderer from '../render/Renderer';
import GraphView from './graph/GraphView';
import PropertyPanel from './PropertyPanel';
import ToolPanel from './ToolPanel';

import './App.scss';

interface State {
  graph: Graph;
}

export default class App extends Component<undefined, State> {
  private renderer: Renderer;
  private registry: Registry;

  constructor() {
    super();
    this.registry = new Registry();
    this.renderer = new Renderer();
    this.state = {
      graph: new Graph(),
    };

    const node = new Node(this.registry.get('pattern/Bricks'));
    node.x = 20;
    node.y = 20;
    this.state.graph.add(node);

    const node2 = new Node(this.registry.get('filter/Blend'));
    node2.x = 250;
    node2.y = 120;
    this.state.graph.add(node2);

    this.state.graph.connect(node, 'out', node2, 'a');
  }

  public getChildContext() {
    return {
      renderer: this.renderer,
      registry: this.registry,
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
