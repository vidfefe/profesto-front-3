import styled from 'styled-components';
import { Route, Switch } from 'react-router-dom';
import ReportsList from './ReportsList';
import JobHistory from './JobHistory';
import Compensation from './CompensationHistory';
import Additions from './Additions';
import Terminations from './Terminations';
import WorkAnniversaries from './WorkAnniversaries';
import Birthdays from './Birthdays';
import PayChange from './PayChange';
import TimeOffRequest from './TimeOffRequest';
import TimeOffused from './TimeOffused';
import TimeOffBalance from './TimeOffBalance';
import Benefits from './Benefits';
import { MonthChanges } from './MonthChanges';


export const Reports = () => {
    return (
        <PageContainer>
            <Switch>
                <Route exact path="/reports" component={ReportsList} />
                <Route path="/reports/job_history" component={JobHistory} />
                <Route path="/reports/compensation_history" component={Compensation} />
                <Route path="/reports/additions" component={Additions} />
                <Route path="/reports/terminations" component={Terminations} />
                <Route path="/reports/work_anniversaries" component={WorkAnniversaries} />
                <Route path="/reports/birthdays" component={Birthdays} />
                <Route path="/reports/pay_change" component={PayChange} />
                <Route path="/reports/time_off_requests" component={TimeOffRequest} />
                <Route path="/reports/time_off_used" component={TimeOffused} />
                <Route path="/reports/time_off_balances" component={TimeOffBalance} />
                <Route path="/reports/benefits" component={Benefits} />
                <Route path="/reports/month_changes" component={MonthChanges} />
            </Switch>
        </PageContainer>
    )
};

const PageContainer = styled.div`
    background-color: #FFF;
`;