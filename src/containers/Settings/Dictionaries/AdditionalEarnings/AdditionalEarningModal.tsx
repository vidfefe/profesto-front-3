import React, { useState, useEffect, useCallback } from 'react';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from 'react-i18next';
import { useToasts } from 'react-toast-notifications';
import styled from 'styled-components';

import { getAdditionalEarning } from 'services';
import DialogModal from 'components/Modal/Dialog';
import UniversalInput from 'components/Input/UniversalInput';
import useMutationCustom from 'hooks/useMutationCustom';
import { EditModalState } from '../Dictionary';
import { AdditionalEarning, AdditionalEarningMutationInput, AdditionalEarningStatus } from 'types';
import Checkbox from 'components/Checkbox';

type FormValues = {
  additional_earning_status: AdditionalEarningStatus;
  name: string;
};

type AdditionalEarningModalProps = {
  afterSubmit?: (value: AdditionalEarning) => void;
  isOpen: boolean;
  editModalState: EditModalState;
  onCloseModal: () => void;
  singularTitle: string;
  refreshData: () => void;
};

export const AdditionalEarningModal = ({
  afterSubmit,
  isOpen,
  editModalState,
  onCloseModal,
  singularTitle,
  refreshData,
}: AdditionalEarningModalProps) => {
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
      additional_earning_status: undefined,
      name: '',
    },
  });

  useEffect(() => {
    if (editModalState) {
      setIsLoading(true);
      getAdditionalEarning(editModalState.id)
        .then((res) => {
          setValue('additional_earning_status', res.data.status.id);
          setValue('name', res.data.name);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editModalState]);

  const createAdditionalEarning = useMutationCustom<
    {},
    { errors: [{ field: string; message: string }] },
    AdditionalEarningMutationInput
  >(
    ['create_additional_earning'],
    {
      endpoint: '/additional_earning',
      options: { method: 'post' },
    },
    {
      onSuccess: (data) => {
        afterSubmit?.(data as AdditionalEarning);
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

  const updateAdditionalEarning = useMutationCustom<
    {},
    { errors: [{ field: string; message: string }] },
    AdditionalEarningMutationInput
  >(
    ['update_additional_earning'],
    {
      endpoint: `additional_earning/${editModalState?.id}`,
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
      editModalState ? updateAdditionalEarning.mutate(data) : createAdditionalEarning.mutate(data);
    },
    [createAdditionalEarning, editModalState, updateAdditionalEarning]
  );

  return (
    <DialogModal
      open={isOpen || !!editModalState}
      title={isOpen ? t('settings.additionalEarning.add') : t('settings.additionalEarning.edit')}
      onClose={() => {
        onCloseModal();
        reset();
      }}
      actionButton={handleSubmit(onSubmit, onError)}
      withButtons
      cancelButtonText={t('globaly.cancel')}
      actionButtonText={t('globaly.save')}
      actionLoading={updateAdditionalEarning.isLoading || createAdditionalEarning.isLoading}
      maxWidth={'md'}
      upperPosition
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingBlock: 10,
          width: 600,
          maxWidth: 'calc(100vw - 112px)',
        }}
      >
        {isLoading && <CircularProgress sx={{ alignSelf: 'center', position: 'absolute' }} />}
        <div style={{ visibility: isLoading ? 'hidden' : 'visible' }}>
          <StyledFieldItem>
            <UniversalInput
              label={t('settings.additionalEarning.name')}
              required
              inputProps={{ maxLength: 150 }}
              placeholder={t('settings.additionalEarning.placeholder.name')}
              errorText={errors.name?.message}
              {...register('name', {
                required: t('settings.additionalEarning.validation.name'),
              })}
            />
          </StyledFieldItem>
          {editModalState?.id && (
            <StyledFieldItem>
              <Controller
                name={'additional_earning_status'}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Checkbox
                    checked={value === AdditionalEarningStatus.ACTIVE}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      onChange(
                        event.target.checked
                          ? AdditionalEarningStatus.ACTIVE
                          : AdditionalEarningStatus.INACTIVE
                      )
                    }
                    label={t('enums.active')}
                  />
                )}
              />
            </StyledFieldItem>
          )}
        </div>
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
