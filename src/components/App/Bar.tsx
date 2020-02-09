import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';

import AppBar from '@material-ui/core/AppBar';
import Button, { ButtonProps } from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import withStyles, { StyleRulesCallback, WithStyles } from '@material-ui/core/styles/withStyles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import MenuIcon from '@material-ui/icons/Menu';

import api from 'api';
import { RootState } from 'store/reducer';
import { setMe } from 'store/user/action';
import User from 'types/user';
import { gettext } from 'utils/translation';

const styles: StyleRulesCallback = theme => ({
    toolbar: {
        [theme.breakpoints.up('lg')]: {
            // width: theme.breakpoints.values.lg,
            // margin: '0 auto',
        },
    },
    name: {
        marginRight: theme.spacing.unit,
    },
    menuButton: {
        marginLeft: -theme.spacing.unit * 1.5,
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    menuDrawer: {
        width: 240,
    },
    menuDrawerToolbar: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    menuContainer: {
        flexGrow: 1,
    },
    menu: {
        marginLeft: 2 * theme.spacing.unit,
        [theme.breakpoints.down('xs')]: {
            display: 'none',
        },
    },
});

interface MenuOwnProps {
    type: 'list' | 'button';
    color?: ButtonProps['color'];
    variant?: ButtonProps['variant'];
    to?: string;
    onClick?(): void;
    alwaysActive?: boolean;
}

type MenuProps = MenuOwnProps & RouteComponentProps & WithStyles;

class _Menu extends React.Component<MenuProps> {

    handleClick = () => {
        const { to, onClick, history } = this.props;
        if (onClick) {
            onClick();
        }
        if (to) {
            history.push(to);
        }
    }

    render() {
        const {
            children, type, color, variant, to, alwaysActive, location, classes,
        } = this.props;
        const selected = Boolean(alwaysActive || to && location.pathname.startsWith(to));
        return type === 'list' ? (
            <ListItem
                button
                selected={selected}
                onClick={this.handleClick}
            >
                <ListItemText primary={children} />
            </ListItem>
        ) : (
            <Button
                color={color ? color : selected ? 'inherit' : 'default'}
                variant={variant}
                className={classes.menu}
                onClick={this.handleClick}
            >
                {children}
            </Button>
        );
    }
}

const Menu = withRouter(withStyles(styles)(_Menu));

interface StateProps {
    me: User | null | undefined;
}

interface DispatchProps {
    setMe: typeof setMe;
}

type Props = StateProps & DispatchProps & RouteComponentProps & WithStyles;

interface State {
    menuDrawerOpen: boolean;
}

class Bar extends React.PureComponent<Props, State> {

    state: State = {
        menuDrawerOpen: false,
    };

    toggleMenuDrawer = (menuDrawerOpen: boolean) => () => {
        this.setState({ menuDrawerOpen });
    }

    handleLogoutClick = async () => {
        const { setMe } = this.props;
        await api.post('/users/logout/');
        setMe(null);
    }

    renderMenu = (type: 'list' | 'button') => {
        const { history } = this.props;
        return (
            <>
                <Menu type={type} to="/exchange/">
                    {gettext('Exchange')}
                </Menu>
                <Menu type={type} to="/balances/">
                    {gettext('Deposit & Withdrawal')}
                </Menu>
                <Menu type={type} to="/investment/">
                    {gettext('Investment History')}
                </Menu>
                <Menu
                    type={type}
                    onClick={() => window.open('https://open.kakao.com/o/gz1vflkb', '_blank')}>
                    고객센터
                </Menu>
                <Menu
                    type={type}
                    variant="contained"
                    color="secondary"
                    onClick={() => history.push('/donation/')}
                >
                    {gettext('Donate Ethereum')}
                </Menu>
            </>
        );
    }

    render() {
        const { me, history, classes } = this.props;
        const { menuDrawerOpen } = this.state;
        return (
            <AppBar position="fixed">
                <Toolbar className={classes.toolbar}>
                    <IconButton
                        className={classes.menuButton}
                        color="inherit"
                        onClick={this.toggleMenuDrawer(true)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Button
                        color="inherit"
                        className={classes.name}
                        onClick={() => history.push('/exchange/')}
                    >
                        <Typography variant="h6" color="inherit">
                            {gettext('IU Exchange')}
                        </Typography>
                    </Button>
                    <SwipeableDrawer
                        open={menuDrawerOpen}
                        onClose={this.toggleMenuDrawer(false)}
                        onOpen={this.toggleMenuDrawer(true)}
                    >
                        <Toolbar className={classes.menuDrawerToolbar}>
                            <IconButton
                                onClick={this.toggleMenuDrawer(false)}
                            >
                                <ChevronLeftIcon />
                            </IconButton>
                        </Toolbar>
                        <List className={classes.menuDrawer}>
                            {this.renderMenu('list')}
                            {
                                me ? (
                                    <Menu
                                        type="list"
                                        to="/llogout/"
                                        alwaysActive
                                    >
                                        <ListItemText primary={gettext('Logout')} />
                                    </Menu>
                                ) : (
                                    <>
                                        <Menu
                                            type="list"
                                            to="/login/"
                                            alwaysActive
                                        >
                                            <ListItemText primary={gettext('Login')} />
                                        </Menu>
                                        <Menu
                                            type="list"
                                            to="/register/"
                                            alwaysActive
                                        >
                                            <ListItemText primary={gettext('Register')} />
                                        </Menu>
                                    </>
                                )
                            }
                        </List>
                    </SwipeableDrawer>
                    <div className={classes.menuContainer}>
                        {this.renderMenu('button')}
                    </div>
                    {
                        me ? (
                            <Menu
                                type="button"
                                onClick={this.handleLogoutClick}
                                alwaysActive
                            >
                                {gettext('Logout')}
                            </Menu>
                        ) : (
                            <>
                                <Menu
                                    type="button"
                                    to="/login/"
                                    alwaysActive
                                >
                                    {gettext('Login')}
                                </Menu>
                                <Menu
                                    type="button"
                                    to="/register/"
                                    alwaysActive
                                >
                                    {gettext('Register')}
                                </Menu>
                            </>
                        )
                    }
                </Toolbar>
            </AppBar>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    const { user: { me } } = state;
    return {
        me,
    };
};

const mapDispatchToProps = {
    setMe,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Bar)));
