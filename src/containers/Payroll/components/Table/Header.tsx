import React, { CSSProperties, ReactElement } from 'react';
import styled from 'styled-components';

type Summary = {
  style?: CSSProperties;
  value: string | undefined;
  title: string;
};

type Info = {
  className?: string;
  style?: CSSProperties;
  value?: string;
};

export type HeaderProps = {
  info: Array<Info>;
  summary: Array<Summary>;
};

export const Header = ({ info, summary }: HeaderProps): ReactElement => {
  return (
    <Container>
      <InfoSection>
        {info.map((item, index) => (
          <span className={item.className} key={index} style={item.style}>
            {item.value}
          </span>
        ))}
      </InfoSection>
      <SummarySection>
        {summary.map((item) => (
          <div className={'item'} key={item.title} style={item.style}>
            <div className={'value'}>{item.value}</div>
            <div className={'title'}>{item.title}</div>
          </div>
        ))}
      </SummarySection>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 12px;
  gap: 5px;
  color: var(--dark-gray);

  .title {
    font-size: 13px;
    font-family: 'Aspira Demi', 'FiraGO Medium';
    color: var(--black);
    font-feature-settings: 'case';
  }
`;

const SummarySection = styled.div`
  display: flex;
  text-align: end;
  line-height: 1;

  .item {
    display: grid;
    row-gap: 3px;
    padding: 21px 23px 18px 37px;
    background: var(--light-green);
  }
  .title {
    font-size: 10px;
    color: var(--dark-gray);
  }
  .value {
    font-size: 15px;
    font-family: 'Aspira Demi', 'FiraGO Regular';
  }
`;
