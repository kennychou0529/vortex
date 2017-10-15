import bind from 'bind-decorator';
import * as classNames from 'classnames';
import { Component, h } from 'preact';
import { observer } from 'preact-mobx';
import { Graph } from '../../graph';
import GraphActions from './GraphActions';
import GraphNameInput from './GraphNameInput';
import LoginButton from './LoginButton';
import LoginDialog from './LoginDialog';

import './PageHeader.scss';

const githubImg: string = require('../../../images/github.png');

interface Props {
  graph: Graph;
  graphId: string;
  onNew: () => void;
  onSave: () => void;
}

interface State {
  showLogin: boolean;
  postLoginAction: string;
}

@observer
export default class Pageheader extends Component<Props, State> {
  constructor() {
    super();
    this.state = {
      showLogin: false,
      postLoginAction: null,
    };
  }

  public render({ graph, graphId, onNew }: Props, { showLogin, postLoginAction }: State) {
    return (
      <header className="page-header">
        <div className={classNames('title', { modified: graph.modified })}>Vortex</div>
        <div className="doc-name">-</div>
        <GraphNameInput graph={graph} />
        <a
            className="github-link"
            href="https://github.com/viridia/vortex"
            title="Source Code"
        >
          <img src={githubImg} />
        </a>
        <GraphActions graph={graph} graphId={graphId} onSave={this.onSave} onNew={onNew} />
        <LoginButton onLogin={this.onShowLogin} />
        <LoginDialog open={showLogin} onHide={this.onHideLogin} postLoginAction={postLoginAction} />
      </header>
    );
  }

  @bind
  private onSave() {
    if (localStorage.getItem('session')) {
      this.props.onSave();
    } else {
      this.setState({ showLogin: true, postLoginAction: 'save' });
    }
  }

  @bind
  private onShowLogin() {
    this.setState({ showLogin: true });
  }

  @bind
  private onHideLogin() {
    this.setState({ showLogin: false });
  }
}
