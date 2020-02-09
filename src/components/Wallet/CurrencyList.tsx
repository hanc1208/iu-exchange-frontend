import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';

import Decimal from 'decimal.js';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import { RootState } from 'store/reducer';
import Balance, { BalanceMap } from 'types/balance';
import { CurrencyMap } from 'types/currency';
import { MarketMap } from 'types/market';
import { formatNumber } from 'utils/formatting';
import { gettext } from 'utils/translation';

interface StateProps {
    balances: BalanceMap;
    currencies: CurrencyMap | null;
    markets: MarketMap | null;
}

interface OwnProps {
    currentCurrency: string;
}

type Props = StateProps & OwnProps & RouteComponentProps;

interface State {
    currency: string;
    balanceQuoteCurrency: string;
}

class CurrencyList extends React.Component<Props, State> {

    state: State = {
        currency: 'ETH',
        balanceQuoteCurrency: 'ETH',
    };

    getEstimatedValue = (currency: string): Decimal => {
        const { balances, markets } = this.props;
        const { balanceQuoteCurrency } = this.state;
        const balance = balances[currency];
        if (!markets || !balance) return new Decimal(0);
        return balance.getEstimatedValue(markets, balanceQuoteCurrency);
    }

    handleCurrencyClick = (currency: string) => {
        const { history } = this.props;
        history.push(`/balances/${currency.toLowerCase()}/deposit/`);
    }

    renderBalance = (balance: Balance): React.ReactNode => {
        const { currencies, currentCurrency } = this.props;
        const { balanceQuoteCurrency } = this.state;
        if (!currencies) return null;

        const currency = currencies[balance.currency];
        const estimatedValue = this.getEstimatedValue(balance.currency);
        return (
            <TableRow
                key={currency.id}
                hover
                selected={currency.id === currentCurrency}
                onClick={() => this.handleCurrencyClick(currency.id)}
            >
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
                    <Typography variant="caption">
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
            </TableRow>
        );
    }

    get head(): React.ReactNode {
        return (
            <TableRow>
                <TableCell />
                <TableCell>
                    {gettext('Name')}
                </TableCell>
                <TableCell align="right">
                    {gettext('Balance')}
                </TableCell>
            </TableRow>
        );
    }

    get body(): React.ReactNode {
        const { balances, currencies, markets } = this.props;
        const { balanceQuoteCurrency } = this.state;
        return balances && currencies && markets && (
            Object.values(currencies).map(
                ({ id: currency }) => (
                    balances[currency] || Balance.getDefault(currency)
                )
            ).sort(
                (a, b) => (
                    currencies[a.currency].name.localeCompare(
                        currencies[b.currency].name
                    )
                )
            ).sort(
                (a, b) => (
                    ['ETH'].indexOf(b.currency) -
                    ['ETH'].indexOf(a.currency)
                )
            ).sort(
                (a, b) => (
                    b.getEstimatedValue(markets, balanceQuoteCurrency).comparedTo(
                        a.getEstimatedValue(markets, balanceQuoteCurrency)
                    )
                )
            ).map(this.renderBalance)
        )
    }

    render() {
        return (
            <Card>
                <CardContent>
                    <Table>
                        <TableHead>
                            {this.head}
                        </TableHead>
                        <TableBody>
                            {this.body}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    const {
        currency: { currencies },
        market: { markets },
        balance: { balances },
    } = state;
    return {
        balances,
        markets,
        currencies,
    };
};

export default connect(mapStateToProps)(withRouter(CurrencyList));
