import React, { useState, useEffect, useCallback } from 'react';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from 'react-i18next';
import { useToasts } from 'react-toast-notifications';
import styled from 'styled-components';

import { getDeduction } from 'services';
import DialogModal from 'components/Modal/Dialog';
import UniversalInput from 'components/Input/UniversalInput';
import useMutationCustom from 'hooks/useMutationCustom';
import { EditModalState } from '../Dictionary';
import { Benefit, DeductionMutationInput, DeductionStatus } from 'types';
import Checkbox from 'components/Checkbox';

type FormValues = {
  deduction_status: DeductionStatus;
  name: string;
};

type BenefitModalProps = {
  afterSubmit?: (value: Benefit) => void;
  isOpen: boolean;
  editModalState: EditModalState;
  onCloseModal: () => void;
  singularTitle: string;
  refreshData: () => void;
};

export const DeductionModal = ({
  afterSubmit,
  isOpen,
  editModalState,
  onCloseModal,
  singularTitle,
  refreshData,
}: BenefitModalProps) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    reset,
    setValue,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      deduction_status: DeductionStatus.ACTIVE,
      name: '',
    },
  });

  useEffect(() => {
    if (editModalState) {
      setIsLoading(true);
      getDeduction(editModalState.id)
        .then((res) => {
          setValue('deduction_status', res.data.status.id);
          setValue('name', res.data.name);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editModalState]);

  const createDeduction = useMutationCustom<
    {},
    { errors: [{ field: string; message: string }] },
    DeductionMutationInput
  >(
    ['create_deduction'],
    {
      endpoint: '/deduction',
      options: { method: 'post' },
    },
    {
      onSuccess: (data) => {
        afterSubmit?.(data as Benefit);
        onCloseModal();
        addToast(`${t('globaly.add_success', { title: singularTitle })}`, {
          appearance: 'success',
          autoDismiss: true,
        });
        reset();
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

  const updateDeduction = useMutationCustom<
    {},
    { errors: [{ field: string; message: string }] },
    DeductionMutationInput
  >(
    ['update_deduction'],
    {
      endpoint: `deduction/${editModalState?.id}`,
      options: { method: 'put' },
    },
    {
      onSuccess: () => {
        onCloseModal();
        addToast(`${t('globaly.update_success', { title: singularTitle })}`, {
          appearance: 'success',
          autoDismiss: true,
        });
        reset();
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

  const onError = useCallback(
    (err: FieldErrors<FormValues>) => {
      if (err) {
        addToast(
          <ToastContentContainer
            dangerouslySetInnerHTML={{ __html: t('globaly.fix_Highlighted') }}
          />,
          {
            appearance: 'error',
            autoDismiss: true,
            placement: 'top-center',
          }
        );
      }
    },
    [addToast, t]
  );

  const onSubmit = useCallback(
    (data: FormValues) => {
      editModalState ? updateDeduction.mutate(data) : createDeduction.mutate(data);
    },
    [createDeduction, editModalState, updateDeduction]
  );

  return (
    <DialogModal
      open={isOpen || !!editModalState}
      title={isOpen ? t('settings.deduction.add') : t('settings.deduction.edit')}
      onClose={() => {
        onCloseModal();
        reset();
      }}
      actionButton={handleSubmit(onSubmit, onError)}
      withButtons
      cancelButtonText={t('globaly.cancel')}
      actionButtonText={t('globaly.save')}
      actionLoading={updateDeduction.isLoading || createDeduction.isLoading}
      maxWidth={'md'}
      upperPosition
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          paddingBlock: 10,
          width: 600,
          maxWidth: 'calc(100vw - 112px)',
        }}
      >
        {isLoading ? (
          <CircularProgress sx={{ alignSelf: 'center' }} />
        ) : (
          <>
            <StyledFieldItem>
              <UniversalInput
                label={t('settings.deduction.name')}
                required
                inputProps={{ maxLength: 150 }}
                placeholder={t('settings.deduction.placeholder')}
                errorText={errors.name?.message}
                {...register('name', {
                  required: t('settings.deduction.required'),
                })}
              />
            </StyledFieldItem>
            {editModalState?.id && (
              <StyledFieldItem>
                <Controller
                  name={'deduction_status'}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Checkbox
                      checked={value === DeductionStatus.ACTIVE}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        onChange(
                          event.target.checked ? DeductionStatus.ACTIVE : DeductionStatus.INACTIVE
                        )
                      }
                      label={t('enums.active')}
                    />
                  )}
                />
              </StyledFieldItem>
            )}
          </>
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

const ToastContentContainer = styled.div`
  & > b {
    font-family: 'Aspira Demi', 'FiraGO Regular';
  }
`;
