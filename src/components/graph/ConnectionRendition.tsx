import bind from 'bind-decorator';
import * as classNames from 'classnames';
import { Component, h } from 'preact';
import { observer } from 'preact-mobx';
import { Connection, Terminal } from '../../graph';

import './ConnectionRendition.scss';

interface Props {
  ts?: Terminal;
  xs?: number;
  ys?: number;
  te?: Terminal;
  xe?: number;
  ye?: number;
  pending?: boolean;
  connection?: Connection;
  onEdit?: (conn: Connection, output: boolean) => void;
}

@observer
export default class ConnectionRendition extends Component<Props, undefined> {
  public render({ ts, xs, ys, te, xe, ye, pending }: Props) {
    // Just a way to force MobX to re-render us when a node gets deleted.
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
        <path className="connector-shadow" d={d} transform="translate(0, 3)" />
        <path className="connector-outline" d={d} />
        <path className="connector" d={d} />
      </g>
    );
  }

  @bind
  private onMouseDown(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const { ts, te, connection, onEdit } = this.props;
    if (ts && te && connection && onEdit) {
      const svgDoc = this.base.parentNode as SVGSVGElement;
      const clientRect = svgDoc.getBoundingClientRect();
      const x = e.x - clientRect.left + svgDoc.viewBox.baseVal.x;
      const y = e.y - clientRect.top + svgDoc.viewBox.baseVal.y;
      const de = (x - te.x - te.node.x - 10) ** 2 + (y - te.y - te.node.y - 10) ** 2;
      const ds = (x - ts.x - ts.node.x - 15) ** 2 + (y - ts.y - ts.node.y - 15) ** 2;
      // console.log(ds, de, ds > de);
      onEdit(connection, ds > de);
    }
  }
}
