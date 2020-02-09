import Decimal from 'decimal.js';

export type MarketMap = {[pair: string]: Market};

type MarketConstructorArgs = Pick<
    Market,
    | 'baseCurrency' | 'quoteCurrency' | 'currentPrice'
    | 'takerFee' | 'makerFee' | 'minimumOrderAmount'
    | 'dayVolume'
>;

export default class Market {
    public baseCurrency: string;
    public quoteCurrency: string;
    public currentPrice: Decimal;
    public takerFee: Decimal;
    public makerFee: Decimal;
    public minimumOrderAmount: Decimal;
    public dayVolume: Decimal;

    constructor(market: MarketConstructorArgs) {
        Object.assign(this, market);
    }

    get serialized(): MarketConstructorArgs {
        return {
            baseCurrency: this.baseCurrency,
            quoteCurrency: this.quoteCurrency,
            currentPrice: this.currentPrice,
            takerFee: this.takerFee,
            makerFee: this.makerFee,
            minimumOrderAmount: this.minimumOrderAmount,
            dayVolume: this.dayVolume,
        };
    }

    copy = (): Market => {
        return new Market(this.serialized);
    }

    get pair(): string {
        return `${this.baseCurrency}/${this.quoteCurrency}`;
    }

    getPriceQuotation = (price: Decimal): Decimal => {
        let priceQuotations;
        if (this.quoteCurrency == 'ETH') {
            priceQuotations = [
                [0, '0.000001'],
            ].map(
                ([threshold, priceQuotation]) => ([
                    new Decimal(threshold),
                    new Decimal(priceQuotation),
                ])
            );
        } else {
            priceQuotations = [
                [2000000, 1000],
                [1000000, 500],
                [500000, 100],
                [100000, 50],
                [10000, 10],
                [1000, 5],
                [100, 1],
                [10, '0.1'],
                [0, '0.01'],
            ].map(
                ([threshold, priceQuotation]) => ([
                    new Decimal(threshold),
                    new Decimal(priceQuotation),
                ])
            );
        }
        for (const [threshold, priceQuotation] of priceQuotations) {
            if (price.gte(threshold)) {
                return priceQuotation;
            }
        }
        throw new Error();
    }

    formatPrice(price: Decimal, includePair: boolean = false) {
        const dp = this.getPriceQuotation(price).dp();
        const formatted = price.toDP(dp, Decimal.ROUND_DOWN).toNumber().toLocaleString(
            'en-US',
            { maximumFractionDigits: dp },
        );
        return includePair ? `${formatted} ${this.pair}` : formatted;
    }
}
