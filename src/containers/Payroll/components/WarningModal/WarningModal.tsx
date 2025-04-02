import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ReactComponent as WarningMark } from 'assets/svg/warning-mark_circles.svg';

import DialogModal from 'components/Modal/Dialog';

type WarningModalProps = {
  onClose: () => void;
  subtitle: string;
  title: string;
};

export const WarningModal = ({ onClose, subtitle, title }: WarningModalProps) => {
  const { t } = useTranslation();

  return (
    <DialogModal
      actionButtonText={t('globaly.close')}
      open
      actionButton={onClose}
      hideCancelButton
      maxWidth={'sm'}
      withoutHeader
      withButtons
    >
      <Container>
        <WarningMark />
        <span className={'title'}>{title}</span>
        <span>{subtitle}</span>
      </Container>
    </DialogModal>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px 30px;
  gap: 20px;
  text-align: center;
  color: var(--dark-gray);

  .title {
    font-family: 'Aspira Demi', 'FiraGo Medium';
    font-size: 16px;
  }
`;
