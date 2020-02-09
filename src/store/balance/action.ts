import { BalanceMap } from 'types/balance';

type BalanceAction =
    | { type: 'SET_BALANCES', balances: BalanceMap }
    | { type: 'UPDATE_BALANCES', balances: BalanceMap }
    ;

export const setBalances = (balances: BalanceMap): BalanceAction => {
    return { type: 'SET_BALANCES', balances };
};

export const updateBalances = (balances: BalanceMap): BalanceAction => {
    return { type: 'UPDATE_BALANCES', balances };
};

export default BalanceAction;
