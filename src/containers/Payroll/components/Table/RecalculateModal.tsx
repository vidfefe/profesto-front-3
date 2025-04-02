import React from 'react';
import { useTranslation } from 'react-i18next';
import { useToasts } from 'react-toast-notifications';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import CheckIcon from '@mui/icons-material/Check';

import { ReactComponent as WarningMark } from 'assets/svg/warning-mark_circles.svg';

import DialogModal from 'components/Modal/Dialog';
import useMutationCustom from 'hooks/useMutationCustom';
import { useError } from 'hooks/useError';
import { ProgressModal } from 'containers/Payroll/MainPage/RunPayroll/ProgressModal';

type RecalculateModalProps = {
  onClose: () => void;
  id: number;
};

export const RecalculateModal = ({ onClose, id }: RecalculateModalProps) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'payroll.payment_document.recalculate_modal',
  });
  const { addToast } = useToasts();
  const history = useHistory();
  const location = useLocation();

  const { onError } = useError();

  const { mutate: recalculate, isLoading } = useMutationCustom<{ id: number }>(
    ['recalculate_payment_document'],
    {
      endpoint: `/payment_document/${id}/recalculate`,
      options: { method: 'post' },
    },
    {
      onSuccess: (data) => {
        onClose();
        addToast(t('toast'), {
          appearance: 'success',
          autoDismiss: true,
        });
        history.push(`/payroll/${data.id}`, location.state);
      },
      onError,
    }
  );

  return (
    <>
      <DialogModal
        actionButtonText={t('action')}
        actionButton={recalculate}
        onClose={onClose}
        open={!isLoading}
        title={t('name')}
        withButtons
      >
        <Container>
          <WarningMark />
          <span className={'title'}>{t('title')}</span>
          <List>
            {(t('list', { returnObjects: true }) as string[]).map((option, index) => (
              <span key={index}>
                <CheckIcon />
                {option}
              </span>
            ))}
          </List>
        </Container>
      </DialogModal>
      {isLoading && <ProgressModal />}
    </>
  );
};

const List = styled.div`
  display: grid;
  gap: 12px;
  color: var(--dark-gray);
  width: 100%;

  span {
    display: flex;
    text-align: start;
    align-items: center;
    gap: 10px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 6px 30px;
  gap: 20px;
  text-align: center;
  color: var(--dark-gray);
  width: 500px;

  .title {
    font-family: 'Aspira Demi', 'FiraGo Medium';
    font-size: 16px;
    margin-bottom: 15px;
  }
`;
