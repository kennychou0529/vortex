import * as keyboardJs from 'keyboardjs';
import { action } from 'mobx';
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

    const savedGraph = localStorage.getItem('workingGraph');
    if (savedGraph) {
      try {
        // this.state.graph.fromJs(JSON.parse(savedGraph), this.registry);
      } catch (e) {
        console.error('node deserialization failed:', e);
      }
    }

    if (this.state.graph.nodes.length === 0) {
      const node = new Node(this.registry.get('pattern.bricks'));
      node.x = 20;
      node.y = 20;
      this.state.graph.add(node);

      const node2 = new Node(this.registry.get('filter.blend'));
      node2.x = 250;
      node2.y = 120;
      this.state.graph.add(node2);

      this.state.graph.connect(node, 'out', node2, 'a');
    }

    // Save the graph we are working on in local storage.
    window.addEventListener('beforeunload', () => {
      localStorage.setItem('workingGraph', JSON.stringify(this.state.graph.toJs()));
    });
  }

  public getChildContext() {
    return {
      renderer: this.renderer,
      registry: this.registry,
    };
  }

  public componentWillMount() {
    keyboardJs.bind('delete', this.onDelete);
    keyboardJs.bind('backspace', this.onDelete);
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

  @action.bound
  private onDelete(e: KeyboardEvent) {
    this.state.graph.deleteSelection();
  }
}
