import React from 'react';
import { connect } from 'react-redux';

import Decimal from 'decimal.js';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import createStyles from '@material-ui/core/styles/createStyles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';

import { RootState } from 'store/reducer';
import { BalanceMap } from 'types/balance';
import { CurrencyMap } from 'types/currency';
import { OrderSide } from 'types/order';

const styles = createStyles((theme: Theme) => ({
    percent: {
        [theme.breakpoints.down('xs')]: {
            paddingLeft: theme.spacing.unit,
            paddingRight: theme.spacing.unit,
            paddingTop: theme.spacing.unit / 2,
            paddingBottom: theme.spacing.unit / 2,
            minWidth: 0,
            minHeight: 0,
        },
    },
}));

interface StateProps {
    balances: BalanceMap;
    currencies: CurrencyMap | null;
}

interface OwnProps {
    side: OrderSide;
    baseCurrency: string;
    quoteCurrency: string;
    volume: string;
    price: string;
    onChange(volume: Decimal): void;
}

type Props = StateProps & OwnProps & WithStyles;

interface State {
    volume: string;
    percent: number | null;
}

class Volume extends React.PureComponent<Props> {

    state: State = {
        volume: this.props.volume.toString(),
        percent: null,
    };

    get price(): Decimal {
        return new Decimal(this.props.price);
    }

    get volume(): Decimal {
        return new Decimal(this.props.volume);
    }

    static getVolume(props: Props, percent: number): Decimal {
        const { side, balances, currencies, baseCurrency, quoteCurrency } = props;
        if (!currencies) return new Decimal(0);
        const price = new Decimal(props.price);
        const zero = new Decimal(0);
        const baseBalance = balances[baseCurrency] && balances[baseCurrency].usableAmount || zero;
        const quoteBalance = balances[quoteCurrency] && balances[quoteCurrency].usableAmount || zero;
        const maxVolume = (
            side === 'buy' ?
                price.isZero() ? zero : quoteBalance.div(price) :
                baseBalance
        );
        return maxVolume.mul(percent).toDP(
            currencies[baseCurrency].decimals, Decimal.ROUND_DOWN
        );
    }

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { target: { value: volume } } = e;
        const { onChange } = this.props;
        try {
            this.setState({ volume, percent: null });
            onChange(new Decimal(volume || 0));
        } catch {}
    }

    handlePercentClick = (percent: number) => {
        const { onChange } = this.props;
        const volume = Volume.getVolume(this.props, percent);
        onChange(volume);
        this.setState({ percent });
    }

    componentDidUpdate(prevProps: Props) {
        const { side, balances, onChange } = this.props;
        const { percent } = this.state;
        if (!new Decimal(prevProps.volume).eq(this.volume)) {
            if (
                percent != null &&
                !Volume.getVolume(prevProps, percent).eq(this.volume)
            ) {
                this.setState({ percent: null });
            }
            try {
                if (!new Decimal(this.state.volume).eq(this.volume)) {
                    this.setState({ volume: this.props.volume });
                }
            } catch {
                this.setState({ volume: this.props.volume });
            }
        }
        if (
            prevProps.side !== side ||
            prevProps.balances !== balances ||
            !new Decimal(prevProps.price).eq(this.price)
        ) {
            if (percent != null) {
                const volume = Volume.getVolume(this.props, percent);
                onChange(volume);
            }
        }
    }

    renderPercent = (percent: number) => {
        const { classes } = this.props;
        const { percent: currentPercent } = this.state;
        return (
            <Button
                className={classes.percent}
                variant="contained"
                fullWidth
                color={currentPercent == percent ? 'primary' : 'default'}
                onClick={() => this.handlePercentClick(percent)}
            >
                {percent * 100}%
            </Button>
        );
    }

    render() {
        const { baseCurrency } = this.props;
        const { volume } = this.state;
        return (
            <Grid container spacing={8}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        type="number"
                        inputProps={{ min: 0, step: 0.00000001 }}
                        value={volume}
                        onChange={this.handleChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    {baseCurrency}
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={3}>
                    {this.renderPercent(0.1)}
                </Grid>
                <Grid item xs={3}>
                    {this.renderPercent(0.25)}
                </Grid>
                <Grid item xs={3}>
                    {this.renderPercent(0.5)}
                </Grid>
                <Grid item xs={3}>
                    {this.renderPercent(1)}
                </Grid>
            </Grid>
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

export default connect(mapStateToProps)(withStyles(styles)(Volume));
