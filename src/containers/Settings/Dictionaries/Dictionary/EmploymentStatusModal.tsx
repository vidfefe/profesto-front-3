import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useToasts } from 'react-toast-notifications';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';

import useMutationCustom from 'hooks/useMutationCustom';
import DialogModal from 'components/Modal/Dialog';
import UniversalInput from '../../../../components/Input/UniversalInput';
import { EmploymentStatus, EmploymentStatusMutationInput, ErrorPayload } from 'types';
import useQueryCustom from 'hooks/useQueryCustom';
import Checkbox from 'components/Checkbox';

type EmploymentStatusModalProps = {
  afterSubmit?: (value: EmploymentStatus) => void;
  id?: number;
  onClose: () => void;
  refreshData?: () => void;
  title: string;
};

type FormValues = {
  incomeTax: string | number;
  name: string;
  pensionTax: boolean;
};

export const EmploymentStatusModal = ({
  afterSubmit,
  id,
  onClose,
  refreshData,
  title,
}: EmploymentStatusModalProps) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();

  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      incomeTax: undefined,
      name: '',
      pensionTax: false,
    },
  });

  useQueryCustom<EmploymentStatus, { errors: string[] }>(
    ['employment_status'],
    {
      endpoint: `/employment_status/${id}`,
      options: { method: 'get' },
    },
    {
      onSuccess: (data) => {
        setValue('incomeTax', Number(data.income_tax));
        setValue('pensionTax', data.employee_pays_pension_tax);
        setValue('name', data.name);
      },
      refetchOnWindowFocus: false,
      enabled: !!id,
    }
  );

  const getConfig = useCallback(
    (type: 'add' | 'update') => {
      const result = {
        onSuccess: (data: EmploymentStatus) => {
          afterSubmit?.(data);
          onClose();
          addToast(`${t(`globaly.${type}_success`, { title })}`, {
            appearance: 'success',
            autoDismiss: true,
          });
          refreshData?.();
        },
        onError: (err: ErrorPayload) => {
          if (err?.errors[0].field) {
            err.errors.forEach((item: any) => {
              setError(item.field, { type: 'custom', message: item.message });
            });
          }
        },
      };
      return result;
    },
    [addToast, afterSubmit, onClose, refreshData, setError, t, title]
  );

  const createEmploymentStatus = useMutationCustom<
    EmploymentStatus,
    ErrorPayload,
    EmploymentStatusMutationInput
  >(
    ['update_employment_status'],
    {
      endpoint: '/employment_status',
      options: { method: 'post' },
    },
    getConfig('add')
  );

  const updateEmploymentStatus = useMutationCustom<
    EmploymentStatus,
    ErrorPayload,
    EmploymentStatusMutationInput
  >(
    ['update_employment_status'],
    {
      endpoint: `/employment_status/${id}`,
      options: { method: 'put' },
    },
    getConfig('update')
  );

  const onSubmit = useCallback(
    (formData: FormValues) => {
      const data: EmploymentStatusMutationInput = {
        income_tax: formData.incomeTax,
        name: formData.name,
        employee_pays_pension_tax: formData.pensionTax,
      };

      id ? updateEmploymentStatus.mutate(data) : createEmploymentStatus.mutate(data);
    },
    [createEmploymentStatus, id, updateEmploymentStatus]
  );

  return (
    <DialogModal
      open={true}
      title={`${t(`dictionaries.${id ? 'edit' : 'add'}`)} ${title}`}
      onClose={() => onClose()}
      actionButton={handleSubmit(onSubmit)}
      withButtons
      cancelButtonText={t('globaly.cancel')}
      actionButtonText={t('globaly.save')}
      actionLoading={updateEmploymentStatus.isLoading || createEmploymentStatus.isLoading}
      upperPosition
      fullWidth
    >
      <div style={{ paddingBlock: 10 }}>
        <StyledFieldItem>
          <label>
            {title}
            <sup>*</sup>
          </label>
          <UniversalInput
            inputProps={{ maxLength: 250 }}
            placeholder={t('dictionaries.placeholder', { title })}
            errorText={errors.name?.message}
            {...register('name', {
              required: t('validations.is_required', { attribute: title }),
              maxLength: 250,
            })}
          />
        </StyledFieldItem>
        <GridContainer>
          <StyledFieldItem>
            <Controller
              control={control}
              rules={{
                required: t('validations.is_required', {
                  attribute: t('settings.employment_status.income_tax'),
                }),
              }}
              name={'incomeTax'}
              render={({ field: { onChange, value, ref } }) => (
                <NumericFormat
                  label={t('settings.employment_status.income_tax')}
                  required={true}
                  onValueChange={(values) => onChange(values.value)}
                  value={value}
                  inputRef={ref}
                  customInput={UniversalInput}
                  decimalSeparator="."
                  valueIsNumericString
                  errorText={errors.incomeTax?.message}
                  allowNegative={false}
                />
              )}
            />
          </StyledFieldItem>
          <StyledFieldItem style={{ marginTop: 30 }}>
            <Controller
              name={'pensionTax'}
              control={control}
              render={({ field: { onChange, value } }) => (
                <Checkbox
                  checked={value}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    onChange(event.target.checked)
                  }
                  label={t('settings.employment_status.pension_tax')}
                  labelStyle={{ height: 22 }}
                />
              )}
            />
          </StyledFieldItem>
        </GridContainer>
      </div>
    </DialogModal>
  );
};

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
