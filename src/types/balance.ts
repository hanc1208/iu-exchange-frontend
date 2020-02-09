import Decimal from 'decimal.js';

import { MarketMap } from './market';

export type BalanceMap = {[currency: string]: Balance};

export default class Balance {
    public currency: string;
    public amount: Decimal;
    public lockedAmount: Decimal;
    public depositAddress: string | null;

    constructor(balance: Pick<Balance, 'currency' | 'amount' | 'lockedAmount' | 'depositAddress'>) {
        Object.assign(this, balance);
    }

    static getDefault(currency: string): Balance {
        return new Balance({
            amount: new Decimal(0),
            lockedAmount: new Decimal(0),
            depositAddress: null,
            currency,
        });
    }

    static fromPayload(payload: any): Balance {
        return new Balance({
            currency: payload.currency,
            amount: new Decimal(payload.amount),
            lockedAmount: new Decimal(payload.locked_amount),
            depositAddress: payload.deposit_address,
        });
    }

    get usableAmount(): Decimal {
        return this.amount.sub(this.lockedAmount);
    }

    getEstimatedValue = (markets: MarketMap, targetQuoteCurrency: string) => {
        let currentPrice: Decimal = new Decimal(0);
        if (this.currency === targetQuoteCurrency) {
            currentPrice = new Decimal(1);
        } else if (markets) {
            const quoteCurrencies = ['KRW', 'BTC', 'ETH'];
            for (const quoteCurrency of quoteCurrencies) {
                const market = markets[`${this.currency}/${quoteCurrency}`];
                if (market) {
                    if (quoteCurrency === 'KRW') {
                        currentPrice = market.currentPrice;
                        break;
                    } else {
                        const quoteMarket = markets[`${quoteCurrency}/KRW`];
                        if (quoteMarket) {
                            const balanceQuoteMarket = markets[`${targetQuoteCurrency}/KRW`];
                            if (balanceQuoteMarket) {
                                currentPrice = (
                                    market.currentPrice
                                        .mul(quoteMarket.currentPrice)
                                        .div(balanceQuoteMarket.currentPrice)
                                );
                                break;
                            }
                        }
                    }
                }
            }
        }
        return this.amount.mul(currentPrice);
    }
}
