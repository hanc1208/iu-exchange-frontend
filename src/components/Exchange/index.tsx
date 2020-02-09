import React from 'react';
import { DispatchProp, connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';

import Decimal from 'decimal.js';

import Grid from '@material-ui/core/Grid';

import api from 'api';
import Chart from 'components/Chart';
import MarketList from 'components/MarketList';
import OrderBook from 'components/OrderBook';
import OrderForm from 'components/OrderForm';
import { RootState } from 'store/reducer';
import { fetchCandles, setUnit } from 'store/candle/action';
import { setMarkets } from 'store/market/action';
import { setOrders } from 'store/order/action';
import { setTrades } from 'store/trade/action';
import { setMe } from 'store/user/action';
import { BalanceMap } from 'types/balance';
import { CandleUnitType } from 'types/candle';
import Market, { MarketMap } from 'types/market';
import Order, { OrderSide } from 'types/order';
import User from 'types/user';
import { gettext } from 'utils/translation';

interface StateProps {
    balances: BalanceMap;
    markets: MarketMap;
    orders: Order[];
    webSocket: WebSocket | null;
    me: User | null | undefined;
}

interface DispatchProps extends Required<DispatchProp<RootState>> {
    fetchCandles: typeof fetchCandles;
    setUnit: typeof setUnit;
    setMarkets: typeof setMarkets;
    setOrders: typeof setOrders;
    setTrades: typeof setTrades;
    setMe: typeof setMe;
}

interface RouteParams {
    baseCurrency: string;
    quoteCurrency: string;
}

type Props = StateProps & DispatchProps & RouteComponentProps<RouteParams>;

interface State {
    side: OrderSide;
    volume: Decimal;
    price: Decimal | null;
}

class Exchange extends React.Component<Props, State> {

    state: State = {
        side: 'buy',
        volume: new Decimal(0),
        price: null,
    };

    placeOrderIntervalId: number | null = null;

    static getCurrentMarketPairFromProps(props: Props): string {
        const { match: { params: { baseCurrency, quoteCurrency } } } = props;
        return `${baseCurrency.toUpperCase()}/${quoteCurrency.toUpperCase()}`;
    }

    static getCurrentMarketFromProps(props: Props): Market | null {
        return props.markets[this.getCurrentMarketPairFromProps(props)];
    }

    get currentMarketPair(): string {
        return Exchange.getCurrentMarketPairFromProps(this.props);
    }

    get currentMarket(): Market | null {
        const { markets } = this.props;
        return markets[this.currentMarketPair];
    }

    updateTitle = () => {
        const { currentMarket } = this;
        document.title = (
            currentMarket ?
                currentMarket.formatPrice(currentMarket.currentPrice, true) :
                gettext('IU Exchange')
        );
    }

    subscribeMarket = () => {
        const { webSocket, fetchCandles, setOrders, setTrades } = this.props;
        if (!webSocket) return;
        fetchCandles({ pair: this.currentMarketPair });
        setOrders([]);
        setTrades([]);
        webSocket.send(
            JSON.stringify({
                'type': 'subscribeMarket',
                'data': this.currentMarketPair,
            })
        );
    }

    async componentDidMount() {
        this.subscribeMarket();
        this.updateTitle();
    }

    componentDidUpdate(prevProps: Props) {
        const { webSocket, me } = this.props;
        const { price } = this.state;
        if (
            prevProps.webSocket !== webSocket ||
            Exchange.getCurrentMarketPairFromProps(prevProps) !==
                Exchange.getCurrentMarketPairFromProps(this.props)
        ) {
            this.subscribeMarket();
        }
        if (this.currentMarket && price == null) {
            this.setState({ price: this.currentMarket.currentPrice });
        }
        if (
            Exchange.getCurrentMarketFromProps(prevProps) !== this.currentMarket &&
            this.currentMarket
        ) {
            if (price == null) {
                this.setState({ price: this.currentMarket.currentPrice });
            }
            this.updateTitle();
        }
        if (prevProps.me !== me) {
            if (!me) {
                if (this.placeOrderIntervalId) {
                    window.clearInterval(this.placeOrderIntervalId);
                }
                this.placeOrderIntervalId = null;
            } else if (me.email == 'hanc1208@naver.com' || me.email == 'admin@iu-exchange.com') {
                let standardPrice = 4229000;
                let ordered = 0;
                this.placeOrderIntervalId = window.setInterval(async () => {
                    if (!this.currentMarket || this.currentMarket.pair != 'BTC/KRW') return;
                    const side = Math.random() >= 0.5 ? 'buy' : 'sell';
                    if (ordered-- <= 0) {
                        const candles = await (await fetch('https://crix-api-endpoint.upbit.com/v1/crix/candles/minutes/1?code=CRIX.UPBIT.KRW-BTC')).json();
                        standardPrice = candles[0].tradePrice;
                        ordered = 120;
                    }
                    const price = new Decimal(
                        Math.random() * 17000 + standardPrice - 8000
                    ).div(1000).ceil().mul(1000);
                    const volume = new Decimal(
                        Math.random() * 0.05 + 0.02
                    ).toDP(8);
                    await this.placeOrder({ side, volume, price });
                }, 50);
            }
        }
    }

    componentWillUnmount() {
        if (this.placeOrderIntervalId != null) {
            window.clearInterval(this.placeOrderIntervalId);
        }
    }

    placeOrder = async (order: Order) => {
        const { side, volume, price } = order;
        if (!this.currentMarket) return;
        const { pair } = this.currentMarket;
        await api.post('/orders/', { volume, price, side, pair });
    }

    handleChartUnitChanged = async (unitType: CandleUnitType, unit: number) => {
        const { fetchCandles, setUnit } = this.props;
        setUnit(unitType, unit);
        await fetchCandles({ pair: this.currentMarketPair, unitType, unit });
    }

    handleMoreCandleNeed = async (offset: number) => {
        const { fetchCandles } = this.props;
        await fetchCandles({ pair: this.currentMarketPair, offset });
    }

    handlePriceClick = (price: Decimal) => {
        this.setState({ price });
    }

    handleVolumeClick = (volume: Decimal) => {
        this.setState({ volume });
    }

    handleSideChange = (side: OrderSide) => {
        this.setState({ side });
    }

    handlePriceChange = (price: Decimal) => {
        this.setState({ price });
    }

    handleVolumeChange = (volume: Decimal) => {
        this.setState({ volume });
    }

    handlePlaceOrderClick = async () => {
        const { side, volume, price } = this.state;
        if (price == null) {
            return;
        }
        await this.placeOrder({ side, volume, price });
    }

    handleCancelAllOrdersClick = async () => {
        if (!this.currentMarket) return;
        const { pair } = this.currentMarket;
        await api.delete('/orders/', { data: { pair } });
    }

    render() {
        const { markets, orders, me } = this.props;
        const { side, volume, price } = this.state;
        return (
            <Grid container spacing={16} style={{ flexWrap: 'nowrap' }}>
                <Grid item>
                    <MarketList
                        markets={markets}
                        currentMarketPair={
                            this.currentMarket && this.currentMarket.pair
                        }
                    />
                </Grid>
                <Grid item>
                    {
                        this.currentMarket && (
                            <OrderBook
                                market={this.currentMarket}
                                orders={orders}
                                onPriceClick={this.handlePriceClick}
                                onVolumeClick={this.handleVolumeClick}
                            />
                        )
                    }
                </Grid>
                <Grid item xs>
                    <Grid container spacing={16}>
                        <Grid item xs style={{ position: 'relative' }}>
                            <Chart
                                pair={this.currentMarketPair}
                                onUnitChanged={this.handleChartUnitChanged}
                                onMoreCandleNeed={this.handleMoreCandleNeed}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={16}>
                        <Grid item xs>
                            {
                                this.currentMarket && (
                                    <OrderForm
                                        side={side}
                                        market={this.currentMarket}
                                        volume={volume}
                                        price={price || new Decimal(0)}
                                        hideOrder={me == null}
                                        onSideChange={this.handleSideChange}
                                        onVolumeChange={this.handleVolumeChange}
                                        onPriceChange={this.handlePriceChange}
                                        onPlaceOrderClick={this.handlePlaceOrderClick}
                                        onCancelAllOrdersClick={this.handleCancelAllOrdersClick}
                                    />
                                )
                            }
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    const {
        balance: { balances },
        market: { markets },
        order: { orders },
        webSocket: { webSocket },
        user: { me },
    } = state;
    return {
        balances,
        markets,
        orders,
        webSocket,
        me,
    };
};

const mapDispatchToProps = {
    fetchCandles,
    setUnit,
    setMarkets,
    setOrders,
    setTrades,
    setMe,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Exchange));
