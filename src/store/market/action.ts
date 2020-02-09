import { MarketMap } from 'types/market';

type MarketAction =
    | { type: 'SET_MARKETS', markets: MarketMap }
    ;

export const setMarkets = (markets: MarketMap): MarketAction => {
    return { type: 'SET_MARKETS', markets };
};

export default MarketAction;
