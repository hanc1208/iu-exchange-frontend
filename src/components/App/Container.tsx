import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, RouteComponentProps, Switch, withRouter } from 'react-router';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import createStyles from '@material-ui/core/styles/createStyles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';

import api from 'api';
import Dialog from 'components/Dialog';
import Donation from 'components/Donation';
import Exchange from 'components/Exchange';
import Investment from 'components/Investment';
import LoginForm from 'components/LoginForm';
import RegisterForm from 'components/RegisterForm';
import Wallet from 'components/Wallet';
import { fetchCurrencies } from 'store/currency/action';
import { Modal as ModalType, closeModal } from 'store/modal/action';
import { RootState } from 'store/reducer';
import { setMe } from 'store/user/action';
import { connectWebSocket } from 'store/webSocket/action';

import Bar from './Bar';

const styles = createStyles((theme: Theme) => ({
    container: {
        [theme.breakpoints.up('lg')]: {
            // width: theme.breakpoints.values.lg,
            margin: '0 auto',
        },
    },
}));

interface StateProps {
    modals: ModalType[];
}

interface DispatchProps {
    connectWebSocket: typeof connectWebSocket;
    fetchCurrencies: typeof fetchCurrencies;
    setMe: typeof setMe;
    closeModal: typeof closeModal;
}

type Props = StateProps & DispatchProps & RouteComponentProps & WithStyles;

class Container extends React.Component<Props> {

    async componentDidMount() {
        const { connectWebSocket, fetchCurrencies, setMe } = this.props;
        connectWebSocket(`ws://${location.hostname}:8517/subscribe/`);
        fetchCurrencies();
        const me = (await api.get('/users/me/')).data;
        setMe(me);
    }

    renderModal = (modal: ModalType): React.ReactNode => {
        const { closeModal } = this.props;
        return (
            <Dialog
                key={modal.id}
                title={modal.title}
                content={modal.content}
                open
                onClose={() => closeModal(modal.id)}
            />
        )
    };

    render() {
        const { modals, classes } = this.props;
        return (
            <div className={classes.container}>
                <CssBaseline />
                <Bar />
                <Toolbar />
                <Card className={classes.paper}>
                    <CardContent>
                        <Switch>
                            <Redirect exact from="/" to="/exchange/" />
                            <Redirect exact from="/exchange/" to="/exchange/orbs/eth/" />
                            <Route path="/exchange/:baseCurrency/:quoteCurrency" component={Exchange} />
                            <Route path="/balances" component={Wallet} />
                            <Route path="/investment" component={Investment} />
                            <Route path="/donation" component={Donation} />
                            <Route path="/login" component={LoginForm} />
                            <Route path="/register" component={RegisterForm} />
                        </Switch>
                    </CardContent>
                </Card>
                {modals.map(this.renderModal)}
            </div>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    const { modal: { modals } } = state;
    return {
        modals,
    };
};

const mapDispatchToProps = {
    connectWebSocket,
    fetchCurrencies,
    setMe,
    closeModal,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Container)));
