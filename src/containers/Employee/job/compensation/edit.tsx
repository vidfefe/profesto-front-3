
import React, { useEffect, Fragment, SyntheticEvent, useState } from "react";
import styled from "styled-components";
import { sortBy } from 'lodash';
import { useForm, Controller } from 'react-hook-form';
import DialogModal from "components/Modal/Dialog";
import { isEmpty } from "lodash";
import EmpEditHeader from "../../editHeader";
import SelectDropdown from "components/Dropdowns/SelectDropdown";
import SelectWithAdd from "components/Dropdowns/SelectWithAdd";
import TextArea from "components/TextArea";
import InputWithSelect from "components/Dropdowns/InputWithSelect";
import {
  getPaymentPeriod,
  getPaymentTypes,
  getPaymentSchedule,
  createPaymentSchedule,
  getCompensationChangeReason,
  createCompensationChangeReason,
  getCurrencies,
} from 'services'
import { useToasts } from "react-toast-notifications";
import DatePicker from "components/DatePickers/DatePicker";
import { utcToZonedTime } from 'date-fns-tz';
import { useTranslation } from "react-i18next";
import { PaymentTypeCategory, PaymentTypeClass, PaymentType } from "types";
import Checkbox from "components/Checkbox";

type FormValues = {
  additional_payment_types: number[];
  effective_date: Date;
  pay_amount: {
    inputValue: string | null;
    selectValue: string | null;
  };
  payment_period: string | null;
  payment_type: PaymentType;
  payment_schedule: string | null;
  compensation_change_reason: string | null;
  comment: string;
};

