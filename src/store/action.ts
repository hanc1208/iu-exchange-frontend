import BalanceAction from './balance/action';
import CandleAction from './candle/action';
import CurrencyAction from './currency/action';
import MarketAction from './market/action';
import ModalAction from './modal/action';
import OrderAction from './order/action';
import TradeAction from './trade/action';
import UserAction from './user/action';
import WebSocketAction from './webSocket/action';

type Action =
    | BalanceAction
    | CandleAction
    | CurrencyAction
    | MarketAction
    | ModalAction
    | OrderAction
    | TradeAction
    | UserAction
    | WebSocketAction
    ;

export default Action;
