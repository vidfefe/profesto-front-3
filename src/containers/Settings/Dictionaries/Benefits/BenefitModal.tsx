import React, { useState, useEffect, useCallback } from 'react';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from 'react-i18next';
import { useToasts } from 'react-toast-notifications';
import { NumericFormat } from 'react-number-format';
import utcToZonedTime from 'date-fns-tz/utcToZonedTime';
import styled from 'styled-components';

import {
  createBenefitType,
  getBenefit,
  getBenefitTypeList,
  getCurrencies,
  getCurrency,
  getEnum,
} from 'services';
import DialogModal from 'components/Modal/Dialog';
import UniversalInput from 'components/Input/UniversalInput';
import SelectDropdown from 'components/Dropdowns/SelectDropdown';
import useMutationCustom from 'hooks/useMutationCustom';
import DatePicker from 'components/DatePickers/DatePicker';
import { EditModalState } from '../Dictionary';
import SelectWithAdd from 'components/Dropdowns/SelectWithAdd';
import EnumDropdown from 'components/Dropdowns/EnumDropdown';
import { Benefit, BenefitMutationInput, BenefitType, CoverageType, Currency } from 'types';

type FormValues = {
  name: string;
  benefit_type: BenefitType | null;
  coverage_type: string;
  currency: Currency | null;
  total_cost: string;
  employee_pays: string;
  company_pays: string;
  start_on: Date | null;
  end_on: Date | null;
};

interface BenefitModalProps {
  afterSubmit?: (value: Benefit) => void;
  isOpen: boolean;
  editModalState: EditModalState;
  onCloseModal: () => void;
  singularTitle: string;
  endpoint: string;
  refreshData: () => void;
}

type NumericFields = Array<keyof Pick<FormValues, 'total_cost' | 'employee_pays' | 'company_pays'>>;

const numericFields: NumericFields = ['total_cost', 'employee_pays', 'company_pays'];

