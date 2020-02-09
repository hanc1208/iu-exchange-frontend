import Action from 'store/action';
import Balance, { BalanceMap } from 'types/balance';

export interface BalanceState {
    balances: BalanceMap;
}

const DEFAULT_STATE: BalanceState = {
    balances: {},
};

const balance = (state: BalanceState = DEFAULT_STATE, action: Action) => {
    switch (action.type) {
        case 'WEB_SOCKET_MESSAGE':
            if (action.message.type === 'balance') {
                const newBalances = Object.entries(action.message.data).map(
                    ([currency, balance]: any) => (
                        [currency, Balance.fromPayload(balance)]
                    )
                ).reduce(
                    (o, [currency, balance]) => ({ ...o, [currency]: balance }), {}
                );
                return { ...state, balances: { ...state.balances, ...newBalances } };
            }
            break;
        case 'SET_BALANCES':
            return { ...state, balances: action.balances };
        case 'UPDATE_BALANCES':
            return { ...state, balances: { ...state.balances, ...action.balances } };
    }
    return state;
};

export default balance;
