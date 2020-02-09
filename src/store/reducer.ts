import { combineReducers } from 'redux';

import candle, { CandleState } from './candle/reducer';
import currency, { CurrencyState } from './currency/reducer';
import balance, { BalanceState } from './balance/reducer';
import market, { MarketState } from './market/reducer';
import modal, { ModalState } from './modal/reducer';
import order, { OrderState } from './order/reducer';
import trade, { TradeState } from './trade/reducer';
import user, { UserState } from './user/reducer';
import webSocket, { WebSocketState } from './webSocket/reducer';

export interface RootState {
    candle: CandleState;
    currency: CurrencyState;
    balance: BalanceState;
    market: MarketState;
    modal: ModalState;
    order: OrderState;
    trade: TradeState;
    user: UserState;
    webSocket: WebSocketState;
}

export default combineReducers<RootState>({
    candle,
    currency,
    balance,
    market,
    modal,
    order,
    trade,
    user,
    webSocket,
});
