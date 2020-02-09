import React from 'react';

import Decimal from 'decimal.js';

import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';

interface Props {
    price: string;
    currency: string;
    onChange(price: Decimal): void;
}

interface State {
    price: string;
}

export default class Price extends React.PureComponent<Props, State> {

    state: State = { price: this.props.price };

    get price(): Decimal {
        return new Decimal(this.props.price);
    }

    componentDidUpdate(prevProps: Props) {
        if (!new Decimal(prevProps.price).eq(this.price)) {
            try {
                if (!new Decimal(this.state.price).eq(this.price)) {
                    this.setState({ price: this.props.price });
                }
            } catch {
                this.setState({ price: this.props.price });
            }
        }
    }

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { target: { value: price } } = e;
        const { onChange } = this.props;
        try {
            this.setState({ price });
            onChange(new Decimal(price || 0));
        } catch {}
    }

    render() {
        const { currency } = this.props;
        const { price } = this.state;
        return (
            <Grid container>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        type="number"
                        inputProps={{ min: 0, step: 0.00000001 }}
                        value={price}
                        onChange={this.handleChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    {currency}
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
            </Grid>
        );
    }
}
