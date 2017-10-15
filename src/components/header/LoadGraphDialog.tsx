import { AxiosInstance } from 'axios';
import bind from 'bind-decorator';
import * as classNames from 'classnames';
import * as dateformat from 'dateformat';
import { Component, h } from 'preact';
import { route } from 'preact-router';
import Modal from '../controls/Modal';

import './LoadGraphDialog.scss';

interface ListEntry {
  name: string;
  id: string;
  created: Date;
}

interface Props {
  open: boolean;
  onHide: () => void;
}

interface State {
  list: ListEntry[];
  selected?: string;
}

export default class LoadGraphDialog extends Component<Props, State> {
  constructor() {
    super();
    this.state = {
      list: [],
      selected: null,
    };
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.open && !this.props.open) {
      this.loadGraphs();
    }
  }

  public render({ open, onHide }: Props, { list, selected }: State) {
    return (
      <Modal className="load" open={open} onHide={onHide} >
        <Modal.Header>Load graph</Modal.Header>
        <Modal.Body>
          <section className="graph-table">
            <header>
              <span className="name">Name</span>
              <span className="date">Created</span>
            </header>
            <section className="graph-table-body">
              {list.map(entry => (
                <section
                    data-id={entry.id}
                    className={classNames('graph-entry', { selected: entry.id === selected })}
                    onClick={this.onClickEntry}
                    onDblClick={this.onDblClickEntry}
                >
                  <span className="name">{entry.name}</span>
                  <span className="date">{dateformat(new Date(entry.created), 'longDate')}</span>
                </section>
              ))}
            </section>
          </section>
        </Modal.Body>
        <Modal.Footer className="modal-buttons">
          <button className="close" onClick={onHide}>Cancel</button>
          <button className="close" onClick={this.onClickLoad} disabled={!selected}>
            Load
          </button>
        </Modal.Footer>
      </Modal>
    );
  }

  @bind
  private onClickLoad() {
    const { selected } = this.state;
    if (selected) {
      route(`/${selected}`);
      this.props.onHide();
    }
  }

  @bind
  private onClickEntry(e: MouseEvent) {
    const selected = (e.currentTarget as HTMLElement).dataset.id;
    this.setState({ selected });
  }

  @bind
  private onDblClickEntry(e: MouseEvent) {
    const selected = (e.currentTarget as HTMLElement).dataset.id;
    route(`/${selected}`);
    this.props.onHide();
  }

  private loadGraphs() {
    const session = localStorage.getItem('session');
    if (session) {
      const axios: AxiosInstance = this.context.axios;
      axios.get(`/api/docs`).then(resp => {
        this.setState({ list: resp.data });
      });
    }
  }
}
