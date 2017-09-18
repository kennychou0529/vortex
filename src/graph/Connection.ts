import InputTerminal from './InputTerminal';
import OutputTerminal from './OutputTerminal';

export default interface Connection {
  source?: OutputTerminal;
  dest?: InputTerminal;
  recalc: boolean;
}
