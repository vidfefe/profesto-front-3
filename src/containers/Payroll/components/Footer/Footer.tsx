import React, { CSSProperties, Dispatch, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { Button } from '@mui/material';
import styled from 'styled-components';

import { ReactComponent as ArrowIcon } from 'assets/svg/sliderArrow.svg';

type FooterProps = {
  onClose: () => void;
  onSubmit?: () => void;
} & (
  | {
      activeStep: number;
      flowLength: number;
      setActiveStep: Dispatch<React.SetStateAction<number>>;
    }
  | {
      activeStep?: never;
      flowLength?: never;
      setActiveStep?: never;
    }
);

export const Footer = ({
  activeStep,
  flowLength,
  onClose,
  onSubmit,
  setActiveStep,
}: FooterProps) => {
  const { t } = useTranslation();
  const history = useHistory<{ step: number }>();

  const getHiddenStyle = useCallback((conditionToShow: boolean) => {
    const result: CSSProperties = {
      opacity: conditionToShow ? 1 : 0,
      pointerEvents: conditionToShow ? 'auto' : 'none',
    };
    return result;
  }, []);

  return (
    <Container>
      <Button className={'close'} onClick={onClose} variant={'outlined'}>
        {t('payroll.payment_document.close')}
      </Button>
      {activeStep ? (
        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            className={'prev'}
            style={getHiddenStyle(activeStep > 1)}
            onClick={() =>
              setActiveStep((prev) => {
                history.replace({ state: { step: prev - 1 } });
                return prev - 1;
              })
            }
            variant={'text'}
            startIcon={<ArrowIcon />}
          >
            {t('payroll.payment_document.previous_step')}
          </Button>
          {activeStep === flowLength && onSubmit ? (
            <Button className={'submit'} onClick={onSubmit} variant={'contained'}>
              {t('payroll.payment_document.submit')}
            </Button>
          ) : (
            <Button
              style={getHiddenStyle(activeStep < flowLength)}
              onClick={() => {
                setActiveStep((prev) => {
                  history.replace({ state: { step: prev + 1 } });
                  return prev + 1;
                });
              }}
              variant={'contained'}
              endIcon={<ArrowIcon />}
            >
              {t('payroll.payment_document.continue')}
            </Button>
          )}
        </div>
      ) : (
        onSubmit && (
          <Button className={'submit'} onClick={onSubmit} variant={'contained'}>
            {t('payroll.payment_document.submit')}
          </Button>
        )
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 10px;
  gap: 70px;
  height: 50px;
  border-top: 1px solid var(--light-gray);

  button {
    font-size: 11.25px;
    width: 152px;
    justify-content: space-between;

    &:not(.close, .prev) {
      background-color: #339966 !important;
      &:hover {
        background-color: #236b47 !important;
      }
    }
  }
  .close,
  .submit {
    justify-content: center;
  }
  .prev {
    padding: 6px 16px;
    svg {
      transform: rotate(180deg);
      path {
        fill: var(--green);
      }
    }

    background-color: transparent !important;
    &:hover {
      background-color: #dceee5 !important;
    }
  }
`;
