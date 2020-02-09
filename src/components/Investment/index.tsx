import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';

import Decimal from 'decimal.js';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import { sideColor } from 'components/App/theme';
import { RootState } from 'store/reducer';
import Balance, { BalanceMap } from 'types/balance';
import { CurrencyMap } from 'types/currency';
import { MarketMap } from 'types/market';
import User from 'types/user';
import { formatNumber } from 'utils/formatting';
import { gettext } from 'utils/translation';

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
    balanceQuoteCurrency: string;
    tradeMenuAnchorEl: HTMLElement | null;
    tradeMenuCurrency: string;
}

class Investment extends React.Component<Props, State> {

    state: State = {
        balanceQuoteCurrency: 'ETH',
        tradeMenuAnchorEl: null,
        tradeMenuCurrency: 'ETH',
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

    handleDepositClick = (currency: string) => {
        const { history } = this.props;
        history.push(`/balances/${currency.toLowerCase()}/deposit`);
    }

    handleWithdrawalClick = (currency: string) => {
        const { history } = this.props;
        history.push(`/balances/${currency.toLowerCase()}/withdrawal`);
    }


    handleTradeClick = (e: React.MouseEvent<HTMLElement, MouseEvent>, currency: string) => {
        this.setState({
            tradeMenuAnchorEl: e.currentTarget,
            tradeMenuCurrency: currency,
        });
    }

    handleTradeMenuClose = () => {
        this.setState({ tradeMenuAnchorEl: null });
    }

    handleTradeMenuClick = (pair: string) => {
        const { history } = this.props;
        this.handleTradeMenuClose();
        history.push(`/exchange/${pair.toLowerCase()}/`);
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
        )
    }

    renderBalance = (balance: Balance): React.ReactNode => {
        const { currencies, markets } = this.props;
        const { balanceQuoteCurrency, tradeMenuAnchorEl, tradeMenuCurrency } = this.state;
        if (!currencies) return null;

        const currency = currencies[balance.currency];
        const estimatedValue = this.getEstimatedValue(balance.currency);
        return (
            <TableRow key={currency.id}>
                <TableCell>
                    <img src={currency.iconUrl} width="16" height="16" />
                </TableCell>
                <TableCell>
                    <Typography>
                        {currency.name}
                    </Typography>
                    <Typography variant="caption">
                        {currency.id}
                    </Typography>
                </TableCell>
                <TableCell align="right">
                    <Typography>
                        {
                            formatNumber(
                                balance.amount,
                                currency.decimals,
                                { currency: currency.id, fixed: true },
                            )
                        }
                    </Typography>
                </TableCell>
                <TableCell>
                    <Typography align="right">
                        ≈
                        {' '}
                        {
                            formatNumber(
                                estimatedValue,
                                currencies[balanceQuoteCurrency].decimals,
                                { currency: balanceQuoteCurrency, fixed: true },
                            )
                        }
                    </Typography>
                </TableCell>
                <TableCell>
                    <Grid container spacing={8}>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                style={{ background: sideColor.buy }}
                                onClick={() => this.handleDepositClick(balance.currency)}
                            >
                                {gettext('Deposit')}
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                style={{ background: sideColor.sell }}
                                onClick={() => this.handleWithdrawalClick(balance.currency)}
                            >
                                {gettext('Withdrawal')}
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="default"
                                onClick={e => this.handleTradeClick(e, balance.currency)}
                            >
                                {gettext('Trade')}
                            </Button>
                            <Menu
                                anchorEl={tradeMenuAnchorEl}
                                open={
                                    tradeMenuAnchorEl != null &&
                                    tradeMenuCurrency === balance.currency
                                }
                                onClose={this.handleTradeMenuClose}
                            >
                                {
                                    Object.keys(markets || []).sort().filter(
                                        pair => (
                                            pair.split('/').includes(tradeMenuCurrency)
                                        )
                                    ).map(
                                        pair => (
                                            <MenuItem
                                                key={pair}
                                                onClick={() => this.handleTradeMenuClick(pair)}
                                            >
                                                {pair}
                                            </MenuItem>
                                        )
                                    )
                                }
                            </Menu>
                        </Grid>
                    </Grid>
                </TableCell>
            </TableRow>
        );
    }

    render() {
        const { balances } = this.props;
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
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell />
                                            <TableCell>
                                                {gettext('Name')}
                                            </TableCell>
                                            <TableCell align="right">
                                                {gettext('Balance')}
                                            </TableCell>
                                            <TableCell align="right">
                                                {gettext('Estimated Value')}
                                            </TableCell>
                                            <TableCell />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            balances &&
                                            Object.values(balances).sort(
                                                (a, b) => b.amount.comparedTo(a.amount)
                                            ).map(this.renderBalance)
                                        }
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </>
        )
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    const {
        balance: { balances },
        currency: { currencies },
        market: { markets },
        user: { me },
    } = state;
    return {
        balances,
        markets,
        currencies,
        me,
    };
};

export default connect(mapStateToProps)(withRouter(Investment));
