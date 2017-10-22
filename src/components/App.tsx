import axios, { AxiosInstance } from 'axios';
import bind from 'bind-decorator';
import { action, IReactionDisposer, reaction } from 'mobx';
import { Component, h } from 'preact';
import { route } from 'preact-router';
import { Graph } from '../graph';
import { Registry } from '../operators';
import Renderer from '../render/Renderer';
import User from '../user/User';
import Modal from './controls/Modal';
import GraphView from './graph/GraphView';
import PageHeader from './header/PageHeader';
import PropertyPanel from './PropertyPanel';
import ToolPanel from './ToolPanel';

import './App.scss';

// TODO: Remove requirement for being logged in when running locally.
// declare var __DEBUG__: boolean;
// console.log(__DEBUG__);

const Combokeys: any = require('combokeys');
const pause: any = require('combokeys/plugins/pause');

interface Props {
  path: string;
  id?: string;
  session?: string;
  action?: string;
}

interface State {
  graph: Graph;
  errorMsg?: string;
}

export default class App extends Component<Props, State> {
  private renderer: Renderer;
  private registry: Registry;
  private user: User;
  private combokeys: any;
  private axios: AxiosInstance;
  private saveHandler: IReactionDisposer;
  private saveTimer: number;

  constructor(props: Props) {
    super(props);
    this.registry = new Registry();
    this.renderer = new Renderer();
    this.combokeys = new Combokeys(document.documentElement);
    this.user = new User();
    pause(this.combokeys);
    this.state = {
      graph: new Graph(),
      errorMsg: null,
    };

    this.axios = axios.create();
    this.axios.interceptors.request.use(config => {
      const session = localStorage.getItem('session');
      if (session) {
        config.headers.Authorization = `Bearer ${session}`;
      }
      return config;
    });

    const sessionToken = localStorage.getItem('session');
    this.user.isLoggedIn = !!sessionToken;

    if (props.id) {
      this.loadGraph(props.id);
    } else {
      this.loadLocalGraph(this.state.graph);
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
      user: this.user,
      axios: this.axios,
    };
  }

  public componentWillMount() {
    const { id, session, action: act } = this.props;

    // Save session token
    if (session && session.length > 0) {
      localStorage.setItem('session', session);
      this.user.isLoggedIn = true;
    }

    // Continue action interrupted by login
    if (act && this.user.isLoggedIn) {
      if (act === 'save') {
        this.onSave();
      }
    }

    this.watchGraph(this.state.graph);

    if (session || act) {
      route(id ? `/${id}` : '/', true);
    }

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

  public componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.graph !== this.state.graph) {
      this.watchGraph(this.state.graph);
    }
  }

  public render({ id }: Props, { graph, errorMsg }: State): any {
    return (
      <section id="app">
        <PageHeader graph={graph} graphId={id} onSave={this.onSave} onNew={this.onNew} />
        <section>
          <ToolPanel />
          <GraphView graph={graph} />
          <PropertyPanel graph={graph} />
        </section>
        <Modal className="not-found" open={errorMsg !== null} onHide={this.onHideNotFound} >
          <Modal.Header>Document load error</Modal.Header>
          <Modal.Body>
            {errorMsg}
          </Modal.Body>
          <Modal.Footer className="modal-buttons">
            <button className="close" onClick={this.onHideNotFound}>Close</button>
          </Modal.Footer>
        </Modal>
      </section>
    );
  }

  @bind
  private onHideNotFound() {
    this.setState({ errorMsg: null, graph: new Graph() });
    route('/', true);
  }

  @action.bound
  private onDelete(e: KeyboardEvent) {
    this.state.graph.deleteSelection();
  }

  @action.bound
  private onSave() {
    const { graph } = this.state;
    this.axios.post(`/api/docs`, graph.toJs()).then(resp => {
      graph.modified = false;
      console.log('saved new document as:', resp.data.id);
      route(`/${resp.data.id}`, true);
    });
  }

  @action.bound
  private onNew() {
    if (!this.props.id) {
      this.setState({ graph: new Graph() });
    } else {
      route('/');
    }
  }

  private loadGraph(id: string) {
    this.axios.get(`/api/docs/${id}`).then(resp => {
      const graph = new Graph();
      if (resp.data.ownedByUser) {
        graph.ownedByUser = true;
      }
      if (resp.data) {
        this.graphFromJs(graph, resp.data.data);
      }
      this.setState({ graph });
    }, error => {
      if (error.response) {
        if (error.response.status === 404) {
          this.setState({ errorMsg: `The document '${id}' could not be found.` });
        }
      }
    });
  }

  private loadLocalGraph(graph: Graph) {
    const savedGraph = localStorage.getItem('workingGraph');
    if (savedGraph) {
      try {
        this.graphFromJs(graph, JSON.parse(savedGraph));
        if (graph.nodes.length > 0) {
          graph.modified = true;
        }
      } catch (e) {
        console.error('node deserialization failed:', e);
      }
    }
  }

  private graphFromJs(graph: Graph, data: any) {
    graph.fromJs(data, this.registry);
    for (const node of graph.nodes) {
      node.loadTextures(this.renderer);
    }
  }

  private watchGraph(graph: Graph) {
    const id = this.props.id; // capture id
    if (this.saveHandler) {
      this.saveHandler();
    }
    this.saveHandler = reaction(() => ([graph.asJson, graph.modified]), ([json, modified]) => {
      if (graph.ownedByUser && modified) {
        if (this.saveTimer) {
          clearTimeout(this.saveTimer);
        }
        this.saveTimer = setTimeout(() => this.autoSave(graph, json, id), 2000);
      }
    }, {
      delay: 500,
    });
  }

  @action.bound
  private autoSave(graph: Graph, json: any, id: string) {
    this.axios.put(`/api/docs/${id}`, json).then(resp => {
      console.debug('saved', id);
      graph.modified = false;
    });
  }
}
