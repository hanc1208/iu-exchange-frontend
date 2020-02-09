import Decimal from 'decimal.js';

export type OrderSide = 'buy' | 'sell';

export default interface Order {
    side: OrderSide;
    volume: Decimal;
    price: Decimal;
}
