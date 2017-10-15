import bind from 'bind-decorator';
import { Component, h } from 'preact';
import { observer } from 'preact-mobx';

interface Props {
  onLogin: () => void;
}

@observer
export default class LoginButton extends Component<Props, undefined> {
  public render(_: Props) {
    if (this.context.user.isLoggedIn) {
      return <button onClick={this.onClickLogout}>Logout</button>;
    }
    return <button onClick={this.onClickLogin}>Login&hellip;</button>;
  }

  @bind
  private onClickLogin(e: MouseEvent) {
    this.props.onLogin();
  }

  @bind
  private onClickLogout(e: MouseEvent) {
    localStorage.removeItem('session');
    window.location.reload();
  }
}
