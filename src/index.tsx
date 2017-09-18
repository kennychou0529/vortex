import { h, render } from 'preact';
import App from './components/App';
import './index.scss';

function main() {
  render(<App />, document.getElementById('root'));
}

main();
