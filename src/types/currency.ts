import Decimal from 'decimal.js';

import { formatNumber } from 'utils/formatting';
import { gettext } from 'utils/translation';

export type CurrencyMap = {[id: string]: Currency};

type CurrencyConstructorArgs = Pick<
    Currency,
    | 'id' | 'name' | 'decimals' | 'confirmations'
    | 'minimumDepositAmount' | 'minimumWithdrawalAmount' | 'withdrawalFee'
>;

export default class Currency {
    id: string;
    _name: string;
    decimals: number;
    confirmations: number;
    minimumDepositAmount: Decimal;
    minimumWithdrawalAmount: Decimal;
    withdrawalFee: Decimal;

    constructor(currency: CurrencyConstructorArgs) {
        Object.assign(this, currency);
    }

    get name(): string {
        return gettext(this._name);
    }

    set name(value: string) {
        this._name = value;
    }

    get iconUrl(): string {
        return `/static/currencies/${this.id}.png`;
    }

    get depositEnabled(): boolean {
        return ['BTC', 'ETH'].includes(this.id);
    }

    get withdrawalEnabled(): boolean {
        return false;
    }

    verifyAddress = (address: string): boolean => {
        switch (this.id) {
            case 'ETH':
                return /^0x[a-f\d]{40}$/i.test(address);
            case 'BTC':
                return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address);
        }
        return false;
    }

    format(amount: Decimal, includeCurrency: boolean = false) {
        const formatted = formatNumber(amount, this.decimals, { fixed: true });
        return includeCurrency ? `${formatted} ${this.id}` : formatted;
    }
}
