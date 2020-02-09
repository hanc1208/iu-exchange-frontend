import Decimal from 'decimal.js';

export type CandleUnitType = 'minutes';

export default interface Candle {
    timestamp: number;
    open: Decimal;
    high: Decimal;
    low: Decimal;
    close: Decimal;
    volume: Decimal;
    quoteVolume: Decimal;
    unitType: CandleUnitType;
    unit: number;
}
