import { blue, lime, purple, red } from '@material-ui/core/colors';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';

const theme = createMuiTheme({
    palette: {
        type: 'dark',
        primary: purple,
        secondary: lime,
    },
    typography: {
        fontFamily: [
            '"Spoqa Han Sans"',
            'Roboto',
            'Sans-serif',
        ].join(','),
    },
    overrides: {
        MuiButton: {
            root: {
                textTransform: 'inherit',
            },
        },
    },
});

export const sideColor = {
    buy: red['700'],
    sell: blue['700'],
};

export const sideTextColor = {
    buy: red['500'],
    sell: blue['500'],
};

export default theme;
