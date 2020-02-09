import React from 'react';
import { connect } from 'react-redux';

import Decimal from 'decimal.js';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

import { sideColor, sideTextColor } from 'components/App/theme';
import { RootState } from 'store/reducer';
import { openModal } from 'store/modal/action';
import { BalanceMap } from 'types/balance';
import { CurrencyMap } from 'types/currency';
import Market from 'types/market';
import { OrderSide } from 'types/order';
import { formatNumber } from 'utils/formatting';
import { gettext } from 'utils/translation';

import Price from './Price';
import Volume from './Volume';

interface StateProps {
    balances: BalanceMap;
    currencies: CurrencyMap | null;
}

interface DispatchProps {
    openModal: typeof openModal;
}

interface OwnProps {
    side: OrderSide;
    market: Market;
    volume: Decimal;
    price: Decimal;
    hideOrder?: boolean;
    onSideChange(side: OrderSide): void;
    onVolumeChange(volume: Decimal): void;
    onPriceChange(price: Decimal): void;
    onPlaceOrderClick(): Promise<void>;
    onCancelAllOrdersClick(): Promise<void>;
}

type Props = StateProps & DispatchProps & OwnProps;

class OrderForm extends React.PureComponent<Props> {

    handleSideChange = (_: React.ChangeEvent<{}>, side: OrderSide) => {
        const { price, market, onSideChange, onPriceChange } = this.props;
        onSideChange(side as OrderSide);
        onPriceChange(market.currentPrice || price);
    }

    handlePlaceOrderClick = async () => {
        const { market, price, volume, onPlaceOrderClick, currencies, openModal } = this.props;
        const { minimumOrderAmount } = market;
        if (!currencies) return;
        const priceQuotation = market.getPriceQuotation(price);
        if (volume.mul(price).lt(minimumOrderAmount)) {
            openModal({
                title: gettext('Information'),
                content: gettext(
                    'Minimum order amount is {{amount}}.',
                    {
                        amount: this.formattedMinimumOrderAmount,
                    },
                ),
            });
            return;
        }
        if (price.lt(priceQuotation) || !price.mod(priceQuotation).isZero()) {
            openModal({
                title: gettext('Information'),
                content: gettext('Please check your order price.'),
            });
            return;
        }
        await onPlaceOrderClick();
    }

    static getSideLabel = (side: OrderSide) => {
        return side === 'buy' ? gettext('Buy') : gettext('Sell');
    }

    get sideLabel() {
        return OrderForm.getSideLabel(this.props.side);
    }

    get usableBalance(): Decimal {
        const { balances } = this.props;
        const balance = balances[this.balanceCurrency];
        return balance ? balance.usableAmount : new Decimal(0);
    }

    get usableBalanceText(): React.ReactNode {
        const { currencies } = this.props;
        if (!currencies) return null;
        const currency = currencies[this.balanceCurrency];
        return (
            formatNumber(
                this.usableBalance,
                currency.decimals,
                { currency: currency.id, fixed: true },
            )
        );
    }

    get balanceCurrency(): string {
        const { side, market } = this.props;
        return side === 'buy' ? market.quoteCurrency : market.baseCurrency;
    }

    get formattedMinimumOrderAmount(): string | null {
        const {
            market: { quoteCurrency, minimumOrderAmount }, currencies,
        } = this.props;
        if (!currencies) return null;
        const currency = currencies[quoteCurrency];
        return formatNumber(
            minimumOrderAmount,
            currency.decimals,
            { currency: currency.id },
        );
    }

    get tabs() {
        const { side } = this.props;
        return (
            <AppBar position="static" color="default">
                <Tabs
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="primary"
                    value={side}
                    onChange={this.handleSideChange}
                    TabIndicatorProps={{
                        style: { backgroundColor: sideColor[side] } as any,
                    }}
                >
                    {
                        (['buy', 'sell'] as OrderSide[]).map(
                            value => (
                                <Tab
                                    style={{ color: sideTextColor[value] }}
                                    key={value}
                                    value={value}
                                    label={OrderForm.getSideLabel(value)}
                                />
                            )
                        )
                    }
                </Tabs>
            </AppBar>
        );
    }

