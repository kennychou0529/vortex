import bind from 'bind-decorator';
import { Component, h } from 'preact';
import { observer } from 'preact-mobx';
import Modal from '../controls/Modal';

import './PageHeader.scss';

// const googleImg: string = require('../../../images/google.png');
const githubImg: string = require('../../../images/github.png');
const facebookImg: string = require('../../../images/facebook.png');

interface Props {
  open: boolean;
  postLoginAction: string;
  onHide: () => void;
}

@observer
export default class LoginDialog extends Component<Props, undefined> {
  public render({ open, postLoginAction, onHide }: Props) {
    const saveUrl = postLoginAction
        ? `${window.location.pathname}?action=${postLoginAction}` : window.location.pathname;
    const thisUrl = `${window.location.protocol}//${window.location.host}`;
    const nextUrl = `?next=${encodeURIComponent(saveUrl)}`;
    return (
      <Modal className="login" open={open} onHide={onHide} >
        <Modal.Header>Login</Modal.Header>
        <Modal.Body>
          <section className="login-buttons">
            {/* <a
                className="login google"
                href={`${thisUrl}/auth/google${nextUrl}`}
                onClick={this.onClickLogin}
            >
              <img className="logo" src={googleImg} />
              Login with Google
            </a> */}
            <a
                className="login github"
                href={`${thisUrl}/auth/github${nextUrl}`}
                onClick={this.onClickLogin}
            >
              <img className="logo" src={githubImg} />
              Login with GitHub
            </a>
            <a
                className="login facebook"
                href={`${thisUrl}/auth/facebook${nextUrl}`}
                onClick={this.onClickLogin}
            >
              <img className="logo" src={facebookImg} />
              Login with Facebook
            </a>
          </section>
        </Modal.Body>
        <Modal.Footer className="modal-buttons">
          <button className="close" onClick={onHide}>Cancel</button>
        </Modal.Footer>
      </Modal>
    );
  }

  @bind
  private onClickLogin(e: MouseEvent) {
    window.location.href = (e.target as HTMLElement).getAttribute('href');
  }
}