const CompensationInformationEdit = (props: any) => {
  const {
    handleSubmit,
    getValues,
    setValue,
    setError,
    control, 
    formState: { errors },
    watch
  } = useForm<FormValues>({
    defaultValues: {
      additional_payment_types: [],
      effective_date: new Date(),
      pay_amount: { inputValue: '', selectValue: '' },
      payment_period: '',
      payment_type: undefined,
      payment_schedule: null,
      compensation_change_reason: null,
      comment: ''
    }
  });  

  const {
    user,
    jobData,
    currencies,
    chosenItem,
    updateMode,
    isTermination,
    loadingRequest,
    disabled = false,
  } = props;
  const { t } = useTranslation();
  const [overtimePaymentTypes, setOvertimePaymentTypes] = useState<PaymentType[]>([]);
  const { addToast } = useToasts();

  const onSubmit = (data: any) => {
    props.onSubmit(data);
  };

  const paymentType = watch('payment_type');
  const payAmount = watch('pay_amount');

  useEffect(() => {
    getPaymentTypes(25, 1, false, PaymentTypeCategory.ADDITIONAL).then(res =>
      setOvertimePaymentTypes(sortBy(res.data.list, ['id']))
    );
  }, []);

  useEffect(() => {
    if (paymentType) {
      getPaymentPeriod(25, 1, false, paymentType.class.id).then((res) => setValue('payment_period', res.data.list[0]));
      if (!payAmount.selectValue) {
        setValue('pay_amount', { inputValue: payAmount.inputValue, selectValue: currencies?.[0] || null });
      }
      if (![PaymentTypeClass.HOURLY, PaymentTypeClass.SALARY].includes(paymentType.class.id)) {
        setValue('pay_amount', { inputValue: null, selectValue: null });
        setValue('payment_period', null);
        setValue('additional_payment_types', []);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentType?.class.id]);

  useEffect(() => {
    if (isTermination && updateMode) {
      setValue('effective_date', new Date());
    } else {
      if (chosenItem) {
        setValue('effective_date', updateMode ? new Date() : utcToZonedTime(new Date(chosenItem?.effective_date), 'UTC'));
        setValue('additional_payment_types', chosenItem?.additional_payment_types
          ? chosenItem.additional_payment_types.map((item: PaymentType) => item.id)
          : []
        );
        setValue('pay_amount', { inputValue: (+chosenItem?.pay_amount).toFixed(2), selectValue: chosenItem?.currency });
        setValue('payment_period', chosenItem?.payment_period ?? null);
        setValue('payment_type', chosenItem?.payment_type ?? null)
        setValue('payment_schedule', chosenItem?.payment_schedule ?? null)
        setValue('compensation_change_reason', updateMode ? null : chosenItem?.compensation_change_reason || null)
        setValue('comment', updateMode ? '' : chosenItem?.comment);
      }
    }
  }, [user, chosenItem, isTermination]);

  useEffect(() => {
    if (currencies && ((!chosenItem?.currency || isTermination) && updateMode)) {
      setValue('pay_amount', {
        inputValue: ((!chosenItem?.currency || isTermination) && updateMode) ? "" : chosenItem?.pay_amount,
        selectValue: currencies[0]
      });
    }
  }, [currencies]);

  useEffect(() => {
    if (props.formErrors) {
      props.formErrors.forEach((item: any) => {
        if (item.field && item.field !== 'base') {
          setError(item.field, { type: 'string', message: item.message })
        } else {
          addToast(item.message, {
            appearance: 'error',
            autoDismiss: true,
          });
        }
      })
    }
  }, [props.formErrors]);

  const onError = (err: any) => {
    if (err) {
      addToast(<ToastContentContainer dangerouslySetInnerHTML={{ __html: t('globaly.fix_Highlighted')}}/>, {
        appearance: 'error',
        autoDismiss: true,
        placement: 'top-center'
      });
    }
  };

  return (
    <DialogModal
      open={props.isOpen}
      onClose={() => props.onModalClose()}
      title={updateMode ? t('leftMenuCard.update_compensation') : t('leftMenuCard.updateCompensation.edit_compensation')}
      hideActionButton={disabled ? true : false}
      withButtons
      cancelButtonText={t('globaly.cancel')}
      actionButtonText={t('globaly.save')}
      actionButton={handleSubmit(onSubmit, onError)}
      actionLoading={loadingRequest}
      fullWidth
      nominalHeader={
        <EmpEditHeader
          employeeName={`${user.first_name} ${user.last_name}`}
          avatarUuid={user.uuid}
          employeeId={user.id}
          jobData={jobData}
        />
      }
    >
      <Fragment>
        <Wrapper>
          <div className='body'>
            <div className='compensation-section'>
              <div className='input-item' style={{ width: 200 }}>
                <Controller
                  name="effective_date"
                  control={control}
                  rules={{ validate: (value: any) => value === null ? t('validations.valid_date') : value !== '' || t('validations.date_is_required') }}
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      required
                      selected={value}
                      onChange={onChange}
                      label={t('employee.job.effective_date')}
                      errorText={errors.effective_date ? errors.effective_date.message : ''}
                      disabled={disabled}
                    />
                  )}
                />
              </div>

              <div className='input-item'>
                <label>{t('employee.job.payment_type')}<sup>*</sup></label>
                <Controller
                  name="payment_type"
                  control={control}
                  rules={{
                    required: t('validations.is_required', {
                      attribute: t('employee.job.payment_type'),
                    }),
                  }}
                  render={({ field: { value, onChange } }) => (
                    <SelectDropdown
                      inputPlaceholder={t('createPerson.select_pay_type')}
                      value={value}
                      errorText={errors.payment_type?.message}
                      loadRemoteData={() => getPaymentTypes(25, 1)}
                      onChange={(_event: SyntheticEvent<Element, Event>, newValue: any) => {
                        onChange(newValue);
                      }}
                      disabled={disabled}
                    />
                  )}
                />
              </div>

              {(!paymentType || [PaymentTypeClass.HOURLY, PaymentTypeClass.SALARY].includes(paymentType.class.id)) &&
                <>
                  <div className='input-item'>
                    <label>{t('employee.job.payment_rate')}<sup>*</sup></label>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Controller
                          name="pay_amount"
                          control={control}
                          rules={{ validate: value =>
                            isEmpty(value.inputValue)
                              ? t('validations.pay_rate_required')
                              : isEmpty(value.selectValue)
                                ?  t('validations.is_required', {
                                    attribute: t('globaly.currency'),
                                  })
                                : undefined
                          }}
                          render={({ field: { onChange, value } }) => (
                            <InputWithSelect
                              errorText={errors.pay_amount?.message}
                              validateToDecimal
                              onChange={onChange}
                              value={value}
                              selectProps={{
                                loadRemoteData: () => getCurrencies(55, 1),
                                disabled: disabled
                              }}
                              inputProps={{
                                disabled: disabled
                              }}
                            />
                          )}
                        />
                      </div>

                      <div style={{ display: 'flex', marginLeft: 20 }}>
                        <span style={{ marginRight: 5, marginTop: 13 }}>{t('globaly.per')}<sup style={{ color: '#C54343' }}>*</sup></span>
                        <Controller
                          name="payment_period"
                          control={control}
                          rules={{
                            required: t('validations.pay_period_required')
                          }}
                          render={({ field: { onChange, value } }) => (
                            <SelectDropdown
                              inputPlaceholder={t('createPerson.select_period')}
                              fullWidth={false}
                              sx={{ width: 170 }}
                              size="small"
                              onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => onChange(newValue)}
                              errorText={errors.payment_period ? errors.payment_period.message : ''}
                              value={value}
                              loadRemoteData={() => getPaymentPeriod(25, 1, false, paymentType?.class.id)}
                              disabled={disabled}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className='input-item' style={{ padding: '8px 0 4px' }}>
                    <label>{t('employee.job.additional_payment_types')}</label>
                    <Controller
                      control={control}
                      name={'additional_payment_types'}
                      render={({ field: { value } }) => (
                        <CheckboxContainer>
                          {overtimePaymentTypes.map((paymentType) => (
                            <Checkbox
                              key={paymentType.id}
                              checked={value.includes(paymentType.id)}
                              onChange={(event) => {
                                const values = getValues('additional_payment_types');
                                if (event.target.checked) {
                                  setValue('additional_payment_types', [...values, paymentType.id]);
                                } else {
                                  const newValues = values.filter((item) => paymentType.id !== item);                        
                                  setValue('additional_payment_types', [...newValues]);
                                }
                              }}
                              label={paymentType.name}
                            />
                          ))}
                        </CheckboxContainer>
                      )}
                    />
                  </div>
                </>
              }

              <div className='input-item'>
                <label>{t('employee.job.payment_schedule')}</label>
                <Controller
                  name="payment_schedule"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <SelectWithAdd
                      name={t('employee.job.payment_schedule')}
                      inputPlaceholder={t('createPerson.select_pay_schedule')}
                      inputValue={value}
                      loadRemoteData={() => getPaymentSchedule(25, 1)}
                      createRequest={createPaymentSchedule}
                      onChange={onChange}
                      disabled={disabled}
                    />
                  )}
                />
              </div>

              <div className='input-item'>
                <label>{t('employee.job.reason_of_change')}</label>
                <Controller
                  name="compensation_change_reason"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <SelectWithAdd
                      name={t('employee.job.reason_of_change')}
                      inputPlaceholder={t('components.select.placeholder', { field: t('employee.job.reason_of_change') })}
                      inputValue={value}
                      loadRemoteData={() => getCompensationChangeReason(25, 1)}
                      createRequest={createCompensationChangeReason}
                      onChange={onChange}
                      disabled={disabled}
                    />
                  )}
                />
              </div>

              <div className='input-item' style={{ marginTop: -5, marginBottom: 0 }}>
                <Controller
                  name="comment"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <TextArea
                      onChange={(event: any) => { onChange(event.target.value) }}
                      label={t('globaly.comment')}
                      defaultValue={value}
                      maxRows={5}
                      disabled={disabled}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </Wrapper>
      </Fragment>
    </DialogModal >
  );
};

export default CompensationInformationEdit;

const ToastContentContainer = styled.div`
    & > b {
      font-family: 'Aspira Demi', 'FiraGO Regular';
    }
`;

const Wrapper = styled.div`
.body{
  .input-item{
    max-width: 416px;
    margin-bottom: 16px;
    label {
        display: block;
        margin-bottom: 5px;
        & > sup {
          color: #C54343;
        }
    }
  }
}
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
`;
