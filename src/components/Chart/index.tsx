import React from 'react';
import { connect } from 'react-redux';

import Highcharts from 'highcharts/highstock';
import BollengerBands from 'highcharts/indicators/bollinger-bands';
import Ema from 'highcharts/indicators/ema';
import IchimokuKinkoHyo from 'highcharts/indicators/ichimoku-kinko-hyo';
import Macd from 'highcharts/indicators/macd';
import Momentum from 'highcharts/indicators/momentum';
import PivotPoints from 'highcharts/indicators/pivot-points';
import PriceChannel from 'highcharts/indicators/price-channel';
import Psar from 'highcharts/indicators/psar';
import Rsi from 'highcharts/indicators/rsi';
import Stochastic from 'highcharts/indicators/stochastic';
import VolumeByPrice from 'highcharts/indicators/volume-by-price';
import Indicators from 'highcharts/indicators/indicators';
import AdvancedAnnotations from 'highcharts/modules/annotations-advanced';
import Boost from 'highcharts/modules/boost';
import DragPanes from 'highcharts/modules/drag-panes';
import FullScreen from 'highcharts/modules/full-screen';
import PriceIndicator from 'highcharts/modules/price-indicator';
import StockTools from 'highcharts/modules/stock-tools';
import 'highcharts/css/annotations/popup.css';
import 'highcharts/css/stocktools/gui.css';
import HighchartsReact from 'highcharts-react-official';

import theme, { sideColor } from 'components/App/theme';
import { RootState } from 'store/reducer';
import Candle, { CandleUnitType } from 'types/candle';
import { gettext } from 'utils/translation';

Indicators(Highcharts);
BollengerBands(Highcharts);
Ema(Highcharts);
IchimokuKinkoHyo(Highcharts);
Macd(Highcharts);
Momentum(Highcharts);
PivotPoints(Highcharts);
PriceChannel(Highcharts);
Psar(Highcharts);
Rsi(Highcharts);
Stochastic(Highcharts);
VolumeByPrice(Highcharts);
AdvancedAnnotations(Highcharts);
DragPanes(Highcharts);
FullScreen(Highcharts);
PriceIndicator(Highcharts);
StockTools(Highcharts);
Boost(Highcharts);

Highcharts.setOptions({
    lang: {
        decimalPoint: '.',
        thousandsSep: ',',
        numericSymbols: undefined,
    },
});

const numberOfCandles = 100;

interface StateProps {
    candles: Candle[] | null;
}

interface OwnProps {
    pair: string;
    onUnitChanged(unitType: CandleUnitType, unit: number): Promise<void>;
    onMoreCandleNeed(offset: number): Promise<void>;
}

type Props = StateProps & OwnProps;

export class Chart extends React.Component<Props> {

    handleRangeSelectorClicked: (this: Highcharts.RangeSelectorButtonsOptions) => void;
    handleChartCreated: (this: Highcharts.Chart) => void;
    chart: Highcharts.Chart | null;
    intervalId: number | null = null;
    updatable: boolean = true;

    constructor(props: Props) {
        super(props);
        const self = this;
        this.handleChartCreated = function () {
            return self._handleChartCreated.call(self, this);
        };
        this.handleRangeSelectorClicked = function () {
            return self._handleRangeSelectorClicked.call(self, this);
        };
        this.intervalId = window.setInterval(() => {
            if (this.updatable) {
                this.updatable = false;
                if (this.chart) {
                    const { series, options } = this.chart;
                    if (series && this.candles) {
                        if (options.title && options.title.text !== this.props.pair) {
                            this.chart.title.update({ text: this.props.pair });
                            series[0].name = this.props.pair;
                        }
                        series[0].setData(this.priceData);
                        series[1].setData(this.volumeData);
                    }
                }
                this.forceUpdate();
            }
        }, 1000);
    }

    shouldComponentUpdate() {
        this.updatable = true;
        return false;
    }

    get candles(): Candle[] {
        return [...this.props.candles].sort(
            (a, b) => a.timestamp - b.timestamp
        );
    }

    get priceData() {
        return this.candles.map(
            (
                { timestamp, open, high, low, close }
            ): [number, number, number, number, number] => ([
                timestamp,
                open.toNumber(),
                high.toNumber(),
                low.toNumber(),
                close.toNumber(),
            ])
        );
    }

    get volumeData() {
        return this.candles.map(
            ({ timestamp, volume }): [number, number] => ([
                timestamp, volume.toNumber(),
            ])
        )
    }

    updateExtremes = () => {
        const { candles } = this.props;
        if (!candles || candles.length == 0 || !this.chart || !this.chart.xAxis) { return; }
        const newMin = (
            candles[Math.min(numberOfCandles, candles.length - 1)].timestamp
        );
        const newMax = candles[0].timestamp;
        this.chart.xAxis[0].setExtremes(newMin, newMax);
    }

    _handleChartCreated(chart: Highcharts.Chart) {
        this.chart = chart;
        this.updateExtremes();
    }

    async _handleRangeSelectorClicked(options: Highcharts.RangeSelectorButtonsOptions) {
        if (options.dataGrouping == null || this.chart == null) return;
        const { onUnitChanged } = this.props;
        const [[unitType, [unit]]] = options.dataGrouping.units;
        let unitInMinutes;
        switch (unitType) {
            case 'minute':
                unitInMinutes = unit;
                break;
            case 'hour':
                unitInMinutes = unit * 60;
                break;
            case 'day':
                unitInMinutes = unit * 1440;
                break;
            case 'week':
                unitInMinutes = unit * 10080;
                break;
            default:
                unitInMinutes = unit;
                break;
        }
        await onUnitChanged('minutes', unitInMinutes);
        setTimeout(this.updateExtremes, 0);
    }

