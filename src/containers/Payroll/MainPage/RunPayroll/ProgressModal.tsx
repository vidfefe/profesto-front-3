import React from 'react';
import { useTranslation } from 'react-i18next';
import { CircularProgress } from '@mui/material';
import styled from 'styled-components';

import DialogModal from 'components/Modal/Dialog';

export const ProgressModal = () => {
  const { t } = useTranslation();

  return (
    <DialogModal open maxWidth={'sm'} withoutHeader>
      <Container>
        <CircularProgress size={60} sx={{ alignSelf: 'center' }} />
        <span className={'title'}>{t('payroll.modal.progress.title')}</span>
        <span>{t('payroll.modal.progress.subtitle')}</span>
      </Container>
    </DialogModal>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 90px 50px;
  gap: 20px;
  text-align: center;
  color: var(--dark-gray);

  .title {
    font-family: 'Aspira Demi', 'FiraGo Medium';
    font-size: 16px;
    margin-bottom: 20px;
  }
`;
