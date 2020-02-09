import Decimal from 'decimal.js';

import { OrderSide } from './order';

export default interface Trade {
    id: string;
    createdAt: string;
    side: OrderSide;
    price: Decimal;
    volume: Decimal;
}
