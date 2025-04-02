import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import styled from 'styled-components';

import { Chart, PayHistory, RunPayroll } from './MainPage';
import { payrollActiveTabSelector } from 'redux/selectors';
import { setPayrollActiveTab } from 'redux/personSlice';
import { AdditionalEarnings } from './AdditionalEarnings';

export const Payroll = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const activeTab = useSelector(payrollActiveTabSelector);
  const location = useLocation();
  const history = useHistory();

  const queryParams = queryString.parse(location.search) as { tab: string };
  const mapTabToIndex: Record<string, number> = {
    pay_history: 0,
    additional_earnings: 1,
    deductions: 2,
  };

  return (
    <Container>
      <LeftBlock>
        <RunPayroll />
        <Chart />
      </LeftBlock>
      <RightBlock>
        <Tabs
          selectedIndex={mapTabToIndex[queryParams?.tab] ?? activeTab}
          onSelect={(index) => {
            dispatch(setPayrollActiveTab(index));
            history.push(`?tab=${Object.keys(mapTabToIndex)[index]}`);
          }}
        >
          <TabList>
            <Tab>{t('payroll.tabs.pay_history')}</Tab>
            <Tab>{t('payroll.tabs.additional_earnings')}</Tab>
            <Tab>{t('payroll.tabs.additional_deductions')}</Tab>
          </TabList>
          <TabPanel>
            <PayHistory />
          </TabPanel>
          <TabPanel>
            <AdditionalEarnings/>
          </TabPanel>
          <TabPanel></TabPanel>
        </Tabs>
      </RightBlock>
    </Container>
  );
};

const Container = styled.div`
  display: grid;
  grid-template-columns: 390px 1fr;
  padding: 15px 60px;
  gap: 15px;
  background-color: #f2f2f4;
`;

const LeftBlock = styled.div`
  background: #fff;
  display: flex;
  flex-direction: column;
  padding: 15px;
  gap: 15px;
  border-radius: 6px;
`;

const RightBlock = styled.div`
  background: #fff;
  padding: 15px;
  border-radius: 6px;

  .react-tabs {
    height: 100%;

    .react-tabs__tab-panel {
      height: calc(100% - 53px);
    }
  }

  .react-tabs__tab-list {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #aeaeae;
    margin-bottom: 15px;

    .react-tabs__tab {
      flex: 1;
      text-align: center;
      padding: 10.5px 10px;
      color: #00101a;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .react-tabs__tab:focus {
      box-shadow: none;
      outline: none !important;
    }

    .react-tabs__tab:focus:after {
      display: none;
    }

    .react-tabs__tab--selected {
      padding-bottom: 9px !important;
      border: none;
      color: #ff9933;
      border-bottom: 2px solid #ff9933;
    }
  }
`;
