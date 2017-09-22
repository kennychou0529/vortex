import { observable } from 'mobx';
import AbstractTerminal from './AbstractTerminal';
import Connection from './Connection';

export default class InputTerminal extends AbstractTerminal {
  // Single input connections
  @observable public connection?: Connection = null;
}
