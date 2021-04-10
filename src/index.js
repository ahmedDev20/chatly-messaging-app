import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { StateProvider } from './context/provider';
import reducer, { initialState } from './context/reducer';

ReactDOM.render(
  <StateProvider initialState={initialState} reducer={reducer}>
    <App />
  </StateProvider>,
  document.getElementById('root'),
);
