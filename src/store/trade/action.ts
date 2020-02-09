import Trade from 'types/trade';

type TradeAction =
    | { type: 'SET_TRADES', trades: Trade[] }
    ;

export const setTrades = (trades: Trade[]): TradeAction => {
    return { type: 'SET_TRADES', trades };
};

export default TradeAction;
