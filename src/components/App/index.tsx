import React from 'react';
import { Provider } from 'react-redux';
import { Route, Router } from 'react-router';
import { Store } from 'redux';

import createBrowserHistory from 'history/createBrowserHistory';

import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';

import { RootState } from 'store/reducer';

import './styles.scss';
import Container from './Container';
import theme from './theme';

interface Props {
    store: Store<RootState>;
}

const history = createBrowserHistory();

export default class App extends React.Component<Props> {

    render() {
        const { store } = this.props;
        return (
            <Provider store={store}>
                <MuiThemeProvider theme={theme}>
                    <Router history={history}>
                        <Route path="/" component={() => <Container />} />
                    </Router>
                </MuiThemeProvider>
            </Provider>
        );
    }
}
