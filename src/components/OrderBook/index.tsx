import React from 'react';
import { DispatchProp, connect } from 'react-redux';

import Decimal from 'decimal.js';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import { sideColor } from 'components/App/theme';
import ShortMarketTradeHistory from 'components/ShortMarketTradeHistory';
import { RootState } from 'store/reducer';
import { CurrencyMap } from 'types/currency';
import Market from 'types/market';
import Order, { OrderSide } from 'types/order';
import { formatNumber } from 'utils/formatting';
import { gettext } from 'utils/translation';

interface PriceProps {
    side: OrderSide;
    price: string | null;
    decimalPlaces?: number;
    current?: boolean;
    onClick?(price: Decimal | null): void;
}

class Price extends React.PureComponent<PriceProps> {
    
    get price(): Decimal | null {
        const { price } = this.props;
        return price ? new Decimal(price) : null;
    }

    handleClick = () => {
        const { onClick } = this.props;
        onClick && onClick(this.price);
    }

    render() {
        const { side, decimalPlaces, current } = this.props;
        const background = sideColor[side];
        const border = current ? '2px solid black' : undefined;
        return (
            <TableCell
                padding="none"
                align="center"
                style={{ background, border }}
                onClick={this.handleClick}
            >
                {
                    this.price && (
                        <Typography>
                            {formatNumber(new Decimal(this.price), decimalPlaces)}
                        </Typography>
                    )
                }
            </TableCell>
        );
    }
}

interface VolumeProps {
    side: OrderSide;
    volume: string | null;
    maxVolume: number;
    decimalPlaces?: number;
    onClick?(volume: Decimal | null): void;
}

class Volume extends React.PureComponent<VolumeProps> {
    
    get volume(): Decimal | null {
        const { volume } = this.props;
        return volume ? new Decimal(volume) : null;
    }

    handleClick = () => {
        const { onClick } = this.props;
        onClick && onClick(this.volume);
    }

    render() {
        const { side, maxVolume, decimalPlaces } = this.props;
        const align = side === 'buy' ? 'left' : 'right';
        const background = sideColor[side];
        const width = (
            this.volume == null ?
                0 :
                `${this.volume.div(maxVolume).mul(100)}%`
        );
        const style: React.CSSProperties = {
            position: 'absolute',
            width,
            height: '24px',
            background,
            right: align === 'left' ? undefined : 0,
        };
        return (
            <TableCell
                padding="none"
                style={{ position: 'relative' }}
                align={align}
                onClick={this.handleClick}
            >
                <div style={style} />
                {
                    this.volume != null && (
                        <Typography style={{ position: 'relative' }}>
                            {formatNumber(this.volume, decimalPlaces, { fixed: true })}
                        </Typography>
                    )
                }
            </TableCell>
        );
    }
}


interface OrderBookRowProps {
    side: OrderSide;
    price: string | null;
    volume: string | null;
    current?: boolean;
    maxVolume: number;
    onPriceClick(price: Decimal | null): void;
    onVolumeClick(volume: Decimal | null): void;
    showMarketTradeHistory?: boolean;
    priceDecimalPlaces?: number;
    volumeDecimalPlaces?: number;
}

class OrderBookRow extends React.PureComponent<OrderBookRowProps> {

    get price() {
        const { side, price, current, onPriceClick, priceDecimalPlaces } = this.props;
        return (
            <Price
                side={side}
                price={price}
                decimalPlaces={priceDecimalPlaces}
                current={current}
                onClick={onPriceClick}
            />
        );
    }

    get volume() {
        const { side, volume, maxVolume, onVolumeClick } = this.props;
        return (
            <Volume
                side={side}
                volume={volume}
                maxVolume={maxVolume}
                decimalPlaces={3}
                onClick={onVolumeClick}
            />
        );
    }

