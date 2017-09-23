import bind from 'bind-decorator';
import * as classNames from 'classnames';
import { Component, h } from 'preact';
import { observer } from 'preact-mobx';
import { Terminal } from '../../graph';

import './ConnectionRendition.scss';

interface Props {
  ts?: Terminal;
  xs?: number;
  ys?: number;
  te?: Terminal;
  xe?: number;
  ye?: number;
  pending?: boolean;
}

@observer
export default class ConnectionRendition extends Component<Props, undefined> {
  public render({ ts, xs, ys, te, xe, ye, pending }: Props) {
    // This just forces MobX to re-render us when a node gets deleted.
    if (ts && ts.node.deleted || te && te.node.deleted) {
      return;
    }
    const x0 = ts ? ts.x + ts.node.x + 10 : xs;
    const y0 = ts ? ts.y + ts.node.y + 15 : ys;
    const x1 = te ? te.x + te.node.x + 10 : xe;
    const y1 = te ? te.y + te.node.y + 15 : ye;
    const d = [
      `M${x0} ${y0}`,
      `L${x0 + 5} ${y0}`,
      `C${x0 + 50} ${y0} ${x1 - 50} ${y1} ${x1 - 5} ${y1}`,
      `L${x1} ${y1}`,
    ].join(' ');
    return (
      <g onMouseDown={this.onMouseDown} className={classNames({ pending })}>
        <path className="connector-shadow" d={d} filter="url(#dropShadow)" />
        <path className="connector-outline" d={d} />
        <path className="connector" d={d} />
      </g>
    );
  }

  @bind
  private onMouseDown(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    console.log('wire click');
  }
}
