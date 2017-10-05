import Axios from 'axios';
import { action } from 'mobx';
import { Component, h } from 'preact';
import { route } from 'preact-router';
import { Graph, GraphNode } from '../graph';
import { Registry } from '../operators';
import Renderer from '../render/Renderer';
import GraphView from './graph/GraphView';
import PropertyPanel from './PropertyPanel';
import ToolPanel from './ToolPanel';

import './App.scss';

const Combokeys: any = require('combokeys');
const pause: any = require('combokeys/plugins/pause');

interface Props {
  path: string;
  id?: string;
}

interface State {
  graph: Graph;
}

export default class App extends Component<Props, State> {
  private renderer: Renderer;
  private registry: Registry;
  private combokeys: any;

  constructor(props: Props) {
    super(props);
    this.registry = new Registry();
    this.renderer = new Renderer();
    this.combokeys = new Combokeys(document.documentElement);
    pause(this.combokeys);
    this.state = {
      graph: new Graph(),
    };

    if (props.id) {
      this.loadGraph(props.id);
    } else {
      const savedGraph = localStorage.getItem('workingGraph');
      if (savedGraph) {
        try {
          this.state.graph.fromJs(JSON.parse(savedGraph), this.registry);
          for (const node of this.state.graph.nodes) {
            node.loadTextures(this.renderer);
          }
        } catch (e) {
          console.error('node deserialization failed:', e);
        }
      }

      if (this.state.graph.nodes.length === 0) {
        const node = new GraphNode(this.registry.get('pattern_bricks'));
        node.x = 20;
        node.y = 20;
        this.state.graph.add(node);
      }
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
      combokeys: this.combokeys,
    };
  }

  public componentWillMount() {
    this.combokeys.bind('del', this.onDelete);
    this.combokeys.bind('backspace', this.onDelete);
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.id !== this.props.id) {
      if (nextProps.id) {
        this.loadGraph(nextProps.id);
      } else {
        this.setState({ graph: new Graph() });
      }
    }
  }

  public render(props: any, { graph }: State): any {
    return (
      <section id="app">
        <ToolPanel graph={graph} onSave={this.onSave} />
        <GraphView graph={graph} />
        <PropertyPanel graph={graph} />
      </section>
    );
  }

  @action.bound
  private onDelete(e: KeyboardEvent) {
    this.state.graph.deleteSelection();
  }

  @action.bound
  private onSave() {
    const { id } = this.props;
    const { graph } = this.state;
    if (id) {
      Axios.put(`/api/docs/${id}`, graph.toJs()).then(resp => {
        graph.modified = false;
      });
    } else {
      Axios.post(`/api/docs`, graph.toJs()).then(resp => {
        graph.modified = false;
        console.log('saved new document as:', resp.data.id);
        route(`/${resp.data.id}`, true);
      });
    }
  }

  private loadGraph(id: string) {
    Axios.get(`/api/docs/${id}`).then(resp => {
      const graph = new Graph();
      try {
        graph.fromJs(resp.data.data, this.registry);
        for (const node of this.state.graph.nodes) {
          node.loadTextures(this.renderer);
        }
        this.setState({ graph });
      } catch (e) {
        console.error('node deserialization failed:', e);
      }
    });
  }
}
