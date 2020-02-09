import { ThunkAction } from 'redux-thunk';

import Decimal from 'decimal.js';

import api from 'api';
import { RootState } from 'store/reducer';
import Currency, { CurrencyMap } from 'types/currency';

type CurrencyAction =
    | { type: 'SET_CURRENCY', currencies: CurrencyMap }
    ;

interface CurrencyResponse {
    id: string;
    name: string;
    decimals: number;
    confirmations: number;
    minimum_deposit_amount: string;
    minimum_withdrawal_amount: string;
    withdrawal_fee: string;
}

export const fetchCurrencies = (
    (): ThunkAction<Promise<void>, RootState, void, CurrencyAction> => async (dispatch) => {
        const data: CurrencyResponse[] = (await api.get('/currencies/')).data;
        const currencies: CurrencyMap = {};
        for (const currency of data) {
            currencies[currency.id] = new Currency({
                id: currency.id,
                name: currency.name,
                decimals: currency.decimals,
                confirmations: currency.confirmations,
                minimumDepositAmount: new Decimal(currency.minimum_deposit_amount),
                minimumWithdrawalAmount: new Decimal(currency.minimum_withdrawal_amount),
                withdrawalFee: new Decimal(currency.withdrawal_fee),
            });
        }
        dispatch({ type: 'SET_CURRENCY', currencies });
    }
);

export default CurrencyAction;