    render() {
        const {
            side, showMarketTradeHistory,
            priceDecimalPlaces, volumeDecimalPlaces,
        } = this.props;
        return (
            <TableRow style={{ height: 42, cursor: 'pointer' }}>
                {
                    side === 'buy' ?
                        showMarketTradeHistory && (
                            <TableCell padding="none" rowSpan={8} style={{ verticalAlign: 'top' }}>
                                <ShortMarketTradeHistory
                                    priceDecimalPlaces={priceDecimalPlaces}
                                    volumeDecimalPlaces={volumeDecimalPlaces}
                                />
                            </TableCell>
                        ) :
                        this.volume
                }
                {this.price}
                {
                    side === 'buy' ?
                        this.volume :
                        <TableCell />
                }
            </TableRow>
        );
    }
}

interface StateProps {
    currencies: CurrencyMap | null;
}

interface OwnProps {
    market: Market;
    orders: Order[];
    onPriceClick(price: Decimal): void;
    onVolumeClick(volume: Decimal): void;
}

type Props = StateProps & DispatchProp<RootState> & OwnProps;

class OrderBook extends React.PureComponent<Props> {

    getOrders = (side: OrderSide) => {
        return this.props.orders.filter(
            o => o.side === side
        ).sort(
            (a, b) => b.price.comparedTo(a.price)
        );
    }

    get buyOrders(): Order[] {
        return this.getOrders('buy');
    }

    get sellOrders(): Order[] {
        return this.getOrders('sell');
    }

    get maxVolume() {
        return Decimal.max(
            ...this.props.orders.map(
                o => o.volume,
            ).concat(
                new Decimal(0),
            )
        );
    }

    handlePriceClick = (price: Decimal | null) => {
        const { onPriceClick } = this.props;
        price && onPriceClick && onPriceClick(price);
    }

    handleVolumeClick = (volume: Decimal | null) => {
        const { onVolumeClick } = this.props;
        volume && onVolumeClick && onVolumeClick(volume);
    }

    renderOrder = (side: OrderSide, order: Order | null, index: number): React.ReactNode => {
        const { market } = this.props;
        const showMarketTradeHistory = side === 'buy' && index === 0;
        return (
            <OrderBookRow
                key={order ? order.price.toNumber() : index}
                side={side}
                price={order && order.price.toString()}
                volume={order && order.volume.toString()}
                current={order != null && order.price.eq(market.currentPrice)}
                maxVolume={this.maxVolume.toNumber()}
                onPriceClick={this.handlePriceClick}
                onVolumeClick={this.handleVolumeClick}
                showMarketTradeHistory={showMarketTradeHistory}
                priceDecimalPlaces={market && order ? market.getPriceQuotation(order.price).dp() : undefined}
                volumeDecimalPlaces={3}
            />
        );
    }

    get title(): React.ReactNode {
        const { currencies, market } = this.props;
        if (!currencies) return null;
        return (
            <>

                {currencies[market.baseCurrency].name}
                {' '}
                <Typography
                    variant="caption"
                    style={{ display: 'inline-block' }}
                >
                    {market.pair}
                </Typography>
            </>
        );
    }

    get orderBook(): React.ReactNode {
        const count = 8;
        const buyOrders = [
            ...this.buyOrders,
            ...new Array(count).fill(null)
        ].slice(0, count);
        const sellOrders = [
            ...new Array(count).fill(null),
            ...this.sellOrders,
        ].slice(-count);
        return (
            <Table
                padding="none"
                style={{ borderCollapse: 'separate', tableLayout: 'fixed', width: 'auto' }}
            >
                <TableHead>
                    <TableRow>
                        <TableCell padding="none" align="center" style={{ width: 180 }}>
                            {gettext('Size')}
                        </TableCell>
                        <TableCell padding="none" align="center" style={{ width: 100 }}>
                            {gettext('Price')}
                        </TableCell>
                        <TableCell padding="none" align="center" style={{ width: 180 }}>
                            {gettext('Size')}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sellOrders.map(this.renderOrder.bind(this, 'sell'))}
                    {buyOrders.map(this.renderOrder.bind(this, 'buy'))}
                </TableBody>
            </Table>
        );
    }

    render() {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6">
                        {this.title}
                    </Typography>
                    {this.orderBook}
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

export default connect(mapStateToProps)(OrderBook);
