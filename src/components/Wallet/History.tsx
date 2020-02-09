import React from 'react';
import { connect } from 'react-redux';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import api from 'api';
import { RootState } from 'store/reducer';
import { CurrencyMap } from 'types/currency';
import { BaseTransaction, BlockchainTransaction, Deposit } from 'types/transaction';
import { formatNumber } from 'utils/formatting';
import { gettext } from 'utils/translation';

interface StateProps {
    currencies: CurrencyMap | null;
}

interface OwnProps {
    currency: string;
}

type Props = StateProps & OwnProps;

interface State {
    deposits: Deposit[];
    transactions: BlockchainTransaction[];
}

class History extends React.Component<Props, State> {

    state: State = {
        deposits: [],
        transactions: [],
    };

    async componentDidMount() {
        const { currency } = this.props;
        const [deposits, transactions] = await Promise.all([
            api.get(
                '/transactions/deposits/',
                { params: { currency } },
            ).then(
                response => response.data
            ),
            api.get(
                '/transactions/',
                { params: { types: ['blockchain'], currency } },
            ).then(
                response => response.data
            ),
        ]);
        this.setState({
            deposits: deposits.map(Deposit.fromPayload),
            transactions: transactions.map(BaseTransaction.fromPayload),
        });
    }

    handleTxidClick = (txId: string) => {
        window.open(`https://ropsten.etherscan.io/tx/${txId}/`, '_blank');
    }

    renderDeposit = (deposit: Deposit): React.ReactNode => {
        const { currencies } = this.props;
        if (!currencies) return null;
        const currency = currencies && currencies[deposit.currency];
        return (
            <TableRow key={deposit.id}>
                <TableCell>
                    <Typography>
                        {gettext('Pending confirmations')}
                    </Typography>
                </TableCell>
                <TableCell>
                    <Typography>
                        {currency.name}
                    </Typography>
                </TableCell>
                <TableCell>
                    <Typography align="right">
                        {
                            formatNumber(
                                deposit.amount,
                                currency.decimals,
                                { currency: currency.id, fixed: true },
                            )
                        }
                    </Typography>
                </TableCell>
                <TableCell>
                    <Button
                        fullWidth
                        color="primary"
                        onClick={() => this.handleTxidClick(deposit.txId)}
                    >
                        TXID ({deposit.confirmations} / {currency.confirmations})
                    </Button>
                </TableCell>
            </TableRow>
        );
    }

    renderTransaction = (transaction: BlockchainTransaction): React.ReactNode => {
        const { currencies } = this.props;
        if (!currencies) return null;
        const currency = currencies && currencies[transaction.currency];
        return (
            <TableRow key={transaction.id}>
                <TableCell>
                    <Typography>
                        {transaction.createdAt.toLocaleString()}
                    </Typography>
                </TableCell>
                <TableCell>
                    <Typography>
                        {currency.name}
                    </Typography>
                </TableCell>
                <TableCell>
                    <Typography align="right">
                        {
                            formatNumber(
                                transaction.amount,
                                currency.decimals,
                                { currency: currency.id, fixed: true },
                            )
                        }
                    </Typography>
                </TableCell>
                <TableCell align="center">
                    {
                        transaction.txId && (
                            <Button
                                color="primary"
                                onClick={
                                    () => (
                                        transaction.txId &&
                                        this.handleTxidClick(transaction.txId)
                                    )
                                }
                            >
                                TXID
                            </Button>
                        )
                    }
                </TableCell>
            </TableRow>
        );
    }

    render() {
        const { deposits, transactions } = this.state;
        return (
            <Card>
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    {gettext('Date')}
                                </TableCell>
                                <TableCell>
                                    {gettext('Name')}
                                </TableCell>
                                <TableCell>
                                    {gettext('Quantity')}
                                </TableCell>
                                <TableCell>
                                    {gettext('TXID')}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {deposits.map(this.renderDeposit)}
                            {transactions.map(this.renderTransaction)}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    const { currency: { currencies } } = state;
    return {
        currencies,
    };
};

export default connect(mapStateToProps)(History);
