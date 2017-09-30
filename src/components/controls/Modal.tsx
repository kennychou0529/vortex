import bind from 'bind-decorator';
import * as classNames from 'classnames';
import { Component, h } from 'preact';

import './Modal.scss';

const Portal: any = require('preact-portal');
const Combokeys: any = require('combokeys');

interface Props {
  children?: any;
  className?: string;
  bgClass?: string;
  open: boolean;
  onHide: () => void;
}

interface HeaderProps {
  children?: JSX.Element | JSX.Element[];
  className?: string;
}

interface BodyProps {
  children?: JSX.Element | JSX.Element[];
  className?: string;
}

interface FooterProps {
  children?: JSX.Element | JSX.Element[];
  className?: string;
}

interface State {
  closing: boolean;
}

function Header({ children, className }: HeaderProps): JSX.Element {
  return (
    <header className={className}>
      {children}
    </header>
  );
}

function Body({ children, className }: BodyProps): JSX.Element {
  return (
    <section className={classNames('modal-body', className)}>{children}</section>
  );
}

function Footer({ children, className }: FooterProps): JSX.Element {
  return (
    <footer className={className}>{children}</footer>
  );
}

/** Modal dialog class. */
export default class Modal extends Component<Props, State> {
  public static Header = Header;
  public static Body = Body;
  public static Footer = Footer;
  private combokeys: any;

  constructor() {
    super();
    this.combokeys = new Combokeys(document.documentElement);
    this.state = {
      closing: false,
    };
  }

  public getChildContext() {
    return {
      combokeys: this.combokeys,
    };
  }

  public componentWillReceiveProps(nextProps: Props) {
    const openChanged = this.props.open !== nextProps.open;
    if (openChanged) {
      if (!nextProps.open) {
        this.combokeys.reset();
        this.context.combokeys.unpause();
        this.setState({ closing: true });
        window.setTimeout(() => {
          if (!this.props.open) {
            this.setState({ closing: false });
          }
        }, 500);
      } else {
        this.context.combokeys.pause();
        this.combokeys.bind('esc', this.props.onHide);
      }
    }
  }

  public render(
      { children, className, bgClass, open }: Props,
      { closing }: State) {
    return (open || closing) && (
      <Portal into="#root">
        <section
            className={classNames('modal-container', bgClass, { open, closing })}
            onClick={this.onClickBg}
        >
          <section className="modal-top-spacer" />
          <section
              className={classNames('modal-dialog', className, { open, closing })}
              onClick={this.onClickDialog}
          >
            {children}
          </section>
          <section className="modal-bottom-spacer" />
        </section>
      </Portal>
    );
  }

  @bind
  private onClickBg(e: MouseEvent) {
    e.preventDefault();
    this.props.onHide();
  }

  @bind
  private onClickDialog(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
  }
}
