import { Component, h } from 'preact';

import './CompassRose.scss';

interface Props {
  onScroll: (dx: number, dy: number) => void;
}

export default class CompassRose extends Component<Props, undefined> {
  public render() {
    return (
      <div className="compass-rose">
        <div className="arrow north" />
        <div className="arrow east" />
        <div className="arrow south" />
        <div className="arrow west" />
        <div className="center" />
      </div>
    );
  }
}
