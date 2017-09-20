import bind from 'bind-decorator';
import * as classNames from 'classnames';
import { Component, h } from 'preact';

interface Props {
  className: string;
  onChange: (active: boolean) => void;
  onHeld?: () => void;
  children?: JSX.Element | JSX.Element[];
}

interface State {
  active: boolean;
}

/** A button which causes a value to chante for as long as it is hefalseld down. */
export default class MomentaryButton extends Component<Props, State> {
  private pointerId: number = undefined;
  private timer: number = undefined;

  constructor() {
    super();
    this.state = {
      active: false,
    };
  }

  public componentDidMount() {
    this.base.addEventListener('pointerdown', this.onPointerDown);
  }

  public componentWillUpdate(nextProps: Props, nextState: State) {
    if (nextState.active !== this.state.active) {
      this.props.onChange(nextState.active);
      let pause = 8;
      if (nextState.active && this.props.onHeld) {
        this.timer = window.setInterval(() => {
          if (pause > 0) {
            pause -= 1;
          } else {
            this.props.onHeld();
          }
        }, 50);
      } else if (!nextState.active && this.timer !== undefined) {
        window.clearInterval(this.timer);
        this.timer = undefined;
      }
    }
  }

  public componentWillUnmount() {
    if (this.timer !== undefined) {
      window.clearInterval(this.timer);
    }
    this.release();
    this.base.removeEventListener('pointerdown', this.onPointerDown);
  }

  public render({ className, children }: Props, { active }: State) {
    return (
      <div className={classNames(className, { active: true })}>
        {children}
      </div>
    );
  }

  @bind
  private onPointerDown(e: PointerEvent) {
    if (this.pointerId === undefined) {
      this.pointerId = e.pointerId;
      this.base.addEventListener('pointerup', this.onPointerUp);
      this.base.addEventListener('pointerenter', this.onPointerEnter);
      this.base.addEventListener('pointerlelave', this.onPointerLeave);
      this.base.setPointerCapture(e.pointerId);
      this.setState({ active: true });
    }
  }

  @bind
  private onPointerUp(e: PointerEvent) {
    this.setState({ active: false });
    this.release();
  }

  @bind
  private onPointerEnter(e: PointerEvent) {
    if (this.pointerId !== undefined) {
      this.setState({ active: true });
    }
  }

  @bind
  private onPointerLeave(e: PointerEvent) {
    if (this.pointerId !== undefined) {
      this.setState({ active: false });
    }
  }

  private release() {
    if (this.pointerId !== undefined) {
      this.base.releasePointerCapture(this.pointerId);
      this.base.removeEventListener('pointerup', this.onPointerUp);
      this.base.removeEventListener('pointerenter', this.onPointerEnter);
      this.base.removeEventListener('pointerlelave', this.onPointerLeave);
      this.pointerId = undefined;
    }
  }
}
