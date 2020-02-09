import React from 'react';
import { connect } from 'react-redux';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import { sideTextColor } from 'components/App/theme';
import { RootState } from 'store/reducer';
import Trade from 'types/trade';
import { gettext } from 'utils/translation';
import { formatNumber } from 'utils/formatting';

interface HistoryProps {
    price: string;
    volume: string;
    color?: string;
}

class History extends React.PureComponent<HistoryProps> {

    render() {
        const { price, volume, color } = this.props;
        return (
            <TableRow style={{ height: 20 }}>
                <TableCell padding="none">
                    <Typography variant="caption" align="right">
                        {price}
                    </Typography>
                </TableCell>
                <TableCell padding="none">
                    <Typography
                        variant="caption"
                        align="right"
                        style={{ color }}
                    >
                        {volume}
                    </Typography>
                </TableCell>
            </TableRow>
        );
    }
}

interface StateProps {
    trades: Trade[];
}

interface OwnProps {
    priceDecimalPlaces?: number;
    volumeDecimalPlaces?: number;
}

type Props = StateProps & OwnProps;

class ShortMarketTradeHistory extends React.PureComponent<Props> {

    renderTrade = ({ id, side, price, volume }: Trade) => {
        const { priceDecimalPlaces, volumeDecimalPlaces } = this.props;
        return (
            <History
                key={id}
                price={formatNumber(price, priceDecimalPlaces)}
                volume={formatNumber(volume, volumeDecimalPlaces, { fixed: true })}
                color={sideTextColor[side]}
            />
        );
    }

    render() {
        const { trades } = this.props;
        return (
            <Table padding="none" style={{ width: 170 }}>
                <TableHead>
                    <TableRow>
                        <TableCell padding="none" align="center" style={{ width: 70 }}>
                            {gettext('Price')}
                        </TableCell>
                        <TableCell padding="none" align="center" style={{ width: 110 }}>
                            {gettext('Volume')}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {[...trades].reverse().map(this.renderTrade)}
                </TableBody>
            </Table>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    const { trade: { trades } } = state;
    return {
        trades,
    };
};

export default connect(mapStateToProps)(ShortMarketTradeHistory);
