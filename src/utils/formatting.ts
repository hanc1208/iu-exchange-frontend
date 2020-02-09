import Decimal from 'decimal.js';

import { gettext } from './translation';

interface FormatNumberArgs {
    fixed?: boolean;
    currency?: string;
    short?: boolean;
}

export const formatNumber = (
    value: Decimal | number, decimalPlaces: number = 0,
    { fixed = false, currency, short = false }: FormatNumberArgs = {},
) => {
    if (typeof(value) === 'number') {
        value = new Decimal(value);
    }
    let postfix = '';
    if (short) {
        const siPrefixes: [number, string][] = [
            [6, gettext('M')],
        ];
        for (const [n, siPrefix] of siPrefixes) {
            if (value.log().toNumber() < n) break;
            value = value.div(10 ** n);
            postfix = siPrefix;
        }
    }
    const formatted = value.toDP(
        decimalPlaces, Decimal.ROUND_DOWN
    ).toNumber().toLocaleString(
        'en-US',
        {
            minimumFractionDigits: fixed ? decimalPlaces : undefined,
            maximumFractionDigits: decimalPlaces + 8,
        },
    ) + postfix;
    return currency ? `${formatted} ${currency}` : formatted;
};
