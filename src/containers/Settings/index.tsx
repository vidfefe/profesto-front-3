import styled from 'styled-components';
import Wrapper from '../createperson/FormWrapper';
import { Route, Switch } from 'react-router';
import { Dictionaries } from './Dictionaries';
import { UsersList } from './UsersList';
import { CompanyInfo } from "./CompanyInfo";
import UnderConstruction from 'partials/PageHolders/UnderConstruction';
import { usePermissionGate } from "permissions/usePermissionGate";
import Menu from './Menu'
import { billing } from "lib/Subscription";

export const Settings = () => {
    const { role } = usePermissionGate();

    return (
        <Wrapper style={{ display: 'flex', flex: 1, backgroundColor: '#F2F2F4', padding: '28px 48px' }}>
            <SettingsWrapper>
                <Menu />
                <SettingContent>
                    <Switch>
                        <Route path="/settings/benefit_information" component={Dictionaries} />
                        <Route path="/settings/job_information" component={Dictionaries} />
                        <Route path="/settings/personal_information" component={Dictionaries} />
                        <Route path="/settings/employee_access" component={UsersList} />
                        {role !== 'hr' &&
                          <Route key={1} path="/settings/company_info" component={CompanyInfo} />
                        }
                        { role !== 'hr' && billing() &&
                          <Route key={2} path="/settings/billing" component={UnderConstruction} />
                        }
                        <Route path="/settings/timeoff_types" component={Dictionaries} />
                    </Switch>
                </SettingContent>
            </SettingsWrapper>
        </Wrapper>
    )
}

const SettingsWrapper = styled.div`
    flex: 1; 
    display: flex;
`
const SettingContent = styled.div`
    width: 85%;
    padding-left: 25px;
    float: left;
    display: flex;
    flex-direction: column;
`
