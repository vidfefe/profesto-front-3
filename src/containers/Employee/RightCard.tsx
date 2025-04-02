import React, {useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import queryString from "query-string";
import { useLocation, useHistory } from "react-router-dom";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { currentUserSelector, personActiveTabSelector } from '../../redux/selectors/index'
import { setActiveTab } from '../../redux/personSlice';
import 'react-tabs/style/react-tabs.css';
import Personal from "./personal";
import Job from './job';
import TimeOff from "./timeOff";
import Documents from "./documents";
import Emergency from "./emergency";
import OnboardingInfoBox from "./OnboardingInfoBox";
import { useTranslation } from "react-i18next";
import { ReactComponent as LockedIcon } from 'assets/svg/locked-gray.svg';
import { ReactComponent as TimeSheetIcon } from 'assets/svg/timesheet.svg';
import { ReactComponent as TimeOffIcon } from 'assets/svg/timeoff.svg';
import LockedFeatureModal from "components/LockedFeatureModal";
import { Benefits } from "./benefits";
import Timesheet from "./timesheet";

const RightCard = ({ person, refreshEmployeeInfo, disabled, view }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const activeTab = useSelector(personActiveTabSelector);
  const currentUser = useSelector(currentUserSelector);
  const [visible, setVisible] = useState<any>(false);
  const [type, setType] = useState<any>(null);

  const queryParams: any = queryString.parse(location.search);
  const mapTabToIndex: { [key: string]: number } = {
    personal: 0,
    job: 1,
    benefits: 2,
    timeoff: 3,
    timesheet: 4,
    documents: 5,
    emergency: 6
  };

  const onTabClick = (event: any, type: string) => {
    setVisible(true);
    setType(type);
    event.stopPropagation();
  }

  return (
    <Wrapper>
      <div className='body'>
        {person.onboarding?.onboarding_status?.id ?
          <OnboardingInfoBox person={person} refreshEmployeeInfo={refreshEmployeeInfo} />
          : null}
        <Tabs
          selectedIndex={mapTabToIndex[queryParams?.tab] ?? activeTab}
          onSelect={index => { dispatch(setActiveTab(index)); history.push(`?tab=${Object.keys(mapTabToIndex)[index]}`) }}
        >
          <TabList>
            <Tab>{t('tabs.personal')}</Tab>
            <Tab>{t('tabs.job')}</Tab>
            { !(person.id !== currentUser.employee.id && currentUser.permissions.role === 'manager') &&
              <Tab>{t('tabs.benefits')}</Tab> }
            <Tab>{t('tabs.time_off')}</Tab>
            <Tab>{t('tabs.timesheet')}</Tab>
            <Tab>{t('tabs.documents')}</Tab>
            <Tab>{t('tabs.emergency')}</Tab>
          </TabList>

          <TabPanel>
            <Personal person={person} refreshEmployeeInfo={refreshEmployeeInfo} disabled={disabled} />
          </TabPanel>
          <TabPanel>
            <Job person={person} refreshEmployeeInfo={refreshEmployeeInfo} disabled={disabled} view={view} />
          </TabPanel>
          { !(person.id !== currentUser.employee.id && currentUser.permissions.role === 'manager') &&
          <TabPanel>
            <Benefits person={person} disabled={disabled} />
          </TabPanel> }
          <TabPanel>
           <TimeOff employeeInfo={person} disabled={disabled} />
          </TabPanel>
          <TabPanel>
            <Timesheet person={person}/>
          </TabPanel>
          <TabPanel>
            <Documents person={person} disabled={disabled} refreshEmployeeInfo={refreshEmployeeInfo} />
          </TabPanel>
          <TabPanel>
            <Emergency person={person} disabled={disabled} view={view} />
          </TabPanel>
        </Tabs>
      </div>
      <LockedFeatureModal
        title={type === 'timeoff' ? t('globaly.timeoff_feature_title') : t('globaly.try_our_timesheet')}
        content={type ===  'timeoff' ? t('globaly.timeoff_feature') : t('globaly.timesheet_feature')}
        icon={type === 'timeoff' ? <TimeOffIcon/> : <TimeSheetIcon/>}
        visible={visible}
        onCloseModal={ async () => {
          await setVisible(false);
        }}
      />
    </Wrapper>
  );
};

export default RightCard;

const Wrapper = styled.div`
  flex: 0 0 79%;
  max-width: 79%;
  position: relative;
  width: 100%;
  min-height: 1px;
  padding-right: 20px;
  padding-left: 10px;
    
  .body{
    background: #fff;
    padding: 15px;
    border-radius: 6px;
  
    .react-tabs__tab-list{
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #AEAEAE;
      margin-bottom: 15px;
  
      .react-tabs__tab{
        flex: 1;
        text-align: center;
        padding: 10.5px 10px;
        color: #00101A;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }
  
      .react-tabs__tab:focus{
        box-shadow: none;
        outline: none !important;
      }
  
      .react-tabs__tab:focus:after{
        display: none;
      }
  
      .react-tabs__tab--selected{
        padding-bottom: 9px !important;
        border: none;
        color: #FF9933;
        border-bottom: 2px solid #FF9933;
      }
    }
  }
`;