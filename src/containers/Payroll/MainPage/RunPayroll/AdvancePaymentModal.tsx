import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';
import styled from 'styled-components';

import { AdvancePaymentMutationInput, Employee, ErrorPayload, PaymentDocumentType } from 'types';
import DialogModal from 'components/Modal/Dialog';
import useMutationCustom from 'hooks/useMutationCustom';
import DatePicker from 'components/DatePickers/DatePicker';
import { useError } from 'hooks/useError';
import { getActiveEmployees } from 'services';
import { Multiselect } from 'components/Multiselect';

type FormValues = {
  payment_date: Date;
  employees: Array<Employee>;
};

type AdvancePaymentModalProps = {
  onClose: () => void;
};

export const AdvancePaymentModal = ({ onClose }: AdvancePaymentModalProps) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();
  const history = useHistory();

  const {
    handleSubmit,
    setError,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      payment_date: undefined,
      employees: [],
    },
  });

  const effective_date = watch('payment_date');

  const { onError } = useError({ setError });

  const { mutate: createAdvancePayment, isLoading } = useMutationCustom<
    { id: number },
    ErrorPayload,
    AdvancePaymentMutationInput
  >(
    ['create_advance_payment_document'],
    {
      endpoint: '/advance_payment_document',
      options: { method: 'post' },
    },
    {
      onSuccess: (data) => {
        addToast(t('payroll.modal.advance_payment.toast'), {
          appearance: 'success',
          autoDismiss: true,
        });
        history.push(`/advance_payment_document/${data.id}`);
      },
      onError,
    }
  );

  const onSubmit = useCallback(
    (formData: FormValues) => {
      createAdvancePayment({
        payment_date: formData.payment_date,
        employee_ids: formData.employees.map((employee) => employee.id),
        payment_document_type: PaymentDocumentType.ADVANCE_PAYMENT,
      });
    },
    [createAdvancePayment]
  );

  return (
    <>
      <DialogModal
        open
        onClose={onClose}
        title={t('payroll.modal.advance_payment.name')}
        actionButton={handleSubmit(onSubmit)}
        withButtons
        cancelButtonText={t('globaly.cancel')}
        actionButtonText={t('globaly.create')}
        actionLoading={isLoading}
      >
        <Container>
          <div className={'info'}>{t('payroll.modal.advance_payment.info')}</div>
          <StyledFieldItem>
            <label>
              {t('payroll.pay_date')}
              <sup>*</sup>
            </label>
            <Controller
              name={'payment_date'}
              control={control}
              rules={{
                required: t('payroll.modal.run.validation.pay_day'),
              }}
              render={({ field: { value, onChange } }) => (
                <DatePicker
                  errorText={errors.payment_date?.message}
                  selected={value}
                  onChange={onChange}
                  todayButton={false}
                />
              )}
            />
          </StyledFieldItem>
          <StyledFieldItem>
            <label>
              {t('payroll.modal.advance_payment.employees')}
              <sup>*</sup>
            </label>
            <Controller
              name={'employees'}
              control={control}
              rules={{
                validate: (value) =>
                  value.length
                    ? undefined
                    : t('payroll.modal.advance_payment.employees_validation'),
              }}
              render={({ field: { onChange, value } }) => (
                <Multiselect
                  placeholder={
                    value.length
                      ? ''
                      : t('components.select.placeholder', {
                          field: t('payroll.modal.advance_payment.employees'),
                        })
                  }
                  onChange={onChange}
                  value={value}
                  loadRemoteData={() =>
                    getActiveEmployees({
                      effective_date: effective_date
                        ? effective_date?.toLocaleDateString()
                        : undefined,
                    })
                  }
                  errorText={errors.employees?.message}
                />
              )}
            />
          </StyledFieldItem>
        </Container>
      </DialogModal>
    </>
  );
};

const Container = styled.div`
  padding: 12px 31px 31px 41px;
  width: 500px;
  height: 375px;
  max-width: calc(100vw - 112px);

  .info {
    color: var(--dark-gray);
    padding-bottom: 28px;
    line-height: 18px;
    font-size: 14px;
    text-align: center;
  }
`;

const StyledFieldItem = styled.div`
  margin-bottom: 16px;
  margin-right: 10px;
  & sup {
    color: #c54343;
  }
  & > label {
    display: inline-block;
    margin-bottom: 6px;
  }
`;
