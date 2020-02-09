import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';

import classNames from 'classnames';

import AppBar from '@material-ui/core/AppBar';
import Tab from '@material-ui/core/Tab';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import createStyles from '@material-ui/core/styles/createStyles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';

import { RootState } from 'store/reducer';
import { CurrencyMap } from 'types/currency';
import Market, { MarketMap } from 'types/market';
import { formatNumber } from 'utils/formatting';
import { gettext } from 'utils/translation';

const styles = createStyles((theme: Theme) => ({
    container: {
        minWidth: 360 - theme.spacing.unit * 4,
        width: '100%',
    },
    tab: {
        minWidth: 0,
    },
    row: {
        cursor: 'pointer',
        height: 40,
        [theme.breakpoints.up('lg')]: {
            maxWidth: 360 - theme.spacing.unit * 4,
        },
    },
    cell: {
        padding: theme.spacing.unit,
        '&:last-child': {
            padding: theme.spacing.unit,
        },
        '& p': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        }
    },
    icon: {
        width: 32,
    },
    name: {
        '& p': {
            maxWidth: 84,
        },
    },
    price: {
        width: 98,
    },
    volume: {
        width: 98,
        '& p': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        }
    },
}));

interface MarketRowProps extends WithStyles {
    market: Market;
    currentMarketPair: string;
    currencies: CurrencyMap;
    onClick(market: Market): void;
}

class MarketRow extends React.PureComponent<MarketRowProps> {

    render() {
        const { market, currentMarketPair, currencies, onClick, classes } = this.props;
        const baseCurrency = currencies[market.baseCurrency];
        const quoteCurrency = currencies[market.quoteCurrency];
        return baseCurrency && quoteCurrency && (
            <TableRow
                hover
                className={classes.row}
                selected={currentMarketPair === market.pair}
                onClick={() => onClick(market)}
            >
                <TableCell className={classNames(classes.cell, classes.icon)}>
                    <img src={baseCurrency.iconUrl} width="16" height="16" />
                </TableCell>
                <TableCell className={classNames(classes.cell, classes.name)}>
                    <Typography>
                        {baseCurrency.name}
                    </Typography>
                </TableCell>
                <TableCell className={classNames(classes.cell, classes.price)}>
                    <Typography align="right">
                        {market.formatPrice(market.currentPrice)}
                    </Typography>
                </TableCell>
                <TableCell className={classNames(classes.cell, classes.volume)}>
                    <Typography align="right">
                        {formatNumber(market.dayVolume, 0, { short: true })}
                    </Typography>
                </TableCell>
            </TableRow>
        );
    }
}

interface StateProps {
    currencies: CurrencyMap | null;
}

interface OwnProps {
    markets: MarketMap;
    currentMarketPair: string | null;
}

type Props = StateProps & OwnProps & WithStyles & RouteComponentProps;

interface State {
    quoteCurrency: string;
}

class MarketList extends React.PureComponent<Props, State> {

    state: State = { quoteCurrency: 'ETH' };

    handleQuoteCurrencyChange = (_: React.ChangeEvent<{}>, quoteCurrency: string) => {
        this.setState({ quoteCurrency });
    }

    handleMarketClick = (market: Market) => {
        const { history } = this.props;
        history.push(`/exchange/${market.pair.toLowerCase()}/`);
    }

    renderMarket = (market: Market): React.ReactNode => {
        const { currencies, currentMarketPair, classes } = this.props;
        return currencies && currentMarketPair && (
            <MarketRow
                key={market.pair}
                market={market}
                currentMarketPair={currentMarketPair}
                classes={classes}
                currencies={currencies}
                onClick={this.handleMarketClick}
            />
        );
    }

    render() {
        const { markets, classes } = this.props;
        const { quoteCurrency } = this.state;
        const quoteCurrencies = ['ETH'];
        const currentMarkets = markets && Object.values(markets).filter(
            market => market.quoteCurrency === quoteCurrency
        ).sort(
            (a, b) => b.currentPrice.comparedTo(a.currentPrice)
        );
        return (
            <div className={classes.container}>
                <AppBar position="static" color="default">
                    <Tabs
                        variant="fullWidth"
                        indicatorColor="primary"
                        textColor="primary"
                        value={quoteCurrency}
                        onChange={this.handleQuoteCurrencyChange}
                    >
                        {
                            quoteCurrencies.map(
                                currency => (
                                    <Tab
                                        className={classes.tab}
                                        key={currency}
                                        value={currency}
                                        label={currency}
                                    />
                                )
                            )
                        }
                    </Tabs>
                </AppBar>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.cell} />
                            <TableCell className={classes.cell}>
                                {gettext('Name')}
                            </TableCell>
                            <TableCell className={classes.cell} align="right">
                                {gettext('Price')}
                            </TableCell>
                            <TableCell className={classes.cell} align="right">
                                {gettext('Volume')}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {currentMarkets && currentMarkets.map(this.renderMarket)}
                    </TableBody>
                </Table>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    const { currency: { currencies } } = state;
    return {
        currencies,
    };
};

export default withRouter(connect(mapStateToProps)(withStyles(styles)(MarketList)));