    handleExtremesChanged = async (e: Highcharts.AxisSetExtremesEventObject) => {
        const { onMoreCandleNeed } = this.props;
        if (
            !this.chart ||
            !this.chart.options.rangeSelector ||
            !this.chart.options.rangeSelector.allButtonsEnabled ||
            e.trigger !== 'navigator'
        ) return;
        const threshold = (
            this.candles[0].timestamp +
            this.candles[0].unit * 60000 * numberOfCandles / 10
        );
        if (e.min < threshold) {
            this.chart.update({ rangeSelector: { allButtonsEnabled: false } });
            await onMoreCandleNeed(this.candles[0].timestamp);
            this.chart.update({ rangeSelector: { allButtonsEnabled: true } });
        }
    }

    render() {
        const { pair } = this.props;
        if (this.props.candles == null) { return null; }
        const options: Highcharts.Options = {
            chart: {
                height: 550,
            },
            title: {
                text: pair,
            },
            time: {
                timezoneOffset: -540,
            },
            xAxis: [
                {
                    events: {
                        setExtremes: this.handleExtremesChanged,
                    },
                },
            ],
            yAxis: [
                {
                    labels: {
                        align: 'left',
                    },
                    height: '80%',
                    resize: {
                        enabled: true,
                    },
                },
                {
                    labels: {
                        align: 'left',
                    },
                    top: '80%',
                    height: '20%',
                    offset: 0,
                },
            ],
            rangeSelector: {
                allButtonsEnabled: true,
                inputEnabled: false,
                selected: 0,
                buttons: [
                    {
                        type: 'minute',
                        count: numberOfCandles,
                        text: gettext('1m'),
                        dataGrouping: {
                            forced: true,
                            units: [['minute', [1]]],
                        },
                        events: {
                            click: this.handleRangeSelectorClicked,
                        },
                        preserveDataGrouping: true,
                    },
                    {
                        type: 'minute',
                        count: numberOfCandles * 5,
                        text: gettext('5m'),
                        dataGrouping: {
                            forced: true,
                            units: [['minute', [5]]],
                        },
                        events: {
                            click: this.handleRangeSelectorClicked,
                        },
                    },
                    {
                        type: 'minute',
                        count: numberOfCandles * 15,
                        text: gettext('15m'),
                        dataGrouping: {
                            forced: true,
                            units: [['minute', [15]]],
                        },
                        events: {
                            click: this.handleRangeSelectorClicked,
                        },
                        preserveDataGrouping: true,
                    },
                    {
                        type: 'minute',
                        count: numberOfCandles * 30,
                        text: gettext('30m'),
                        dataGrouping: {
                            forced: true,
                            units: [['minute', [30]]],
                        },
                        events: {
                            click: this.handleRangeSelectorClicked,
                        },
                        preserveDataGrouping: true,
                    },
                    {
                        type: 'minute',
                        count: numberOfCandles * 60,
                        text: gettext('1h'),
                        dataGrouping: {
                            forced: true,
                            units: [['hour', [1]]],
                        },
                        events: {
                            click: this.handleRangeSelectorClicked,
                        },
                        preserveDataGrouping: true,
                    },
                    {
                        type: 'minute',
                        count: numberOfCandles * 240,
                        text: gettext('4h'),
                        dataGrouping: {
                            forced: true,
                            units: [['hour', [4]]],
                        },
                        events: {
                            click: this.handleRangeSelectorClicked,
                        },
                        preserveDataGrouping: true,
                    },
                    {
                        type: 'day',
                        count: numberOfCandles,
                        text: gettext('1d'),
                        dataGrouping: {
                            forced: true,
                            units: [['day', [1]]],
                        },
                        events: {
                            click: this.handleRangeSelectorClicked,
                        },
                        preserveDataGrouping: true,
                    },
                    {
                        type: 'day',
                        count: numberOfCandles * 3,
                        text: gettext('3d'),
                        dataGrouping: {
                            forced: true,
                            units: [['day', [3]]],
                        },
                        events: {
                            click: this.handleRangeSelectorClicked,
                        },
                        preserveDataGrouping: true,
                    },
                    {
                        type: 'week',
                        count: numberOfCandles,
                        text: gettext('1w'),
                        dataGrouping: {
                            forced: true,
                            units: [['week', [1]]],
                        },
                        events: {
                            click: this.handleRangeSelectorClicked,
                        },
                        preserveDataGrouping: true,
                    },
                ],
            },
            series: [
                {
                    id: 'price',
                    type: 'candlestick',
                    name: pair,
                    data: this.priceData,
                    upColor: sideColor.buy,
                    color: sideColor.sell,
                    tooltip: {
                        pointFormat: '<span style="color:{point.color}">\u25CF</span> ' +
                        '<b> {series.name}</b><br/>' +
                        gettext('Open') + ': {point.open}<br/>' +
                        gettext('High') + ': {point.high}<br/>' +
                        gettext('Low') + ': {point.low}<br/>' +
                        gettext('Close') + ': {point.close}<br/>'
                    },
                },
                {
                    id: 'volume',
                    type: 'column',
                    name: gettext('Volume'),
                    data: this.volumeData,
                    yAxis: 1,
                    color: theme.palette.secondary.dark,
                }
            ],
        };
        return (
            <HighchartsReact
                highcharts={Highcharts}
                constructorType="stockChart"
                options={options}
                allowChartUpdate={false}
                callback={this.handleChartCreated}
            />
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    const { candle: { candles } } = state;
    return {
        candles,
    };
};

export default connect(mapStateToProps)(Chart);
