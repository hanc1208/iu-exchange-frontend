import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import createStyles from '@material-ui/core/styles/createStyles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';

import api from 'api';
import { RootState } from 'store/reducer';
import { setMe } from 'store/user/action';
import User from 'types/user';
import { gettext } from 'utils/translation';

const styles = createStyles({
    container: {
        height: `calc(100vh - 104px)`,
    },
});

interface StateProps {
    me: User | null | undefined;
}

interface DispatchProps {
    setMe: typeof setMe;
}

interface OwnProps {
}

type Props =
    & StateProps
    & DispatchProps
    & OwnProps
    & WithStyles<typeof styles>
    & RouteComponentProps
    ;

interface State {
    email: string;
    password: string;
}

class LoginForm extends React.Component<Props, State> {

    state: State = { email: '', password: '' };

    redirect = () => {
        const { history } = this.props;
        history.push('/exchange/');
    }

    handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { target: { value: email } } = e;
        this.setState({ email });
    }

    handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { target: { value: password } } = e;
        this.setState({ password });
    }

    handleLoginClick = async (e: React.FormEvent | React.MouseEvent) => {
        const { setMe } = this.props;
        const { email, password } = this.state;
        e.preventDefault();
        try {
            const data = { email, password };
            const me = (await api.post('/users/login/', data)).data;
            setMe(me);
            this.redirect();
        } catch (e) {
            if (e.status === 401) {
                alert(e.data.detail);
                return;
            }
            throw e;
        }
    }

    get loginButton() {
        return (
            <Button
                fullWidth
                type="submit"
                variant="contained"
                color="primary"
                onClick={this.handleLoginClick}
            >
                {gettext('Login')}
            </Button>
        );
    }

    render() {
        const { classes } = this.props;
        const { email, password } = this.state;
        return (
            <Grid
                component="form"
                container
                justify="center"
                alignItems="center"
                className={classes.container}
                onSubmit={this.handleLoginClick}
            >
                <Grid item xs={4}>
                    <Card>
                        <CardContent>
                            <Grid container spacing={8}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label={gettext('Email')}
                                        value={email}
                                        onChange={this.handleEmailChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        type="password"
                                        label={gettext('Password')}
                                        value={password}
                                        onChange={this.handlePasswordChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    {this.loginButton}
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LoginForm)));
