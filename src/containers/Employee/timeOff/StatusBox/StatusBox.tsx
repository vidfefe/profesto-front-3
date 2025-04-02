import React from 'react';
import styled from 'styled-components';

import EmployeeCard from 'components/Employee/Card';
import { dateFormat } from 'lib/DateFormat';
import { TimeOffRequest } from 'types';

type StatusBoxProps = {
  timeOffRequest: TimeOffRequest | undefined;
};

export const StatusBox = ({ timeOffRequest }: StatusBoxProps) => {
  return (
    <StatusBoxContainer>
      {timeOffRequest?.status_changes.map((item: any, index: number) => (
        <StatusItem key={index}>
          <StatusItemWidth>{item.status.name}:</StatusItemWidth>
          <EmployeeCard
            key={index}
            employee={item.employee}
            imageSize={40}
            imageFontSize={12}
            fontSize={12}
            additionalInfo={
              <span style={{ color: '#585858', fontSize: 11 }}>
                {dateFormat(item?.created_at, 'timeOffRequest')}
              </span>
            }
          />
        </StatusItem>
      ))}
    </StatusBoxContainer>
  );
};

const StatusBoxContainer = styled.div`
  background-color: #f3f3f3;
  margin-top: 20px;
`;

const StatusItem = styled.div`
  margin: 0px 15px;
  padding: 7px 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 30px;
  border-bottom: 1px solid #ffffff;
  &:last-child {
    border-bottom: 0px solid #ffffff;
  }
`;
const StatusItemWidth = styled.div`
  width: 115px;
`;
