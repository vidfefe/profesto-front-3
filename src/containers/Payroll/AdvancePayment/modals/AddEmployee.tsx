import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { useToasts } from 'react-toast-notifications';
import { useQueryClient } from 'react-query';
import styled from 'styled-components';

import {
  AdvancePaymentDocument,
  AdvancePaymentEmployeeMutationInput,
  Employee,
  ErrorPayload,
} from 'types';
import DialogModal from 'components/Modal/Dialog';
import useMutationCustom from 'hooks/useMutationCustom';
import { useError } from 'hooks/useError';
import { getDocumentActiveEmployees } from 'services';
import { Multiselect } from 'components/Multiselect';

type FormValues = {
  employees: Array<Employee>;
};

type AddEmployeeProps = {
  documentId: string | number;
  onClose: () => void;
};

export const AddEmployee = ({ documentId, onClose }: AddEmployeeProps) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      employees: [],
    },
  });

  const { onError } = useError({ setError });

  const { mutate: onAddEmployee, isLoading } = useMutationCustom<
    AdvancePaymentDocument,
    ErrorPayload,
    AdvancePaymentEmployeeMutationInput
  >(
    ['add_advance_payment_employees'],
    {
      endpoint: '/advance_payment',
      options: { method: 'post' },
    },
    {
      onSuccess: () => {
        addToast(t('payroll.advance_payment.modal.add.toast'), {
          appearance: 'success',
          autoDismiss: true,
        });
        queryClient.invalidateQueries('advance_payment_document');
        onClose();
      },
      onError,
    }
  );

  const onSubmit = useCallback(
    (formData: FormValues) => {
      onAddEmployee({
        employee_ids: formData.employees.map((employee) => employee.id),
        payment_document_id: Number(documentId),
      });
    },
    [documentId, onAddEmployee]
  );

  return (
    <>
      <DialogModal
        open
        onClose={onClose}
        title={t('payroll.advance_payment.modal.add.title')}
        actionButton={handleSubmit(onSubmit)}
        withButtons
        actionButtonText={t('globaly.add')}
        actionLoading={isLoading}
      >
        <Container>
          <div className={'info'}>{t('payroll.advance_payment.modal.add.text')}</div>
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
                  loadRemoteData={() => getDocumentActiveEmployees(documentId)}
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
