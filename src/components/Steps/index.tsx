import { Fragment } from 'react';
import styled from 'styled-components';

import { ReactComponent as ToliaIcon } from 'assets/svg/tolia.svg';

interface ISteps {
  items: { label: string; title: string | number; step: number }[];
  activeStep: number;
  onChange?: (step: { label: string; title: string | number; step: number }) => void;
}

export default function Steps({ items, activeStep, onChange }: ISteps) {
  return (
    <Fragment>
      {items.map((item) => (
        <StepContainer
          key={item.step}
          onClick={() => (item.step < activeStep ? onChange?.(item) : null)}
          clickAble={item.step < activeStep && !!onChange}
        >
          <StepLabel activeStep={activeStep} step={item.step}>
            {item.label}
          </StepLabel>
          <StepCircle
            activeStep={activeStep}
            step={item.step}
            lastItem={items.length === item.step}
          >
            {activeStep > item.step ? <StyledMarkIcon /> : item.title}
          </StepCircle>
        </StepContainer>
      ))}
    </Fragment>
  );
}

const StyledMarkIcon = styled(ToliaIcon)`
  width: 15px;
  height: 15px;
  & path {
    fill: #ff9933;
    stroke: #ff9933;
    stroke-width: 1px;
  }
`;

const StepContainer = styled.div<{ clickAble: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 70px;
  position: relative;
  cursor: ${({ clickAble }) => (clickAble ? 'pointer' : 'default')};
  user-select: none;
`;

const StepLabel = styled.p<{ activeStep: number; step: number }>`
  margin-right: 31px;
  color: ${({ activeStep, step }) => (activeStep === step ? '#FF9933' : '#414141')};
  font-family: 'Aspira Demi', 'FiraGO Medium';
  font-size: 12px;
  text-align: right;
  white-space: pre-line;
`;

const StepCircle = styled.div<{ activeStep: number; step: number; lastItem: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ activeStep, step }) => (activeStep === step ? '#FFF' : '#414141')};
  font-size: 13px;
  font-family: 'Aspira Wide Demi', 'FiraGO Medium';
  background-color: ${({ activeStep, step }) =>
    activeStep === step ? '#FF9933' : activeStep > step ? '#FFF1E3' : '#FFF'};
  min-width: 43px;
  height: 43px;
  border-radius: 50%;
  border: ${({ activeStep, step }) =>
    activeStep === step ? 'none' : activeStep > step ? '1px solid #FF9933' : '1px solid #DCDCE4'};
  &::after {
    display: ${({ lastItem }) => (lastItem ? 'none' : 'block')};
    content: '';
    position: absolute;
    background-color: #f2f3f3;
    width: 3px;
    height: 80px;
    z-index: -1;
    top: 40px;
  }
  &::before {
    display: ${({ lastItem }) => (lastItem ? 'none' : 'block')};
    content: '';
    position: absolute;
    width: 9px;
    height: 9px;
    background-color: #dcdce4;
    border-radius: 50%;
    top: 74px;
  }
`;
