import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useToasts } from 'react-toast-notifications';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';

import useMutationCustom from 'hooks/useMutationCustom';
import DialogModal from 'components/Modal/Dialog';
import UniversalInput from '../../../../components/Input/UniversalInput';
import { getPaymentType } from 'services';
import { PaymentTypeCategory } from 'types';

type PaymentTypeModalProps = {
  id: number;
  onClose: () => void;
  refreshData: () => void;
  title: string;
};

type FormValues = {
  category: PaymentTypeCategory;
  name: string;
  multiplier: string;
};

export const PaymentTypeModal = ({ id, onClose, refreshData, title }: PaymentTypeModalProps) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      category: undefined,
      name: '',
      multiplier: undefined,
    },
  });

  const category = watch('category');

  useEffect(() => {
    getPaymentType(id).then((res) => {
      reset({
        category: res.data.category.id,
        name: res.data.name,
        multiplier: res.data.multiplier ? Number(res.data.multiplier).toFixed(2) : undefined,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatePaymentType = useMutationCustom<
    {},
    { errors: [{ field: string; message: string }] },
    { name: string; multiplier: string }
  >(
    ['update_payment_type'],
    {
      endpoint: `payment_type/${id}`,
      options: { method: 'put' },
    },
    {
      onSuccess: () => {
        onClose();
        addToast(`${t('globaly.update_success', { title })}`, {
          appearance: 'success',
          autoDismiss: true,
        });
        refreshData();
      },
      onError: (err) => {
        if (err?.errors[0].field) {
          err.errors.forEach((item: any) => {
            setError(item.field, { type: 'custom', message: item.message });
          });
        }
      },
    }
  );

  const onSubmit = useCallback(
    (data: FormValues) => {
      updatePaymentType.mutate({
        name: data.name,
        multiplier: data.multiplier,
      });
    },
    [updatePaymentType]
  );

  return (
    <DialogModal
      open={true}
      title={`${t('dictionaries.edit')} ${title}`}
      onClose={() => onClose()}
      actionButton={handleSubmit(onSubmit)}
      withButtons
      cancelButtonText={t('globaly.cancel')}
      actionButtonText={t('globaly.save')}
      actionLoading={updatePaymentType.isLoading}
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
            errorText={errors.name ? errors.name.message : ''}
            {...register('name', {
              required: t('validations.is_required', { attribute: title }),
              maxLength: 250,
            })}
          />
        </StyledFieldItem>
        {category === PaymentTypeCategory.ADDITIONAL && (
          <StyledFieldItem>
            <Controller
              control={control}
              rules={{
                required: t('validations.is_required', {
                  attribute: t('settings.payment_type.multiplier'),
                }),
                validate: (value) =>
                  !Number(value)
                    ? t('validations.is_required', {
                        attribute: t('settings.payment_type.multiplier'),
                      })
                    : undefined,
              }}
              name={'multiplier'}
              render={({ field: { onChange, value, ref } }) => (
                <NumericFormat
                  label={t('settings.payment_type.multiplier')}
                  required={true}
                  onValueChange={(values) => onChange(values.value)}
                  value={value}
                  inputRef={ref}
                  customInput={UniversalInput}
                  decimalSeparator="."
                  decimalScale={2}
                  valueIsNumericString
                  errorText={errors.multiplier ? errors.multiplier.message : ''}
                  allowNegative={false}
                />
              )}
            />
          </StyledFieldItem>
        )}
      </div>
    </DialogModal>
  );
};

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
