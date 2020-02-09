import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import AppBar from '@material-ui/core/AppBar';
import Tab from '@material-ui/core/Tab';
import MaterialTabs from '@material-ui/core/Tabs';

import { gettext } from 'utils/translation';

type TabValues = 'deposit' | 'withdrawal' | 'history';

interface TabsRouteParams {
    tab: TabValues;
}

type Props = RouteComponentProps<TabsRouteParams>;

class Tabs extends React.Component<Props> {

    handleTabChange = (_: React.ChangeEvent<{}>, value: TabValues) => {
        const { history } = this.props;
        history.push(`../${value}/`);
    }

    render() {
        const { match: { params: { tab } } } = this.props;
        return (
            <AppBar position="static" color="default">
                <MaterialTabs
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="primary"
                    value={tab}
                    onChange={this.handleTabChange}
                >
                    <Tab
                        value="deposit"
                        label={gettext('Deposit')}
                    />
                    <Tab
                        value="withdrawal"
                        label={gettext('Withdrawal')}
                    />
                    <Tab
                        value="history"
                        label={gettext('History')}
                    />
                </MaterialTabs>
            </AppBar>
        );
    }
}

export default withRouter(Tabs);
