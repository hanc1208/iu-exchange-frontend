import React from 'react';
import { connect } from 'react-redux';

import Decimal from 'decimal.js';

import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import api from 'api';
import { RootState } from 'store/reducer';
import Balance, { BalanceMap } from 'types/balance';
import Currency, { CurrencyMap } from 'types/currency';
import { formatNumber } from 'utils/formatting';
import { gettext } from 'utils/translation';

interface StateProps {
    balances: BalanceMap | null;
    currencies: CurrencyMap | null;
}

interface OwnProps {
    currency: string;
}

type Props = StateProps & OwnProps;

interface State {
    withdrawalAmount: string;
    withdrawalAddress: string;
}

class Withdrawal extends React.Component<Props, State> {

    state: State = {
        withdrawalAmount: '',
        withdrawalAddress: '',
    };

    get balance(): Balance {
        const { balances, currency } = this.props;
        return balances && balances[currency] || Balance.getDefault(currency);
    }

    get currency(): Currency | null {
        const { currencies, currency } = this.props;
        return currencies && currencies[currency];
    }

    get withdrawalAmount(): Decimal {
        try {
            return new Decimal(this.state.withdrawalAmount);
        } catch {
            return new Decimal(0);
        }
    }

    get totalAmount(): Decimal {
        return this.withdrawalAmount.add(
            this.currency ? this.currency.withdrawalFee : new Decimal(0)
        );
    }

    get maximumWithdrawalAmount(): Decimal {
        if (!this.currency) return new Decimal(0);
        return Decimal.max(
            new Decimal(0),
            this.balance.amount.sub(
                this.currency.withdrawalFee
            ).toDP(this.currency.decimals, Decimal.ROUND_DOWN),
        );
    }

    get withdrawalAddressError(): string | null {
        const { withdrawalAddress } = this.state;
        if (!this.currency) return null;

        if (!this.currency.verifyAddress(withdrawalAddress)) {
            return gettext('Invalid address.');
        }
        return null;
    }

    get withdrawalAmountError(): string | null {
        if (!this.currency) return null;
        if (this.withdrawalAmount.lt(this.currency.minimumWithdrawalAmount)) {
            return gettext(
                'Minimum withdrawal amount is {{amount}}.',
                {
                    amount: formatNumber(
                        this.currency.minimumWithdrawalAmount,
                        this.currency.decimals,
                        { currency: this.currency.id, fixed: true },
                    ),
                },
            );
        }
        if (this.totalAmount.gt(this.balance.amount)) {
            return gettext('Not enough balance.');
        }
        return null;
    }

    get error(): boolean {
        return Boolean(this.withdrawalAddressError || this.withdrawalAmountError);
    }
    
    handleChangeWithdrawalAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { target: { value: withdrawalAddress } } = e;
        this.setState({ withdrawalAddress });
    }
    
    handleChangeWithdrawalAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { target: { value: withdrawalAmount } } = e;
        this.setState({ withdrawalAmount });
    }

    handleMaximumClick = async () => {
        this.setState({ withdrawalAmount: this.maximumWithdrawalAmount.toString() });
    }

    handleWithdrawClick = async () => {
        const { currency } = this.props;
        await api.post(`/balances/${currency}`);
    }

    get createWithdrawalForm(): React.ReactNode {
        if (!this.balance || !this.currency) return null;
        const { withdrawalAmount, withdrawalAddress } = this.state;
        const withdrawalAddressLabel = gettext(
            '{{currency}} Withdrawal Address',
            { currency: this.currency.name },
        );
        const withdrawButtonLabel = gettext(
            'Withdraw {{currency}}',
            { currency: this.currency.name },
        );
        return (
            <Grid container spacing={8}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label={withdrawalAddressLabel}
                        value={withdrawalAddress}
                        onChange={this.handleChangeWithdrawalAddress}
                        error={Boolean(withdrawalAddress && this.withdrawalAddressError)}
                        helperText={withdrawalAddress && this.withdrawalAddressError}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        type="number"
                        label={gettext('Available Withdrawal Amount')}
                        value={this.maximumWithdrawalAmount.toString()}
                        InputProps={{
                            readOnly: true,
                            endAdornment: (
                                <InputAdornment position="end">
                                    {this.currency.id}
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12} container spacing={8} alignItems="center">
                    <Grid item>
                        <TextField
                            type="number"
                            label={gettext('Withdrawal Amount')}
                            value={withdrawalAmount}
                            onChange={this.handleChangeWithdrawalAmount}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {this.currency.id}
                                    </InputAdornment>
                                ),
                            }}
                            error={Boolean(withdrawalAmount && this.withdrawalAmountError)}
                            helperText={withdrawalAmount && this.withdrawalAmountError}
                        />
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={this.handleMaximumClick}
                        >
                            {gettext('Maximum')}
                        </Button>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        type="number"
                        label={gettext('Fee')}
                        value={this.currency.withdrawalFee.toString()}
                        InputProps={{
                            readOnly: true,
                            endAdornment: (
                                <InputAdornment position="end">
                                    {this.currency.id}
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        type="number"
                        label={gettext('Total Withdrawal Amount')}
                        value={this.totalAmount.toString()}
                        InputProps={{
                            readOnly: true,
                            endAdornment: (
                                <InputAdornment position="end">
                                    {this.currency.id}
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={this.handleWithdrawClick}
                        disabled={this.error}
                    >
                        {withdrawButtonLabel}
                    </Button>
                </Grid>
            </Grid>
        );
    }

    get preparing(): React.ReactNode {
        if (!this.currency) return;
        return (
            <Typography>
                {
                    gettext(
                        '{{currency}} withdrawals are preparing.',
                        { currency: this.currency.name },
                    )
                }
            </Typography>
        );
    }

    render() {
        return (
            <Card>
                <CardContent>
                    {
                        this.currency && (
                            this.currency.withdrawalEnabled ?
                                this.createWithdrawalForm :
                                this.preparing
                        )
                    }
                </CardContent>
            </Card>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    const { balance: { balances }, currency: { currencies } } = state;
    return {
        balances,
        currencies,
    };
};

export default connect(mapStateToProps)(Withdrawal);
