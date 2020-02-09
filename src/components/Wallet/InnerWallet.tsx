import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, RouteComponentProps, Switch, withRouter } from 'react-router';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { RootState } from 'store/reducer';
import Currency, { CurrencyMap } from 'types/currency';
import { gettext } from 'utils/translation';

import CurrencyList from './CurrencyList';
import Deposit from './Deposit';
import History from './History';
import Tabs from './Tabs';
import Withdrawal from './Withdrawal';


interface StateProps {
    currencies: CurrencyMap | null;
}

interface RouteParams {
    currency: string;
}

type InnerWalletProps = StateProps & RouteComponentProps<RouteParams>;

class InnerWallet extends React.Component<InnerWalletProps> {

    get currentCurrency(): Currency | null {
        const { currencies, match: { params: { currency } } } = this.props;
        return currencies && currencies[currency.toUpperCase()];
    }

    render() {
        if (!this.currentCurrency) return null;
        const { match } = this.props;
        return (
            <Grid container spacing={8}>
                <Grid item xs={12} lg={4}>
                    <CurrencyList
                        currentCurrency={this.currentCurrency.id}
                    />
                </Grid>
                <Grid item xs={12} lg={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">
                                {
                                    gettext(
                                        '{{currency}} Deposit & Withdrawal',
                                        { currency: this.currentCurrency.name },
                                    )
                                }
                            </Typography>
                        </CardContent>
                    </Card>
                    <Switch>
                        <Redirect exact from={match.path} to={`${match.path}/deposit/`} />
                    </Switch>
                    <Route path={`${match.path}/:tab`} component={Tabs} />
                    <Route
                        path={`${match.path}/deposit`}
                        render={
                            props => (
                                this.currentCurrency &&
                                    <Deposit currency={this.currentCurrency.id} {...props} />
                            )
                        }
                    />
                    <Route
                        path={`${match.path}/withdrawal`}
                        render={
                            props => (
                                this.currentCurrency &&
                                    <Withdrawal currency={this.currentCurrency.id} {...props} />
                            )
                        }
                    />
                    <Route
                        path={`${match.path}/history`}
                        render={
                            props => (
                                this.currentCurrency &&
                                    <History currency={this.currentCurrency.id} {...props} />
                            )
                        }
                    />
                </Grid>
            </Grid>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    const { currency: { currencies } } = state;
    return {
        currencies,
    };
};

export default connect(mapStateToProps)(withRouter(InnerWallet));
