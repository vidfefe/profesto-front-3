import React, { CSSProperties, ReactElement } from 'react';
import styled from 'styled-components';

type SectionProps = {
  amount?: string;
  children: ReactElement;
  style?: CSSProperties;
  title: string;
};

export const Section = ({ amount, children, style, title }: SectionProps) => {
  return (
    <Container style={style}>
      <Header>
        <span>{title}</span>
        {amount && <span className={'amount'}>{amount}</span>}
      </Header>
      <Body>{children}</Body>
    </Container>
  );
};

const Container = styled.div`
  border: 1px solid #EEEEEE;
  border-radius: 4px;
  overflow: auto;
`;

const Header = styled.div`
  background: var(--meddium-green);
  display: flex;
  justify-content: space-between;
  padding: 8.5px 12px;
  font-size: 12px;
  align-items: center;

  .amount {
    font-size: 13px;
    font-family: 'Aspira Wide Demi', 'FiraGO Regular';
  }
`;

const Body = styled.div`
  padding: 19px 15px;
  height: 100%;
  max-height: calc(100% - 40px);
`;
