interface NodeModule {
    hot: {
        accept: Function;
    };
}

declare module '*.png' {
    let __src__: string;
    export default __src__;
}

declare module 'highcharts/indicators/indicators-all' {
    import * as Highcharts from 'highcharts';
    export function factory(highcharts: typeof Highcharts): void;
    export default factory;
}

declare module 'highcharts/modules/annotations-advanced' {
    import * as Highcharts from 'highcharts';
    export function factory(highcharts: typeof Highcharts): void;
    export default factory;
}

declare module 'highcharts/modules/full-screen' {
    import * as Highcharts from 'highcharts';
    export function factory(highcharts: typeof Highcharts): void;
    export default factory;
}

declare module 'highcharts/modules/price-indicator' {
    import * as Highcharts from 'highcharts';
    export function factory(highcharts: typeof Highcharts): void;
    export default factory;
}

declare module 'highcharts-react-official' {
    import * as React from 'react';
    import * as Highcharts from 'highcharts';

    export interface HighchartsReactProps<TContainerProps = {}> {
        highcharts?: typeof Highcharts;
        constructorType?: 'stockChart';
        update?: boolean;
        updateArgs?: [boolean, boolean, boolean];
        options: Highcharts.Options;
        containerProps?: TContainerProps;
        allowChartUpdate?: boolean;
        callback?(this: Highcharts.Chart): void;
    }
    export class HighchartsReact<TContainerProps = {}> extends React.Component<
        HighchartsReactProps<TContainerProps>
    > {}

    export default HighchartsReact;

}
