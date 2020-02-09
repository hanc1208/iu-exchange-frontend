import React from 'react';
import { connect } from 'react-redux';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import api from 'api';
import { updateBalances } from 'store/balance/action';
import { RootState } from 'store/reducer';
import Balance, { BalanceMap } from 'types/balance';
import Currency, { CurrencyMap } from 'types/currency';
import { formatNumber } from 'utils/formatting';
import { gettext } from 'utils/translation';

interface StateProps {
    balances: BalanceMap | null;
    currencies: CurrencyMap | null;
}

interface DispatchProps {
    updateBalances: typeof updateBalances;
}

interface OwnProps {
    currency: string;
}

type Props = StateProps & DispatchProps & OwnProps;

class Deposit extends React.Component<Props> {

    depositAddressRef: React.RefObject<HTMLInputElement>;

    constructor(props: Props) {
        super(props);
        this.depositAddressRef = React.createRef();
    }

    get balance(): Balance {
        const { balances, currency } = this.props;
        return balances && balances[currency] || Balance.getDefault(currency);
    }

    get currency(): Currency | null {
        const { currencies, currency } = this.props;
        return currencies && currencies[currency];
    }

    handleCreateDepositAddressClick = async () => {
        const { currency, updateBalances } = this.props;
        const url = `/balances/${currency.toLowerCase()}/deposit_address/`;
        const response = (await api.post(url)).data;
        updateBalances({ [currency]: Balance.fromPayload(response) });
    }

    handleCopyDepositAddressClick = () => {
        this.depositAddressRef.current!.select();
        document.execCommand('copy');
    }

    get depositInfo(): React.ReactNode {
        if (!this.balance.depositAddress || !this.currency) return null;
        const depositAddressLabel = gettext(
            '{{currency}} Deposit Address',
            { currency: this.currency.name },
        );
        const confirmationsLabel = (
            gettext(
                '{{currency}} deposits are reflected to the balance after {{confirmations}} confirmations.',
                {
                    currency: this.currency.name,
                    confirmations: this.currency.confirmations,
                },
            )
        );
        const minimumDepositAmountLabel = (
            gettext(
                'Minimum deposit amount is {{amount}}.',
                {
                    amount: formatNumber(
                        this.currency.minimumDepositAmount,
                        this.currency.decimals,
                        { currency: this.currency.id },
                    ),
                },
            )
        );
        return (
            <Grid container spacing={8}>
                <Grid item xs={12} container spacing={8} alignItems="center">
                    <Grid item xs>
                        <TextField
                            fullWidth
                            label={depositAddressLabel}
                            value={this.balance.depositAddress}
                            inputProps={{
                                readOnly: true,
                                ref: this.depositAddressRef,
                            }}
                        />
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={this.handleCopyDepositAddressClick}
                        >
                            {gettext('Copy')}
                        </Button>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Typography>
                        {confirmationsLabel}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography color="error">
                        {minimumDepositAmountLabel}
                    </Typography>
                </Grid>
            </Grid>
        );
    }

    get createDepositAddressForm(): React.ReactNode {
        if (!this.currency) return;
        const createDepositAddressButtonLabel = gettext(
            'Create {{currency}} Deposit Address',
            { currency: this.currency.name },
        );
        return (
            <Button
                variant="contained"
                color="primary"
                onClick={this.handleCreateDepositAddressClick}
            >
                {createDepositAddressButtonLabel}
            </Button>
        );
    }

    get preparing(): React.ReactNode {
        if (!this.currency) return;
        if (this.currency.id === 'ORBS') {
            return (
                <>
                    <Typography paragraph>
                        Orbs는 이더리움 입금 주소에 입금하신 후 아래 폼을 작성해주세요.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSeY1O1aBdfPbHBmGEZhL2Pepl9Isag4vmzB_9z2IF4tflWi-A/viewform')}
                    >
                        Orbs 입금 폼 작성
                    </Button>
                </>
            )
        }
        return (
            <Typography>
                {
                    gettext(
                        '{{currency}} deposits are preparing.',
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
                        this.currency && this.balance && (
                            this.currency.depositEnabled ?
                                (
                                    this.balance.depositAddress ?
                                        this.depositInfo :
                                        this.createDepositAddressForm
                                ) :
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

const mapDispatchToProps = {
    updateBalances,
};

export default connect(mapStateToProps, mapDispatchToProps)(Deposit);
