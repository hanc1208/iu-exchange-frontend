import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
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
    passwordConfirm: string;
    name: string;
}

class RegisterForm extends React.Component<Props, State> {

    state: State = {
        email: '',
        password: '',
        passwordConfirm: '',
        name: '',
    };

    redirect = () => {
        const { history } = this.props;
        history.push('/exchange/');
    }

    getError = (key: keyof State): string | null => {
        const { email, password, passwordConfirm, name } = this.state;
        switch (key) {
            case 'email':
                if (!email) {
                    return gettext('Please enter an email.');
                }
                if (!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email)) {
                    return gettext('Not a valid email.');
                }
                break;
            case 'password':
                if (!password) {
                    return gettext('Please enter a password.');
                }
                if (!(password.length >= 12 && password.length <= 64)) {
                    return gettext('Password must be between 12 and 64 characters.');
                }
                if (!/[a-zA-Z]/.test(password)) {
                    return gettext('Password must contain an alphabet.');
                }
                if (!/\d/.test(password)) {
                    return gettext('Password must contain a number.');
                }
                break;
            case 'passwordConfirm':
                if (!passwordConfirm) {
                    return gettext('Please enter a password confirm.');
                }
                if (password !== passwordConfirm) {
                    return gettext('Please enter the same value as the password.');
                }
                break;
            case 'name':
                if (!name) {
                    return gettext('Please enter a name.');
                }
                break;
        }
        return null;
    }

    get hasError(): boolean {
        const names: (keyof State)[] = ['email', 'password', 'passwordConfirm'];
        return names.some(name => this.getError(name) != null);
    }

    handleChange = (key: keyof State) => (
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { target: { value } } = e;
            this.setState({ [key]: value } as {[key in keyof State]: string});
        }
    )

    handleRegisterClick = async () => {
        const { setMe } = this.props;
        const { email, password } = this.state;
        try {
            const data = { email, password };
            const me = (await api.post('/users/', data)).data;
            setMe(me);
            this.redirect();
        } catch (e) {
            if (e.status === 409) {
                alert(e.data.detail);
                return;
            }
            throw e;
        }
    }

    createField = (options: { key: keyof State, type?: string, label?: string }): React.ReactNode => {
        const { key, type, label } = options;
        const value = this.state[key];
        const error = value && this.getError(key);
        return (
            <TextField
                fullWidth
                type={type}
                label={label}
                value={value}
                onChange={this.handleChange(key)}
                error={Boolean(error)}
                helperText={error}
            />
        );
    }

    get fields(): React.ReactNode {
        return (
            <>
                <Grid item xs={12}>
                    {
                        this.createField(
                            {
                                key: 'email',
                                label: gettext('Email'),
                            }
                        )
                    }
                </Grid>
                <Grid item xs={12}>
                    {
                        this.createField(
                            {
                                key: 'password',
                                type: 'password',
                                label: gettext('Password'),
                            }
                        )
                    }
                </Grid>
                <Grid item xs={12}>
                    {
                        this.createField(
                            {
                                key: 'passwordConfirm',
                                type: 'password',
                                label: gettext('Password Confirm'),
                            }
                        )
                    }
                </Grid>
            </>
        )
    }

    get registerButton(): React.ReactNode {
        return (
            <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={this.handleRegisterClick}
                disabled={this.hasError}
            >
                {gettext('Register')}
            </Button>
        );
    }

    render() {
        const { classes } = this.props;
        return (
            <Grid
                container
                justify="center"
                alignItems="center"
                className={classes.container}
            >
                <Grid item xs={4}>
                    <Card>
                        <CardContent>
                            <Grid container spacing={8}>
                                {this.fields}
                                <Grid item xs={12}>
                                    {this.registerButton}
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption">
                                        아이유 거래소는 정식 오픈된 거래소가 아닙니다.
                                    </Typography>
                                    <Typography variant="caption">
                                        암호화폐는 원금이 보장되지 않으며 변동성이 매우 심합니다.
                                    </Typography>
                                    <Typography variant="caption">
                                        암호화폐 거래로 인한 모든 손실은 고객님에게 귀속되며,
                                    </Typography>
                                    <Typography variant="caption">
                                        아이유 거래소는 일체의 민형사상 책임을 지지 않습니다.
                                    </Typography>
                                    <Typography variant="caption">
                                        아이유 거래소는 AWS의 보안 및 최소한의 보안만 지원하고 있습니다.
                                    </Typography>
                                    <Typography variant="caption">
                                        보안 사고로 인한 손실에 대해 아이유 거래소는 일체의 민형사상 책임을 지지 않습니다.
                                    </Typography>
                                    <Typography variant="caption">
                                        1일 출금 한도는 10 ETH, 5000 ORBS 입니다.
                                    </Typography>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(RegisterForm)));
