import { ThunkAction } from 'redux-thunk';

import Decimal from 'decimal.js';

import api from 'api';
import Action from 'store/action';
import { RootState } from 'store/reducer';
import Candle, { CandleUnitType } from 'types/candle';

type CandleAction =
    | { type: 'SET_UNIT', unitType: CandleUnitType, unit: number }
    | { type: 'SET_CANDLES', candles: Candle[] | null }
    ;

interface CandleResponse {
    timestamp: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    quoteVolume: string;
    unitType: CandleUnitType;
    unit: number;
}

export const setUnit = (unitType: CandleUnitType, unit: number): CandleAction => {
    return { type: 'SET_UNIT', unitType, unit };
};

interface FetchCandlesOption {
    pair: string;
    offset?: number;
    unitType?: CandleUnitType;
    unit?: number;
    count?: number;
}

export const fetchCandles = (
    (options: FetchCandlesOption):
        ThunkAction<void, RootState, void, Action> => (
        async (dispatch, getState) => {
            const state = getState();
            const {
                pair,
                unitType = state.candle.unitType,
                unit = state.candle.unit,
                offset,
                count,
            } = options;
            const data: CandleResponse[] = (
                await api.get(
                    `/candles/${pair}/${unitType}/${unit}/`,
                    { params: { offset, count } },
                )
            ).data;
            const candles: Candle[] = data.map(
                candle => ({
                    timestamp: candle.timestamp,
                    open: new Decimal(candle.open),
                    high: new Decimal(candle.high),
                    low: new Decimal(candle.low),
                    close: new Decimal(candle.close),
                    volume: new Decimal(candle.volume),
                    quoteVolume: new Decimal(candle.quoteVolume),
                    unitType: candle.unitType,
                    unit: candle.unit,
                })
            );
            if (offset != null) {
                candles.push(...state.candle.candles);
                candles.sort((a, b) => b.timestamp - a.timestamp);
            }
            dispatch({ type: 'SET_CANDLES', candles });
        }
    )
);

export default CandleAction;
