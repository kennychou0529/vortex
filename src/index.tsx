import { h, render } from 'preact';
import Router from 'preact-router';

import './index.scss';
import './styles/controls.scss';

function init() {
  const AppComponent: any = (require('./components/App') as any).default;
  render(
    <Router>
      <AppComponent path="/:id?"/>
    </Router>,
    document.getElementById('root'));
}

function main() {
  init();
  // Doesn't work.
  // if (module.hot) {
  //   module.hot.accept('./components/App.tsx', () => init());
  // }
}

main();
