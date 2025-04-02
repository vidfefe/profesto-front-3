import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { ErrorPayload, PaymentDocumentType, RunPayrollMutationInput } from 'types';
import { createPaymentSchedule, getPaymentSchedule } from 'services';
import DialogModal from 'components/Modal/Dialog';
import useMutationCustom from 'hooks/useMutationCustom';
import DatePicker from 'components/DatePickers/DatePicker';
import SelectWithAdd from 'components/Dropdowns/SelectWithAdd';
import { ProgressModal } from './ProgressModal';
import { useError } from 'hooks/useError';
import MainErrorBox from 'components/error/mainError';
import { WarningModal } from 'containers/Payroll/components/WarningModal';

type FormValues = {
  payment_date: Date;
  payment_schedule: {
    id: number;
    name: string;
  } | null;
  period_start?: Date;
  period_end?: Date;
  period?: Date;
  payment_document_type: string;
};

type RegularPayrollModalProps = {
  onClose: () => void;
};

const monthID = 4;
const apiDateErrorTypes = ['overlaps', 'dates'];

export const RegularPayrollModal = ({ onClose }: RegularPayrollModalProps) => {
  const { t } = useTranslation();
  const history = useHistory();

  const [errorModal, setErrorModal] = useState(false);

  const {
    handleSubmit,
    setError,
    control,
    watch,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      payment_date: undefined,
      payment_schedule: null,
      period_start: undefined,
      period_end: undefined,
      period: undefined,
      payment_document_type: PaymentDocumentType.REGULAR_PAYROLL,
    },
  });

  const { onError } = useError({ setError });

  const paymentSchedule = watch('payment_schedule');
  const isApiDateError = apiDateErrorTypes.includes(errors.period_start?.type || '');

  const { mutate: validatePayroll, isLoading: validationInProgress } = useMutationCustom<
    RunPayrollMutationInput,
    ErrorPayload | null,
    RunPayrollMutationInput
  >(
    ['validate_payroll'],
    {
      endpoint: '/payment_document/validate',
      options: { method: 'post' },
    },
    {
      onSuccess: (data) => {
        runPayroll(data);
      },
      onError: (err) => {
        if (err) {
          onError(err);
        } else {
          setErrorModal(true);
        }
      },
    }
  );

  const { mutate: runPayroll, isLoading: payrollInProgress } = useMutationCustom<
    { id: number },
    { errors: [{ field: string; message: string }] },
    RunPayrollMutationInput
  >(
    ['run_payroll'],
    {
      endpoint: '/payment_document',
      options: { method: 'post' },
    },
    {
      onSuccess: (data) => {
        history.push(`/payroll/${data.id}`);
      },
      onError,
    }
  );

  const onSubmit = useCallback(
    (formData: FormValues) => {
      const data: RunPayrollMutationInput = {
        payment_date: formData.payment_date,
        payment_schedule_id: formData.payment_schedule!.id,
        period_start:
          formData.period_start ||
          new Date(formData.period!.getFullYear(), formData.period!.getMonth(), 1),
        period_end:
          formData.period_end ||
          new Date(formData.period!.getFullYear(), formData.period!.getMonth() + 1, 0),
        payment_document_type: formData.payment_document_type,
      };
      validatePayroll(data);
    },
    [validatePayroll]
  );

  return (
    <>
      <DialogModal
        open
        onClose={onClose}
        title={t('payroll.run_block.run_regular_payroll')}
        actionButton={handleSubmit(onSubmit)}
        withButtons
        hidden={payrollInProgress || errorModal}
        actionButtonText={t('payroll.modal.run.action')}
        actionLoading={validationInProgress}
      >
        <Container>
          <div className={'info'}>{t('payroll.modal.run.info')}</div>
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
              {t('payroll.history_block.pay_schedule')}
              <sup>*</sup>
            </label>
            <Controller
              name={'payment_schedule'}
              control={control}
              rules={{
                required: t('payroll.modal.run.validation.pay_schedule'),
              }}
              render={({ field: { value, onChange } }) => (
                <SelectWithAdd
                  name={t('payroll.history_block.pay_schedule')}
                  inputPlaceholder={t('createPerson.select_pay_schedule')}
                  errorText={errors.payment_schedule?.message}
                  inputValue={value}
                  loadRemoteData={() => getPaymentSchedule(25, 1)}
                  createRequest={createPaymentSchedule}
                  onChange={(option: FormValues['payment_schedule']) => {
                    if (option?.id === monthID) {
                      setValue('period_start', undefined);
                      setValue('period_end', undefined);
                      clearErrors(['period_start', 'period_end']);
                    } else if (value?.id === monthID && option?.id !== monthID) {
                      setValue('period', undefined);
                      clearErrors(['period']);
                    }
                    onChange(option);
                  }}
                />
              )}
            />
          </StyledFieldItem>
          <StyledFieldItem>
            <label>
              {t('payroll.history_block.pay_period')}
              <sup>*</sup>
            </label>
            {paymentSchedule?.id === monthID ? (
              <Controller
                name={'period'}
                control={control}
                rules={{
                  required: t('payroll.modal.run.validation.pay_period'),
                }}
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    dateFormat={'MMMM yyyy'}
                    showMonthYearPicker
                    errorText={errors.period?.message || errors.period_start?.message}
                    customInput={null}
                    selected={value}
                    onChange={onChange}
                  />
                )}
              />
            ) : (
              <DateContainer>
                <div>
                  <Controller
                    name={'period_start'}
                    control={control}
                    rules={{
                      required: t('payroll.modal.run.validation.pay_period'),
                    }}
                    render={({ field: { value, onChange } }) => (
                      <DatePicker
                        errorText={errors.period_start?.message}
                        errorWithoutText={isApiDateError}
                        selected={value}
                        onChange={onChange}
                      />
                    )}
                  />
                </div>
                <div>
                  <Controller
                    name={'period_end'}
                    control={control}
                    rules={{
                      required: t('payroll.modal.run.validation.pay_period'),
                    }}
                    render={({ field: { value, onChange } }) => (
                      <DatePicker
                        errorText={errors.period_end?.message || isApiDateError}
                        errorWithoutText={isApiDateError}
                        selected={value}
                        onChange={(event) => {
                          onChange(event);
                          if (isApiDateError) {
                            clearErrors(['period_start']);
                          }
                        }}
                      />
                    )}
                  />
                </div>
              </DateContainer>
            )}
          </StyledFieldItem>
          {errors.period_start?.message && isApiDateError && (
            <MainErrorBox type="error" text={errors.period_start.message} />
          )}
        </Container>
      </DialogModal>
      {payrollInProgress && <ProgressModal />}
      {errorModal && (
        <WarningModal
          onClose={onClose}
          subtitle={t('payroll.modal.no_employees.subtitle')}
          title={t('payroll.modal.no_employees.title')}
        />
      )}
    </>
  );
};

const Container = styled.div`
  padding: 12px 31px 31px 41px;
  width: 500px;
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
  & sup {
    color: #c54343;
  }
  & > label {
    display: inline-block;
    margin-bottom: 6px;
  }
`;

const DateContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
`;
