import React from 'react';

import MaterialDialog, { DialogProps as MaterialDialogProps } from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import createStyles from '@material-ui/core/styles/createStyles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import CloseIcon from '@material-ui/icons/Close';

const styles = (theme: Theme) => createStyles({
    close: {
        position: 'absolute',
        right: theme.spacing.unit,
        top: theme.spacing.unit,
    }
});

export interface DialogProps extends Omit<MaterialDialogProps, keyof DialogProps | 'classes'> {
    title?: React.ReactNode;
    content: React.ReactNode;
}

type Props = DialogProps & WithStyles<typeof styles>;

class Dialog extends React.Component<Props> {

    render() {
        const { title, content, classes, ...dialogProps } = this.props;
        const { onClose } = dialogProps;
        return (
            <MaterialDialog {...dialogProps}>
                <DialogTitle>
                    {title}
                    {
                        onClose && (
                            <IconButton
                                className={classes.close}
                                onClick={onClose}
                            >
                                <CloseIcon />
                            </IconButton>
                        )
                    }
                </DialogTitle>
                <DialogContent>
                    {
                        typeof(content) === 'string' ? (
                            <Typography>
                                {content}
                            </Typography>
                        ) : (
                            content
                        )
                    }
                </DialogContent>
            </MaterialDialog>
        );
    }
}

export default withStyles(styles)(Dialog);
