import React, { useMemo } from 'react';
import { useToasts } from 'react-toast-notifications';
import { useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ReactComponent as WarningMark } from 'assets/svg/warning-mark_circles.svg';

import useMutationCustom from 'hooks/useMutationCustom';
import Text from 'components/Text';
import DialogModal from 'components/Modal/Dialog';
import { useError } from 'hooks/useError';
import { PaymentDocumentType } from 'types';

type CancelModalProps = {
  id: number;
  documentType: PaymentDocumentType;
  onClose: () => void;
  period: string;
};

export const CancelModal = ({ id, documentType, onClose, period }: CancelModalProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { addToast } = useToasts();

  const { onError } = useError();

  const config = useMemo(() => {
    switch (documentType) {
      case PaymentDocumentType.REGULAR_PAYROLL:
        return {
          afterCancellation: () => queryClient.invalidateQueries('month_data'),
          endpoint: '/payment_document/cancel',
          text: t('payroll.modal.cancel.title.regular_payroll', { period }),
        };
      case PaymentDocumentType.ADVANCE_PAYMENT:
        return {
          endpoint: '/advance_payment_document/cancel',
          text: t('payroll.modal.cancel.title.advance_payment', { period }),
        };
      default:
        return {
          endpoint: '',
          text: '',
        };
    }
  }, [documentType, period, queryClient, t]);

  const { mutate: onCancel, isLoading } = useMutationCustom<
    {},
    { errors: string[] },
    { id: number }
  >(
    ['cancel_payment_document'],
    {
      endpoint: config.endpoint,
      options: { method: 'post' },
    },
    {
      onSuccess: () => {
        addToast(t('payroll.modal.cancel.toast'), {
          appearance: 'success',
          autoDismiss: true,
        });
        config.afterCancellation?.();
        queryClient.invalidateQueries('payment_documents');
        onClose();
      },
      onError,
    }
  );

  return (
    <DialogModal
      open
      title={t('payroll.modal.cancel.name')}
      onClose={onClose}
      actionButton={() => onCancel({ id })}
      withButtons
      actionButtonText={t('payroll.modal.cancel.action')}
      cancelButtonText={t('globaly.close')}
      actionLoading={isLoading}
      fullWidth
    >
      <div>
        <IconContainer>
          <WarningMark />
        </IconContainer>
        <TextContainer>
          <Text type="medium">{config.text}</Text>
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
