import { Fragment, useState } from 'react';
import format from 'date-fns/format';
import styled from 'styled-components';
import useQueryCustom from 'hooks/useQueryCustom';
import { useTranslation } from 'react-i18next';

import PartialDate from '../timeOff/PartialDateChoose/view';
import DatePicker from 'components/DatePickers/DatePicker';
import { EmployeeTimesheet } from 'types';

export default function Timesheet({ person }: any) {
  const { t } = useTranslation();
  const [date, setDate] = useState(new Date());

  const { data: timesheet } = useQueryCustom<EmployeeTimesheet>(
    ['show_timesheet', person.id, date],
    {
      endpoint: `timesheet/times/${person.id}?month=${format(date, 'MMMM yyyy')}`,
      options: { method: 'get' },
    }
  );

  return (
    <Fragment>
      <DatePickerContainer>
        <DatePicker
          selected={date}
          onChange={(value) => {
            if (value) {
              setDate(value);
            }
          }}
          dateFormat='MMMM yyyy'
          showMonthYearPicker
          customInput={null}
          todayButton={null}
          width={'292'}
        />
      </DatePickerContainer>
      {timesheet?.data && (
        <Block>
          <div style={{ flex: 2 }}>
            <PartialDate
              borderRadius={8}
              timesheet={timesheet.data.timesheet}
              holidays={timesheet.holidays}
              showCalendarHeader={false}
              isDinamic={false}
              mode='sd'
            />
          </div>
          <SummaryContainer>
            <SummaryBlock>
              <Summary>
                <HeadingData>
                  {timesheet.data.summary.work_data.general.days}
                </HeadingData>
                <HeadingText>{t('timesheet.days')}</HeadingText>
                <HeadingSeparator>/</HeadingSeparator>
                <HeadingData>
                  {Number(timesheet.data.summary.work_data.general.hours)}
                </HeadingData>
                <HeadingText>{t('timesheet.hrs')}</HeadingText>
              </Summary>
              <DataDetails>
                {timesheet.data.summary.work_data.details.map((data) => {
                  return (
                    <DetailBox key={data.type}>
                      <span>{t(`timesheet.${data.type}`)}</span>
                      <DetailHours>
                        <span>{Number(data.hours)}</span>
                        <span>{t('timesheet.h')}</span>
                      </DetailHours>
                    </DetailBox>
                  );
                })}
              </DataDetails>
            </SummaryBlock>
            {!!timesheet.data.summary.time_off_data.general.days &&
              <TimeOffSummary>
                <Summary>
                  <HeadingData>
                    {timesheet.data.summary.time_off_data.general.days}
                  </HeadingData>
                  <HeadingText>{t('timesheet.days')}</HeadingText>
                  <HeadingSeparator>/</HeadingSeparator>
                  <HeadingData>
                    {Number(timesheet.data.summary.time_off_data.general.hours)}
                  </HeadingData>
                  <HeadingText>{t('timesheet.hrs')}</HeadingText>
                </Summary>
                <DataDetails>
                  {timesheet.data.summary.time_off_data.details.map(
                    (data) => {
                      return (
                        <DetailBox key={data.time_off_type_name} timeoff={true}>
                          <span title={data.time_off_type_name}>{data.time_off_type_name}</span>
                          <DetailHours>
                            <span>{Number(data.hours)}</span>
                            <span>{t('timesheet.h')}</span>
                          </DetailHours>
                        </DetailBox>
                      );
                    }
                  )}
                </DataDetails>
              </TimeOffSummary>
            }
          </SummaryContainer>
        </Block>
      )}
    </Fragment>
  );
}

const DatePickerContainer = styled.div`
  width: fit-content;
  margin-bottom: 21px;
`;

const SummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 21px;
  flex: 1;
`;

const Block = styled.div`
  display: flex;
  gap: 21px;
`;

const SummaryBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 19px;
  align-items: center;
  justify-content: space-between;
  background-color: #f3f9f6;
  color: #041019;
  border-radius: 8px;
  padding: 25px 22px 22px;
`;

const TimeOffSummary = styled(SummaryBlock)`
  background-color: #fdf3f3;
`;

const Summary = styled.div`
  display: flex;
  gap: 2px;
  align-items: baseline;
`;

const HeadingText = styled.span`
  font-size: 13px;
`;

const HeadingSeparator = styled.span`
  font-size: 23px;
`;

const HeadingData = styled.span`
  font-family: 'Aspira Wide Demi', 'FiraGO Medium';
  font-size: 23px;
`;

const DataDetails = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const DetailBox = styled.div<{ timeoff?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background-color:  ${(props) => props.timeoff ? '#fae6e4' : '#e3f1eb'};
  border-radius: 7px;
  padding: 6px;
  span {
    text-align: center;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    width: 88px;
  }
`;

const DetailHours = styled.div`
  font-size: 11px;
  span:first-of-type {
    font-family: 'Aspira Demi', 'FiraGO Medium';
    font-size: 17px;
    margin-right: 2px;
  }
`;
