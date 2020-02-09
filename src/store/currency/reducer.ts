import CurrencyAction from './action';
import { CurrencyMap } from 'types/currency';

export interface CurrencyState {
    currencies: CurrencyMap | null;
}

const DEFAULT_STATE: CurrencyState = {
    currencies: null,
};

const currency = (state: CurrencyState = DEFAULT_STATE, action: CurrencyAction) => {
    switch (action.type) {
        case 'SET_CURRENCY':
            return { ...state, currencies: action.currencies };
    }
    return state;
};

export default currency;
