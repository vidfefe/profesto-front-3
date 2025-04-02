import { useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import { FormControlLabel, RadioGroup } from '@mui/material';
import { NumericFormat } from 'react-number-format';
import { useToasts } from 'react-toast-notifications';

import DialogModal from 'components/Modal/Dialog';
import RadioButton from 'components/RadioButton';
import DatePicker from 'components/DatePickers/DatePicker';
import UniversalInput from 'components/Input/UniversalInput';
import useMutationCustom from 'hooks/useMutationCustom';
import { Time, TimesheetBulkInput } from 'types';
import { ToastContentContainer } from 'containers/Onboarding';

export type ModalProps = {
  employees: Time[];
  onCloseModal: () => void;
  modalType: 'add' | 'delete';
  date: string | Date;
  refreshData: () => void;
};

type Config = {
  method: 'put' | 'delete';
  modalTitle: string;
  submitButton: string;
  radioButtonFirst: string;
  radioButtonSecond: string;
  toastResult: string;
  dates_range: string;
};

type TypeDiff = {
  add: Config;
  delete: Config;
};

type FormValues = {
  type: 'period' | 'dates' | 'standard' | 'custom';
  start_date: Date | undefined;
  end_date: Date | undefined;
  dates: Date[];
  work_hours: number | undefined;
};

export const Modal = ({ employees, onCloseModal, modalType, refreshData, date }: ModalProps) => {
  const isEditModal = modalType === 'add';
  const maxDates = useMemo(
    () => ({
      start: new Date(new Date(date).getFullYear(), new Date(date).getMonth(), 1),
      end: new Date(new Date(date).getFullYear(), new Date(date).getMonth() + 1, 0),
    }),
    [date]
  );

  const defaultValues = useMemo(() => {
    const result: FormValues = {
      type: isEditModal ? 'standard' : 'period',
      start_date: undefined,
      end_date: undefined,
      dates: [],
      work_hours: undefined,
    };
    return result;
  }, [isEditModal]);

  const {
    handleSubmit,
    setError,
    setValue,
    getValues,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues,
  });

  const { t } = useTranslation();
  const { addToast } = useToasts();

  const findIndexDate = useCallback(
    (dates: Date[], date: Date) => dates.findIndex((item) => item.getTime() === date.getTime()),
    []
  );

  const getDatesInRange = useCallback((start: Date, end: Date) => {
    const range = [];
    let date = new Date(start.toString());
    while (date <= end) {
      range.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return range;
  }, []);

  const filterActiveDays = useCallback((dates: Date[], employee: Time) => {
    return dates.filter((date) =>
      employee.timesheet.find((day) => {
        const isSameDate = new Date(day.day).toDateString() === new Date(date).toDateString();
        return isSameDate && day.active && !day.time_off;
      })
    );
  }, []);

  const typeDiff: TypeDiff = useMemo(
    () => ({
      add: {
        method: 'put',
        modalTitle: t('timesheet.modal.add.enter_hours'),
        submitButton: t('timesheet.modal.add.enter_hours'),
        radioButtonFirst: t('timesheet.modal.add.standard_work'),
        radioButtonSecond: t('timesheet.modal.add.specific_days'),
        toastResult: t('timesheet.modal.add.success'),
        dates_range: t('timesheet.modal.add.dates_range'),
      },
      delete: {
        method: 'delete',
        modalTitle: t('timesheet.modal.delete.delete_hours'),
        submitButton: t('timesheet.modal.delete.delete_hours'),
        radioButtonFirst: t('timesheet.modal.delete.delete_by_range'),
        radioButtonSecond: t('timesheet.modal.delete.specific_days'),
        toastResult: t('timesheet.modal.delete.success'),
        dates_range: t('timesheet.modal.delete.dates_range'),
      },
    }),
    [t]
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

  const currentType = watch('type');
  const endDate = watch('end_date');

  const showDateRange = ['period', 'standard'].includes(currentType);

  useEffect(() => {
    reset({
      ...defaultValues,
      type: currentType,
    });
  }, [currentType]);

  const timesheetBulk = useMutationCustom<
    {},
    { errors: [{ field: string; message: string }] },
    TimesheetBulkInput
  >(
    ['timesheet_bulk'],
    {
      endpoint: '/timesheet/bulk_times',
      options: { method: typeDiff[modalType].method },
    },
    {
      onSuccess: () => {
        onCloseModal();
        addToast(`${typeDiff[modalType].toastResult}`, {
          appearance: 'success',
          autoDismiss: true,
        });
        refreshData();
      },
      onError: (err: any) => {
        if (err.status === 403) {
          onCloseModal();
          addToast(t('timesheet.permission_error'), {
            appearance: 'error',
            autoDismiss: true,
          });
          refreshData();
        }
        else if (err?.errors[0].field) {
          err.errors.forEach((item: any) => {
            setError(item.field, { type: 'custom', message: item.message });
          });
        }
      },
    }
  );

  const onSubmit = useCallback(
    (data: FormValues) => {
      const dates = !data.dates.length
        ? getDatesInRange(data.start_date!, data.end_date!)
        : data.dates;
      const formatData: TimesheetBulkInput = {
        ...data,
        dates: data.dates.length ? data.dates : undefined,
        employees: employees.map((employee) => {
          const resDates = filterActiveDays(dates, employee);
          return {
            employee_id: employee.employee.id,
            dates: resDates,
          };
        }),
        work_hours: currentType === 'standard' ? 8 : data.work_hours,
      };
      timesheetBulk.mutate(formatData);
    },
    [currentType, employees, filterActiveDays, getDatesInRange, timesheetBulk]
  );

  return (
    <DialogModal
      open={true}
      title={typeDiff[modalType].modalTitle}
      onClose={onCloseModal}
      actionButton={handleSubmit(onSubmit, onError)}
      cancelButtonText={t('globaly.lowercase_cancel')}
      actionButtonText={typeDiff[modalType].submitButton}
      actionLoading={timesheetBulk.isLoading}
      withButtons
      maxWidth={'md'}
    >
      <ModalContentContainer>
        <RadioGroupContainer>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <RadioGroup
                {...field}
                onChange={(_, value) => {
                  field.onChange(value);
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <FormControlLabel
                    value={isEditModal ? 'standard' : 'period'}
                    control={<RadioButton />}
                    label={typeDiff[modalType].radioButtonFirst}
                  />
                  <FormControlLabel
                    value={isEditModal ? 'custom' : 'dates'}
                    control={<RadioButton />}
                    label={typeDiff[modalType].radioButtonSecond}
                  />
                </div>
              </RadioGroup>
            )}
          />
        </RadioGroupContainer>
        <StyledDatePickerContainer>
          <>
            <StyledFieldItem hidden={!showDateRange} style={{ flex: 1 }}>
              <label>
                {typeDiff[modalType].dates_range}
                <sup>*</sup>
              </label>
              <Controller
                name={'start_date'}
                control={control}
                rules={{
                  required: showDateRange
                    ? t('validations.is_required', {
                        attribute: typeDiff[modalType].dates_range,
                      })
                    : undefined,
                  validate: (value) =>
                    value && endDate && value.getTime() > endDate.getTime()
                      ? t('timesheet.modal.must_be_earlier')
                      : undefined,
                }}
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    renderCustomHeader={() => <></>}
                    errorText={errors.start_date ? errors.start_date.message : ''}
                    selected={value}
                    onChange={onChange}
                    todayButton={false}
                    maxDate={maxDates.end}
                    minDate={maxDates.start}
                  />
                )}
              />
            </StyledFieldItem>
            <StyledFieldItem hidden={!showDateRange} style={{ flex: 1 }}>
              <label>&nbsp;</label>
              <Controller
                name={'end_date'}
                control={control}
                rules={{
                  required: showDateRange
                    ? t('validations.is_required', {
                        attribute: typeDiff[modalType].dates_range,
                      })
                    : undefined,
                }}
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    renderCustomHeader={() => <></>}
                    errorText={errors.end_date ? errors.end_date.message : ''}
                    selected={value}
                    onChange={onChange}
                    todayButton={false}
                    maxDate={maxDates.end}
                    minDate={maxDates.start}
                  />
                )}
              />
            </StyledFieldItem>
            <StyledFieldItem hidden={showDateRange} style={{ flex: 1, maxWidth: 323 }}>
              <label>
                {typeDiff[modalType].dates_range}
                <sup>*</sup>
              </label>
              <Controller
                name={'dates'}
                control={control}
                rules={{
                  required: !showDateRange ? t('timesheet.modal.must_be_selected') : undefined,
                }}
                render={() => (
                  <DatePicker
                    size="small"
                    todayButton={null}
                    renderCustomHeader={() => <></>}
                    shouldCloseOnSelect={false}
                    disabledKeyboardNavigation
                    inline
                    errorText={errors.dates ? errors.dates.message : ''}
                    selected={null}
                    renderDayContents={(day, date) => {
                      if (findIndexDate(getValues('dates'), new Date(date!)) >= 0) {
                        return <SelectedDate>{day}</SelectedDate>;
                      }
                      return day;
                    }}
                    onChange={(newValue) => {
                      if (!newValue) return;
                      setError('dates', {});
                      const array = [...getValues('dates')];
                      const date = new Date(newValue);
                      const index = findIndexDate(array, date);
                      if (index >= 0) {
                        array.splice(index, 1);
                      } else {
                        array.push(date);
                      }
                      setValue('dates', array);
                    }}
                    maxDate={maxDates.end}
                    minDate={maxDates.start}
                  />
                )}
              />
            </StyledFieldItem>
            <StyledFieldItem hidden={showDateRange || !isEditModal} style={{ flex: 1 }}>
              <label>
                {t('timesheet.modal.add.number_of_hours')}
                <sup>*</sup>
              </label>
              <Controller
                name={'work_hours'}
                control={control}
                rules={{
                  required: !(showDateRange || !isEditModal)
                    ? t('validations.is_required', {
                        attribute: t('timesheet.modal.add.number_of_hours'),
                      })
                    : undefined,
                }}
                render={({ field: { onChange, value } }) => (
                  <NumericFormat
                    onValueChange={(value) => onChange(value.value)}
                    value={value}
                    isAllowed={(values) => {
                      const { floatValue } = values;
                      if (!floatValue) return true;
                      return floatValue > 0 && floatValue <= 24;
                    }}
                    customInput={UniversalInput}
                    decimalSeparator="."
                    decimalScale={2}
                    valueIsNumericString
                    errorText={errors.work_hours ? errors.work_hours.message : ''}
                    allowNegative={false}
                  />
                )}
              />
            </StyledFieldItem>
          </>
        </StyledDatePickerContainer>
      </ModalContentContainer>
    </DialogModal>
  );
};

const SelectedDate = styled.div`
  height: 35px;
  width: 35px;
  background: var(--green);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--black);
  }
`;

const RadioGroupContainer = styled(RadioGroup)`
  align-self: start;
`;

const ModalContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 600px;
  max-width: calc(100vw - 112px);
`;

const StyledDatePickerContainer = styled.div`
  width: 100%;
  margin-top: 40px;
  display: flex;
  justify-content: space-between;
  height: 300px;
  gap: 10px;
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