export const BenefitModal = ({
  afterSubmit,
  isOpen,
  editModalState,
  onCloseModal,
  singularTitle,
  endpoint,
  refreshData,
}: BenefitModalProps) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();
  const [isLoading, setIsLoading] = useState(false);

  const [coverageTypes, setCoverageTypes] = useState<CoverageType[]>([]);

  useEffect(() => {
    if (isOpen || editModalState) {
      getEnum('Enum::CoverageType').then((res) => setCoverageTypes(res.data));
    }
  }, [isOpen, editModalState]);

  const {
    register,
    reset,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      benefit_type: null,
      coverage_type: '',
      currency: null,
      total_cost: '',
      employee_pays: '',
      company_pays: '',
      start_on: null,
      end_on: null,
    },
  });

  const totalCost = watch('total_cost');
  const employeePays = watch('employee_pays');

  useEffect(() => {
    const companyPays = Number(totalCost) - Number(employeePays);
    setValue('company_pays', `${Math.abs(companyPays).toFixed(2)}`);
  }, [employeePays, setValue, totalCost]);

  useEffect(() => {
    if (editModalState) {
      setIsLoading(true);
      getBenefit(editModalState.id)
        .then((res: { data: Benefit }) => {
          const { data } = res;
          setValue('name', data.name);
          setValue('benefit_type', data.benefit_type);
          setValue('coverage_type', data.coverage_type.id);
          setValue('currency', data.currency);
          setValue('total_cost', Number(data.total_cost).toFixed(2));
          setValue('employee_pays', Number(data.employee_pays).toFixed(2));
          setValue('company_pays', data.company_pays);
          setValue('start_on', utcToZonedTime(new Date(data.start_on), 'UTC'));
          setValue('end_on', data.end_on ? utcToZonedTime(new Date(data.end_on), 'UTC') : null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [endpoint, editModalState, setValue]);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getCurrency(1)
        .then((res: { data: Currency }) => {
          const { data } = res;
          setValue('currency', data);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  const createBenefit = useMutationCustom<
    {},
    { errors: [{ field: string; message: string }] },
    BenefitMutationInput
  >(
    ['create_benefit'],
    {
      endpoint: endpoint,
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

  const updateBenefit = useMutationCustom<
    {},
    { errors: [{ field: string; message: string }] },
    BenefitMutationInput
  >(
    ['update_benefit'],
    {
      endpoint: endpoint + `/${editModalState?.id}`,
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
      const fromData: BenefitMutationInput = {
        name: data.name,
        benefit_type_id: data.benefit_type!.id,
        coverage_type: data.coverage_type,
        currency_id: data.currency!.id,
        total_cost: data.total_cost,
        employee_pays: data.employee_pays,
        start_on: data.start_on!,
        end_on: data.end_on,
      };
      editModalState ? updateBenefit.mutate(fromData) : createBenefit.mutate(fromData);
    },
    [createBenefit, editModalState, updateBenefit]
  );

  return (
    <DialogModal
      open={isOpen || !!editModalState}
      title={(isOpen ? t('dictionaries.add') : t('dictionaries.edit')) + ' ' + singularTitle}
      onClose={() => {
        onCloseModal();
        reset();
      }}
      actionButton={handleSubmit(onSubmit, onError)}
      withButtons
      cancelButtonText={t('globaly.cancel')}
      actionButtonText={t('globaly.save')}
      actionLoading={updateBenefit.isLoading || createBenefit.isLoading}
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
                label={t('settings.benefit.name')}
                required
                inputProps={{ maxLength: 150 }}
                placeholder={t('dictionaries.placeholder', {
                  title: t('settings.benefit.name'),
                })}
                errorText={errors.name ? errors.name.message : ''}
                {...register('name', {
                  required: t('validations.is_required', {
                    attribute: t('settings.benefit.name'),
                  }),
                })}
              />
            </StyledFieldItem>
            <StyledFieldItem>
              <label>
                {t('settings.benefit.type')}
                <sup>*</sup>
              </label>
              <Controller
                name={'benefit_type'}
                control={control}
                rules={{
                  required: t('validations.is_required', {
                    attribute: t('settings.benefit.type'),
                  }),
                }}
                render={({ field: { value, onChange } }) => (
                  <SelectWithAdd
                    name={t('settings.benefit.type')}
                    inputPlaceholder={t('components.select.placeholder', {
                      field: t('settings.benefit.type'),
                    })}
                    inputValue={value}
                    loadRemoteData={() => getBenefitTypeList(100, 1)}
                    createRequest={createBenefitType}
                    errorText={errors.benefit_type ? errors.benefit_type.message : ''}
                    onChange={onChange}
                  />
                )}
              />
            </StyledFieldItem>
            <FlexContainer>
              <StyledFieldItem style={{ flex: '2 1 1.7%' }}>
                <label>
                  {t('settings.benefit.coverage_type')}
                  <sup>*</sup>
                </label>
                <Controller
                  name={'coverage_type'}
                  control={control}
                  rules={{
                    required: t('validations.is_required', {
                      attribute: t('settings.benefit.coverage_type'),
                    }),
                  }}
                  render={({ field: { onChange, value } }) => (
                    <EnumDropdown
                      placeholder={t('components.select.placeholder', {
                        field: t('settings.benefit.coverage_type'),
                      })}
                      onChange={onChange}
                      errorText={errors.coverage_type ? errors.coverage_type.message : ''}
                      value={value}
                      options={coverageTypes}
                    />
                  )}
                />
              </StyledFieldItem>
              <StyledFieldItem style={{ flex: 1 }}>
                <label>
                  {t('globaly.currency')}
                  <sup>*</sup>
                </label>
                <Controller
                  name={'currency'}
                  control={control}
                  rules={{
                    required: t('validations.is_required', {
                      attribute: t('globaly.currency'),
                    }),
                  }}
                  render={({ field: { onChange, value } }) => (
                    <SelectDropdown
                      onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
                        onChange(newValue);
                      }}
                      value={value}
                      optionLabelField={'code'}
                      inputPlaceholder={t('components.select.placeholder', {
                        field: t('globaly.currency'),
                      })}
                      loadRemoteData={() => getCurrencies(300, 1)}
                      errorText={errors.currency ? errors.currency.message : ''}
                    />
                  )}
                />
              </StyledFieldItem>
            </FlexContainer>
            <FlexContainer>
              {numericFields.map((field) => {
                const disabled = field === 'company_pays';
                const required = ['total_cost', 'employee_pays'].includes(field);
                return (
                  <StyledFieldItem key={field} style={{ flex: 1 }}>
                    <Controller
                      control={control}
                      rules={{
                        required: required
                          ? t('validations.is_required', {
                              attribute: t(`settings.benefit.${field}`),
                            })
                          : undefined,
                        validate: (value) =>
                          !Number(value) && field === 'total_cost'
                            ? t('validations.is_required', {
                                attribute: t(`settings.benefit.${field}`),
                              })
                            : undefined,
                      }}
                      name={field}
                      render={({ field: { onChange, value, ref } }) => (
                        <NumericFormat
                          disabled={disabled}
                          label={t(`settings.benefit.${field}`)}
                          required={required}
                          onValueChange={(values) => onChange(values.value)}
                          value={value}
                          inputRef={ref}
                          customInput={UniversalInput}
                          decimalSeparator="."
                          decimalScale={2}
                          valueIsNumericString
                          errorText={errors[field] ? errors[field]!.message : ''}
                          allowNegative={false}
                          style={
                            disabled
                              ? {
                                  pointerEvents: 'none',
                                  background: 'var(--gray)',
                                }
                              : undefined
                          }
                        />
                      )}
                    />
                  </StyledFieldItem>
                );
              })}
            </FlexContainer>
            <SubTitle>{t('settings.benefit.benefit_effective_period')}</SubTitle>
            <FlexContainer>
              <StyledFieldItem style={{ flex: 1 }}>
                <Controller
                  name={'start_on'}
                  control={control}
                  rules={{
                    required: t('validations.is_required', {
                      attribute: t('settings.benefit.benefit_starts'),
                    }),
                  }}
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      label={t('settings.benefit.benefit_starts')}
                      required
                      selected={value}
                      onChange={onChange}
                      errorText={errors.start_on ? errors.start_on.message : ''}
                    />
                  )}
                />
              </StyledFieldItem>
              <StyledFieldItem style={{ flex: 1 }}>
                <Controller
                  name={'end_on'}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      label={t('settings.benefit.benefit_ends')}
                      selected={value}
                      onChange={onChange}
                      errorText={errors.end_on ? errors.end_on.message : ''}
                    />
                  )}
                />
              </StyledFieldItem>
            </FlexContainer>
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

const FlexContainer = styled.div`
  display: flex;
  @media (max-width: 500px) {
    flex-direction: column;
  }
`;

const SubTitle = styled.div`
  font-weight: bold;
  font-size: 16px;
  margin: 24px 0 8px;
`;

const ToastContentContainer = styled.div`
  & > b {
    font-family: 'Aspira Demi', 'FiraGO Regular';
  }
`;
