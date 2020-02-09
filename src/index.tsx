import React from 'react';
import ReactDOM from 'react-dom';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';

import App from 'components/App';
import reducer, { RootState } from 'store/reducer';

export const store = createStore<RootState>(reducer, applyMiddleware(thunk));
const container = document.getElementById('root');

const run = () => {
    if (module.hot) {
        module.hot.accept('./components/App', () => {
            setImmediate(() => {
                const App = require('./components/App').default;
                ReactDOM.render(<App store={store}/>, container);
            });
        });
    }

    ReactDOM.render(<App store={store} />, container);
};

run();