    get price() {
        const { market, price, onPriceChange } = this.props;
        return (
            <Price
                price={price.toString()}
                currency={market.quoteCurrency}
                onChange={onPriceChange}
            />
        );
    }

    get volume() {
        const { side, market, volume, price, onVolumeChange } = this.props;
        return (
            <Volume
                side={side}
                baseCurrency={market.baseCurrency}
                quoteCurrency={market.quoteCurrency}
                volume={volume.toString()}
                price={price.toString()}
                onChange={onVolumeChange}
            />
        );
    }

    get orderAmountText() {
        const { currencies, market, volume, price } = this.props;
        if (!currencies) return null;
        const currency = currencies[market.quoteCurrency];
        return (
            formatNumber(
                volume.mul(price),
                currency.decimals,
                { currency: currency.id, fixed: true },
            )
        );
    }

    get minimumOrderAmountAndFees(): string | null {
        const { market: { makerFee, takerFee }, currencies } = this.props;
        if (!currencies) return null;
        return [
            gettext(
                'Minimum order amount: {{amount}}',
                { amount: this.formattedMinimumOrderAmount },
            ),
            gettext(
                'Maker fee: {{fee}}%',
                { fee: makerFee.mul(100).toNumber() },
            ),
            gettext(
                'Taker fee: {{fee}}%',
                { fee: takerFee.mul(100).toNumber() },
            ),
        ].join(', ')
    }

    get placeOrderButton() {
        const { side, volume, price } = this.props;
        return (
            <Button
                variant="contained"
                color="primary"
                style={{ background: sideColor[side] }}
                fullWidth
                onClick={this.handlePlaceOrderClick}
                disabled={!volume || !price}
            >
                {this.sideLabel}
            </Button>
        );
    }

    get cancelOrdersButton() {
        const { volume, price, onCancelAllOrdersClick } = this.props;
        return (
            <Button
                variant="contained"
                fullWidth
                onClick={onCancelAllOrdersClick}
                disabled={!volume || !price}
            >
                {gettext('Cancel Orders')}
            </Button>
        );
    }

    render() {
        const { hideOrder } = this.props;
        return (
            <div>
                {this.tabs}
                <Card>
                    <CardContent>
                        <Grid container spacing={8}>
                            <Grid item xs={4}>
                                <Typography>
                                    {gettext('Usable')}
                                </Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography>
                                    {this.usableBalanceText}
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography>
                                    {gettext('Price')}
                                </Typography>
                            </Grid>
                            <Grid item xs={8}>
                                {this.price}
                            </Grid>
                            <Grid item xs={4}>
                                <Typography>
                                    {gettext('Quantity')}
                                </Typography>
                            </Grid>
                            <Grid item xs={8}>
                                {this.volume}
                            </Grid>
                            <Grid item xs={4}>
                                <Typography>
                                    {gettext('Order Amount')}
                                </Typography>
                            </Grid>
                            <Grid item xs={8}>
                                <Typography>
                                    {this.orderAmountText}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="caption">
                                    {this.minimumOrderAmountAndFees}
                                </Typography>
                            </Grid>
                            {
                                !hideOrder && (
                                    <>
                                        <Grid item xs={12}>
                                            {this.placeOrderButton}
                                        </Grid>
                                        <Grid item xs={12}>
                                            {this.cancelOrdersButton}
                                        </Grid>
                                    </>
                                )
                            }
                        </Grid>
                    </CardContent>
                </Card>
            </div>
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

const mapDispatchToProps = {
    openModal,
};

export default connect(mapStateToProps, mapDispatchToProps)(OrderForm);
