import Decimal from 'decimal.js';

import Action from 'store/action';
import Trade from 'types/trade';

export interface TradeState {
    trades: Trade[];
}

const DEFAULT_STATE: TradeState = {
    trades: [],
};

const trade = (state: TradeState = DEFAULT_STATE, action: Action) => {
    switch (action.type) {
        case 'WEB_SOCKET_MESSAGE':
            if (action.message.type === 'trade') {
                const newTrades = action.message.data.map(
                    ({ createdAt, volume, price, ...t }: any) => ({
                        ...t,
                        createdAt,
                        volume: new Decimal(volume),
                        price: new Decimal(price),
                    })
                );
                return { ...state, trades: [...state.trades, ...newTrades].slice(-14) };
            }
            break;
        case 'SET_TRADES':
            return { ...state, trades: action.trades };
    }
    return state;
};

export default trade;
