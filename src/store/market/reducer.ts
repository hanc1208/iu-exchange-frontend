import Decimal from 'decimal.js';

import Action from 'store/action';
import Market, { MarketMap } from 'types/market';

export interface MarketState {
    markets: MarketMap;
}

const DEFAULT_STATE: MarketState = {
    markets: {},
};

interface MarketResponse {
    pair: string;
    currentPrice: string;
    makerFee?: string;
    takerFee?: string;
    minimumOrderAmount?: string;
    dayVolume?: string;
}

const market = (state: MarketState = DEFAULT_STATE, action: Action) => {
    switch (action.type) {
        case 'WEB_SOCKET_MESSAGE':
            if (action.message.type === 'market') {
                const markets: MarketMap = { ...state.markets };
                for (const market of action.message.data as MarketResponse[]) {
                    const {
                        pair, currentPrice,
                        makerFee, takerFee, minimumOrderAmount, dayVolume,
                    } = market;
                    const [baseCurrency, quoteCurrency] = pair.split('/');
                    if (makerFee && takerFee && minimumOrderAmount && dayVolume) {
                        markets[pair] = new Market({
                            baseCurrency,
                            quoteCurrency,
                            currentPrice: new Decimal(currentPrice),
                            makerFee: new Decimal(makerFee),
                            takerFee: new Decimal(takerFee),
                            minimumOrderAmount: new Decimal(minimumOrderAmount),
                            dayVolume: new Decimal(dayVolume),
                        });
                    } else {
                        markets[pair] = markets[pair].copy();
                        markets[pair].currentPrice = new Decimal(currentPrice);
                    }
                }
                return { ...state, markets };
            }
            break;
        case 'SET_MARKETS':
            return { ...state, markets: action.markets };
    }
    return state;
};

export default market;
