import React from 'react';
import { connect } from 'react-redux';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import Dialog, { DialogProps } from 'components/Dialog';
import Balance, { BalanceMap } from 'types/balance';
import Currency, { CurrencyMap } from 'types/currency';
import { RootState } from 'store/reducer';
import { formatNumber } from 'utils/formatting';
import { gettext } from 'utils/translation';

interface StateProps {
    balances: BalanceMap;
    currencies: CurrencyMap | null;
}

interface OwnProps extends Omit<DialogProps, 'title' | 'content'> {
    currency: string;
}

type Props = StateProps & OwnProps;

class DepositDialog extends React.Component<Props> {

    get balance(): Balance {
        const { balances, currency } = this.props;
        return balances[currency];
    }

    get currency(): Currency | null {
        const { currencies, currency: currencyId } = this.props;
        return currencies && currencies[currencyId];
    }

    handleCreateDepositAddressClick = () => {

    }

    get title(): React.ReactNode {
        if (!this.currency) return null;
        return gettext(
            'Deposit {{currency}}',
            { currency: this.currency.name },
        );
    }

    get createDepositAddressButton(): React.ReactNode {
        if (!this.currency) return null;
        const label = gettext(
            'Create {{currency}} Deposit Address',
            { currency: this.currency.name },
        );
        return (
            <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={this.handleCreateDepositAddressClick}
            >
                {label}
            </Button>
        );
    }

    get content(): React.ReactNode {
        if (!this.currency) return null;
        return (
            <Grid container spacing={16}>
                <Grid item xs={12} container>
                    <Grid item>
                        <Typography>
                            {gettext('Balance')}
                        </Typography>
                    </Grid>
                    <Grid item xs>
                        <Typography align="right">
                            {
                                formatNumber(
                                    this.balance.amount,
                                    this.currency.decimals,
                                    { currency: this.currency.id, fixed: true },
                                )
                            }
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    {this.createDepositAddressButton}
                </Grid>
            </Grid>
        );
    }

    render() {
        const { ...dialogProps } = this.props;
        return (
            <Dialog
                title={this.title}
                content={this.content}
                {...dialogProps}
            />
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    const { balance: { balances }, currency: { currencies } } = state;
    return {
        balances,
        currencies,
    }
};

export default connect(mapStateToProps)(DepositDialog);
