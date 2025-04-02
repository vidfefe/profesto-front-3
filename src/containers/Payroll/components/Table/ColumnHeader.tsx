import React from 'react';
import styled from 'styled-components';

type ColumnHeaderProps = {
  title: string;
  subtitle: string;
};

export const ColumnHeader = ({ title, subtitle }: ColumnHeaderProps) => {
  return (
    <Container>
      <span className={'title'}>{title}</span>
      <span className={'subtitle'}>{subtitle}</span>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  align-items: center;

  .subtitle {
    font-size: 10px;
     font-family: 'Aspira Regular', 'FiraGO Regular';
  }
`;
