import React from 'react';
import { useToasts } from 'react-toast-notifications';
import { useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ReactComponent as WarningMark } from 'assets/svg/warning-mark_circles.svg';

import useMutationCustom from 'hooks/useMutationCustom';
import Text from 'components/Text';
import DialogModal from 'components/Modal/Dialog';
import { useError } from 'hooks/useError';

type DeleteEmployeeProps = {
  id: number;
  onClose: () => void;
};

export const DeleteEmployee = ({ id, onClose }: DeleteEmployeeProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { addToast } = useToasts();

  const { onError } = useError();

  const { mutate: onDeleteEmployee, isLoading } = useMutationCustom(
    ['delete_advance_payment_employee'],
    {
      endpoint: `/advance_payment/${id}`,
      options: { method: 'delete' },
    },
    {
      onSuccess: () => {
        addToast(t('payroll.advance_payment.modal.delete.toast'), {
          appearance: 'success',
          autoDismiss: true,
        });
        queryClient.invalidateQueries('advance_payment_document');
        onClose();
      },
      onError,
    }
  );

  return (
    <DialogModal
      open
      title={t('payroll.advance_payment.modal.delete.title')}
      onClose={onClose}
      actionButton={onDeleteEmployee}
      withButtons
      actionButtonText={t('globaly.delete')}
      actionLoading={isLoading}
      fullWidth
    >
      <div>
        <IconContainer>
          <WarningMark />
        </IconContainer>
        <TextContainer>
          <Text type="medium">{t('payroll.advance_payment.modal.delete.text')}</Text>
        </TextContainer>
      </div>
    </DialogModal>
  );
};

const IconContainer = styled.div`
  padding-top: 20px;
  padding-bottom: 26px;
  display: flex;
  justify-content: center;
`;

const TextContainer = styled.div`
  padding-bottom: 30px;
  display: flex;
  justify-content: center;
  padding-inline: 12%;
  text-align: center;
`;
