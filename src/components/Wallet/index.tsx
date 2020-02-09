import React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, RouteComponentProps, Switch, withRouter } from 'react-router';

import Decimal from 'decimal.js';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { RootState } from 'store/reducer';
import { BalanceMap } from 'types/balance';
import { CurrencyMap } from 'types/currency';
import { MarketMap } from 'types/market';
import User from 'types/user';
import { formatNumber } from 'utils/formatting';
import { gettext } from 'utils/translation';

import InnerWallet from './InnerWallet';

interface StateProps {
    balances: BalanceMap;
    currencies: CurrencyMap | null;
    markets: MarketMap | null;
    me: User | null | undefined;
}

interface OwnProps {
}

type Props = StateProps & OwnProps & RouteComponentProps;

interface State {
    currency: string;
    balanceQuoteCurrency: string;
}

class Wallet extends React.Component<Props, State> {

    state: State = {
        currency: 'ETH',
        balanceQuoteCurrency: 'ETH',
    };

    loginRequired() {
        const { me, history } = this.props;
        if (me === null) {
            history.push('/login/');
        }
    }

    componentDidMount() {
        this.loginRequired();
    }

    componentDidUpdate(prevProps: Props) {
        const { me } = this.props;
        if (prevProps.me !== me) {
            this.loginRequired();
        }
    }

    getEstimatedValue = (currency: string): Decimal => {
        const { balances, markets } = this.props;
        const { balanceQuoteCurrency } = this.state;
        if (!markets) return new Decimal(0);
        const balance = balances[currency];
        return balance.getEstimatedValue(markets, balanceQuoteCurrency);
    }

    get totalEstimatedValue(): Decimal {
        const { balances } = this.props;
        return Object.keys(balances).map(this.getEstimatedValue).reduce(
            (a, b) => a.add(b), new Decimal(0)
        );
    }

    get totalEstimatedValueFormatted(): React.ReactNode {
        const { currencies } = this.props;
        const { balanceQuoteCurrency } = this.state;
        if (!currencies) return null;
        const currency = currencies[balanceQuoteCurrency];
        return formatNumber(
            this.totalEstimatedValue,
            currency.decimals,
            { currency: currency.id, fixed: true },
        );
    }

    render() {
        const { match } = this.props;
        return (
            <>
                <Grid container spacing={16}>
                    <Grid item xs={12} container>
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">
                                        {gettext('Estimated Value')}
                                    </Typography>
                                    <Typography>
                                        ≈ {this.totalEstimatedValueFormatted}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                    <Switch>
                        <Redirect exact from={match.path} to={`${match.path}/eth/`} />
                        <Route path={`${match.path}/:currency`} component={InnerWallet} />
                    </Switch>
                </Grid>
            </>
        )
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    const {
        currency: { currencies },
        market: { markets },
        balance: { balances },
        user: { me },
    } = state;
    return {
        balances,
        markets,
        currencies,
        me,
    };
};

export default connect(mapStateToProps)(withRouter(Wallet));
