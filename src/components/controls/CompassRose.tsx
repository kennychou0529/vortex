import bind from 'bind-decorator';
import { Component, h } from 'preact';
import MomentaryButton from './MomentaryButton';

import './CompassRose.scss';

interface Props {
  onScroll: (dx: number, dy: number) => void;
}

export default class CompassRose extends Component<Props, undefined> {
  public render() {
    return (
      <div className="compass-rose">
        <MomentaryButton className="arrow north" delay={0} onHeld={this.onHeldNorth} />
        <MomentaryButton className="arrow east" delay={0} onHeld={this.onHeldEast} />
        <MomentaryButton className="arrow south" delay={0} onHeld={this.onHeldSouth} />
        <MomentaryButton className="arrow west" delay={0} onHeld={this.onHeldWest} />
        <MomentaryButton className="center" />
      </div>
    );
  }

  @bind
  private onHeldNorth() {
    this.props.onScroll(0, 10);
  }

  @bind
  private onHeldEast() {
    this.props.onScroll(-10, 0);
  }

  @bind
  private onHeldSouth() {
    this.props.onScroll(0, -10);
  }

  @bind
  private onHeldWest() {
    this.props.onScroll(10, 0);
  }
}
