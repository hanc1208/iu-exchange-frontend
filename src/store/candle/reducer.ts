import Decimal from 'decimal.js';

import Action from 'store/action';
import Candle, { CandleUnitType } from 'types/candle';

export interface CandleState {
    unitType: CandleUnitType;
    unit: number;
    candles: Candle[] | null;
}

const DEFAULT_STATE: CandleState = {
    unitType: 'minutes',
    unit: 1,
    candles: null,
};

const user = (state: CandleState = DEFAULT_STATE, action: Action) => {
    switch (action.type) {
        case 'WEB_SOCKET_MESSAGE':
            switch (action.message.type) {
                case 'trade': {
                    const candles = [
                        ...(state.candles || []).map(
                            candle => ({ ...candle })
                        )
                    ];
                    for (const trade of action.message.data) {
                        const timestamp = new Date(trade.created_at).getTime();
                        const price = new Decimal(trade.price);
                        const volume = new Decimal(trade.volume);
                        const { unitType, unit } = state;
                        const quoteVolume = price.mul(volume);
                        if (
                            candles.length == 0 ||
                            timestamp >= candles[0].timestamp + unit * 60000
                        ) {
                            candles.unshift({
                                timestamp: timestamp - (timestamp % (unit * 60000)),
                                open: price,
                                low: price,
                                close: price,
                                high: price,
                                volume,
                                quoteVolume,
                                unitType,
                                unit,
                            });
                        } else if (timestamp >= candles[0].timestamp) {
                            candles[0].close = price;
                            candles[0].high = Decimal.max(candles[0].high, price);
                            candles[0].low = Decimal.min(candles[0].low, price);
                            candles[0].volume = candles[0].volume.add(volume);
                            candles[0].quoteVolume = candles[0].quoteVolume.add(quoteVolume);
                        }
                    }
                    return { ...state, candles };
                }
            }
            break;
        case 'SET_UNIT':
            return { ...state, unitType: action.unitType, unit: action.unit };
        case 'SET_CANDLES':
            return { ...state, candles: action.candles };
    }
    return state;
};

export default user;
