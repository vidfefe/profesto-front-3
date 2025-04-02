import React, {useState, Fragment, useEffect} from "react";
import DialogModal from 'components/Modal/Dialog';
import { Controller, useForm } from 'react-hook-form';
import CircularProgress from '@mui/material/CircularProgress';
import useQueryCustom from 'hooks/useQueryCustom';
import useMutationCustom from 'hooks/useMutationCustom';
import { useTranslation } from "react-i18next";
import UniversalInput from "components/Input/UniversalInput";
import styled from "styled-components";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import RadioButton from "components/RadioButton";
import DatePicker from "components/DatePickers/DatePicker";
import { NumericFormat } from 'react-number-format';
import EnumDropdown from "components/Dropdowns/EnumDropdown";
import { getEnum, getTimeOfftypeOptions } from "services";
import { useToasts } from 'react-toast-notifications';
import { isEmpty } from "lodash";
import { utcToZonedTime } from 'date-fns-tz';
import { formatNumber } from "utils/common";
import Checkbox from "components/Checkbox";
import { ReactComponent as WarningMark } from 'assets/svg/warning-mark_circles.svg';

const TimeOfftypesModal = ({isOpen, isEditMode, timeOfftypeId, onCloseModal, singularTitle, endpoint, refreshData}: any) => {
    const { register, reset, handleSubmit, setError, setValue, control, watch, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            accrual_effective_date: '',
            open_date: false,
            days_counting_method: '',
            unpaid: false,
            abbreviation: '',
            time_off_type: 'account_without_balance',
            number_of_days: '',
            accrual_frequency: null,
            accrual_time: null,
            balance_reset_rule: null
        }
    });
    const { t } = useTranslation();
    const { addToast } = useToasts();
    const [isLoading, setIsLoadig] = useState<boolean>(false);
    const [checkError, setCheckError] = useState<string | undefined>(undefined);
    const [accrualFrequency, setAccrualFrequency] = useState<any>([]);
    const [accrualTime, setAccrualTime] = useState<any>([]);
    const [balanceResetRule, setBalanceResetRule] = useState<any>([]);
    const [daysCountingMethod, setDaysCountingMethod] = useState<any>([]);
    const watchTimeOffType = watch('time_off_type');

    useEffect(() => {
        if (isOpen || isEditMode) {
            getEnum('Enum::AccrualFrequency').then(res => setAccrualFrequency(res.data));
            getEnum('Enum::AccrualTime').then(res => setAccrualTime(res.data));
            getEnum('Enum::BalanceResetRule').then(res => setBalanceResetRule(res.data));
            getEnum('Enum::DaysCountingMethod').then(res => setDaysCountingMethod(res.data));
        }
    }, [isOpen, isEditMode]);

    useEffect(() => {
        if (!isEmpty(isEditMode)) {
            fetchData();
        }
        
    }, [isEditMode]);


    ////watchTimeOffType
    useEffect(() => {
        if (watchTimeOffType === 'account_without_balance') {
            setValue('accrual_effective_date', '');
            setValue('number_of_days', '');
            setValue('accrual_frequency', null);
            setValue('accrual_time', null);
            setValue('balance_reset_rule', null);
        }
    }, [watchTimeOffType])

    ////get data
    const fetchData = () => {
        setIsLoadig(true);
        getTimeOfftypeOptions(endpoint, timeOfftypeId).then((res: any) => {
            const { data } = res;
            const { time_off_rule } = data;
            setIsLoadig(false);
            setValue('name', data.name);
            setValue('days_counting_method', data?.days_counting_method?.id);
            setValue('abbreviation', data?.abbreviation);
            setValue('unpaid', data?.unpaid)
            setValue('open_date', data?.open_date)
            if (!isEmpty(time_off_rule)) {
                setValue('time_off_type', data.has_time_off_rule ? 'use_balance' : 'account_without_balance');
                setValue('accrual_effective_date', time_off_rule?.accrual_effective_date && utcToZonedTime(new Date(time_off_rule.accrual_effective_date), 'UTC'));
                setValue('number_of_days', time_off_rule?.number_of_days);
                setValue('accrual_frequency', time_off_rule?.accrual_frequency?.id);
                setValue('accrual_time', time_off_rule?.accrual_time?.id);
                setValue('balance_reset_rule', time_off_rule?.balance_reset_rule?.id);
            }
            
        }).catch((err) => {
            setIsLoadig(false);
        });
    }

    ////save
    const createTimeOffTypeOptions = useMutationCustom<{}, { errors: [{ field: string, message: string, }] }, any>(
        ["create_time_off_type"], {
        endpoint: endpoint,
        options: { method: "post" },
    }, {
        onSuccess: () => {
            onCloseModal();
            addToast(`${t('globaly.add_success', {title: singularTitle})}`, { appearance: 'success', autoDismiss: true });
            reset();
            refreshData();
        },
        onError: (err) => {
            if (err?.errors[0].field) {
                err.errors.forEach((item: any) => {
                    setError(item.field, { type: 'custom', message: item.message });
                });
            };
        }
    });

    ////update
    const updateTimeOffTypeOptions = useMutationCustom<{}, { errors: [{ field: string, message: string, }] }, any>(
        ["update_time_off_type"], {
        endpoint: endpoint + `/${timeOfftypeId}`,
        options: { method: "put" },
    }, {
        onSuccess: () => {
            onCloseModal();
            addToast(`${t('globaly.update_success', {title: singularTitle})}`, { appearance: 'success', autoDismiss: true });
            reset();
            refreshData();
        },
        onError: (err) => {
            if (err?.errors[0].field) {
                err.errors.forEach((item: any) => {
                    setError(item.field, { type: 'custom', message: item.message });
                });
            };
        }
    });

    const onUpdateTimeOffTypes = (data: any) => {
        const attributes = watchTimeOffType === 'use_balance' ? {
            accrual_effective_date: data.accrual_effective_date,
            accrual_frequency: data.accrual_frequency,
            number_of_days: data.number_of_days,
            accrual_time: data.accrual_time,
            balance_reset_rule: data.balance_reset_rule
        } : null;
        const formData: any = {
            name: data.name,
            open_date: data.open_date,
            has_time_off_rule: watchTimeOffType === 'use_balance' ? true : false,
            days_counting_method: data.days_counting_method,
            unpaid: data.unpaid,
            abbreviation: data.abbreviation,
            time_off_rule_attributes: attributes
        }
        updateTimeOffTypeOptions.mutate(formData);
    }

    const onAddNewTimeOffTypes = (data: any) => {
        const attributes = watchTimeOffType === 'use_balance' ? {
            accrual_effective_date: data.accrual_effective_date,
            accrual_frequency: data.accrual_frequency,
            number_of_days: data.number_of_days,
            accrual_time: data.accrual_time,
            balance_reset_rule: data.balance_reset_rule
        } : null;
        const formData: any = {
            name: data.name,
            open_date: data.open_date,
            days_counting_method: data.days_counting_method,
            unpaid: data.unpaid,
            abbreviation: data.abbreviation,
            time_off_rule_attributes: attributes
        }
        createTimeOffTypeOptions.mutate(formData);
    }

    const checkTypeChange = (data: any) => {
        if (isEditMode) {
            checkTimeOffType.mutate(data);
        } else {
            handleSubmit(onUpdateTimeOffTypes)();
        }
    }

    const checkTimeOffType = useMutationCustom<{}, { errors: [{ field: string, message: string, }] }, any>(
        ["check_time_off_type"], {
            endpoint: `time_off_type/check_changes/${timeOfftypeId}`,
            options: { method: "post" },
        }, {
            onSuccess: () => {
                handleSubmit(onUpdateTimeOffTypes)();
            },
            onError: (err) => {
                setCheckError(err?.errors[0].message);
            }
        }
    );

    return (
        <DialogModal
            open={isOpen || isEditMode}
            title={(isOpen ? t('dictionaries.add') : t('dictionaries.edit')) + ' ' + singularTitle}
            onClose={() => {
                onCloseModal();
                reset();
            }}
            actionButton={() => { isEditMode ? handleSubmit(checkTypeChange)() : handleSubmit(onAddNewTimeOffTypes)(); }}
            withButtons
            cancelButtonText={t('globaly.cancel')}
            actionButtonText={t('globaly.save')}
            actionLoading={updateTimeOffTypeOptions.isLoading || createTimeOffTypeOptions.isLoading}
            maxWidth={'md'}
        >
            <div style={{ display: 'flex', flexDirection: 'column', paddingBlock: 10, width: 600 }}>
                {isLoading ? <CircularProgress sx={{ alignSelf: 'center' }} /> : <Fragment>
                    <StyledFieldItem>
                        <label>{singularTitle}<sup>*</sup> {checkError}</label>
                        <UniversalInput
                            inputProps={{ maxLength: 250 }}
                            placeholder={t('dictionaries.placeholder', { title: singularTitle })}
                            errorText={errors.name ? errors.name.message : ''}
                            {...register('name', { required: t('validations.is_required', {attribute: singularTitle}), maxLength: 250 })}
                        />
                    </StyledFieldItem>
                    <Controller
                        name="open_date"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <div style={{ margin: '0 0 16px' }}>
                                <Checkbox
                                    checked={value}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.checked)}
                                    label={t('settings.timeOff.open_date')}
                                />
                            </div>
                        )}
                    />
                    <div style={{ display: 'flex' }}>
                        <div style={{ width: 285 }}>
                            <StyledFieldItem>
                                <label>{t('settings.timeOff.days_counting_method')}<sup>*</sup></label>
                                <Controller
                                    name="days_counting_method"
                                    control={control}
                                    rules={{
                                        required: t('validations.is_required', {attribute: t('settings.timeOff.days_counting_method')})
                                    }}
                                    render={({ field: { onChange, value } }) => (
                                        <EnumDropdown
                                            placeholder={t('globaly.select', {title: t('settings.timeOff.days_counting_method')})}
                                            onChange={onChange}
                                            errorText={errors.days_counting_method ? errors.days_counting_method.message : '' as any}
                                            value={value}
                                            options={daysCountingMethod}
                                        />
                                    )}
                                />
                            </StyledFieldItem>
                        </div>
                        <Controller
                            name="unpaid"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <div style={{ margin: '31px 0 0 5px' }}>
                                    <Checkbox
                                        checked={value}
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.checked)}
                                        label={t('settings.timeOff.unpaid')}
                                    />
                                </div>
                            )}
                        />
                    </div>
                    <Container>
                        <StyledFieldItem>
                            <label>{t('settings.timeOff.abbreviation_for_timesheet')}</label>
                            <UniversalInput
                                inputProps={{ maxLength: 10 }}
                                placeholder={t('dictionaries.placeholder', { title: t('settings.timeOff.abbreviation') })}
                                errorText={errors.abbreviation ? errors.abbreviation.message : ''}
                                {...register('abbreviation')}
                            />
                        </StyledFieldItem>
                    </Container>
                    <StyledFieldItem style={{marginBottom: 6}}>
                        <Controller
                            control={control}
                            name="time_off_type"
                            render={({ field }) => (
                                <RadioGroup {...field} onChange={(_, value) => { field.onChange(value); }}>
                                    <div style={{display: 'flex'}}>
                                    <StyledFormControlLabel
                                        value={'use_balance'}
                                        control={<RadioButton />}
                                        label={t('settings.timeOff.use_balance')}
                                    />
                                    <StyledFormControlLabel
                                        value={'account_without_balance'}
                                        control={<RadioButton />}
                                        label={t('settings.timeOff.account_without_balance')}
                                    />
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </StyledFieldItem>
                    {watchTimeOffType === 'use_balance' && <FormConatiner>
                            <FormTitle>{t('settings.timeOff.balance_accrual_rule')}</FormTitle>
                            <AddtionalFields>
                                <StyledFieldItem>
                                    <Controller
                                        name="accrual_effective_date"
                                        control={control}
                                        rules={{ validate: (value: any) => value === null ? t('validations.valid_date') : value !== '' || t('validations.is_required', { attribute: t('settings.timeOff.accrual_effective_date') } ) }}
                                        render={({ field: { onChange, value } }) => (
                                            <DatePicker
                                                required
                                                selected={value}
                                                onChange={onChange}
                                                label={t('settings.timeOff.accrual_effective_date')}
                                                errorText={errors.accrual_effective_date ? errors.accrual_effective_date.message : ''}
                                            />
                                        )}
                                    />
                                </StyledFieldItem>
                                <StyledFieldItem>
                                    <label>{t('settings.timeOff.accrual_frequency')}<sup>*</sup></label>
                                    <Controller
                                        name="accrual_frequency"
                                        control={control}
                                        rules={{
                                            required: t('validations.is_required', {attribute: t('settings.timeOff.accrual_frequency')})
                                        }}
                                        render={({ field: { onChange, value } }) => (
                                            <EnumDropdown
                                                placeholder={t('globaly.select', {title: t('settings.timeOff.accrual_frequency')})}
                                                onChange={onChange}
                                                errorText={errors.accrual_frequency ? errors.accrual_frequency.message : '' as any}
                                                value={value}
                                                options={accrualFrequency}
                                            />
                                        )}
                                    />
                                </StyledFieldItem>
                                <StyledFieldItem>
                                    <label>{t('settings.timeOff.number_of_days')}<sup>*</sup></label>
                                    <Controller
                                        control={control}
                                        name="number_of_days"
                                        rules={{
                                            required:  t('validations.is_required', {attribute: t('settings.timeOff.number_of_days')}),
                                            validate: (value: any) => {
                                                if (value && value <= 0) {
                                                  return t('settings.timeOff.number_of_days_length')
                                                } else {
                                                  return true
                                                }
                                            }
                                        }}
                                        render={({ field: { onChange, value, ref } }) => (
                                            <StyledNumberOfDaysInput
                                                onValueChange={(values) => onChange(values.value)}
                                                value={formatNumber(value)}
                                                decimalSeparator="."
                                                decimalScale={2}
                                                valueIsNumericString
                                                required
                                                style={{width: 267}}
                                                $inputError={!!errors.number_of_days}
                                            />
                                        )}
                                    />
                                    {
                                        errors?.number_of_days &&
                                        <span style={{ color: 'var(--red)', marginTop: 6, fontSize: 10, display: 'inline-block'}}>
                                           {errors?.number_of_days?.message}
                                        </span>
                                    }
                                </StyledFieldItem>
                                <StyledFieldItem>
                                    <label>{t('settings.timeOff.accrual_time')}<sup>*</sup></label>
                                    <Controller
                                        name="accrual_time"
                                        control={control}
                                        rules={{
                                            required: t('validations.is_required', {attribute: t('settings.timeOff.accrual_time')})
                                        }}
                                        render={({ field: { onChange, value } }) => (
                                            <EnumDropdown
                                                placeholder={t('globaly.select', {title: t('settings.timeOff.accrual_time')})}
                                                onChange={onChange}
                                                errorText={errors.accrual_time ? errors.accrual_time.message : '' as any}
                                                value={value}
                                                options={accrualTime}
                                            />
                                        )}
                                    />
                                </StyledFieldItem>
                                <StyledFieldItem>
                                    <label>{t('settings.timeOff.balance_reset_rule')}<sup>*</sup></label>
                                    <Controller
                                        name="balance_reset_rule"
                                        control={control}
                                        rules={{
                                            required: t('validations.is_required', {attribute: t('settings.timeOff.balance_reset_rule')})
                                        }}
                                        render={({ field: { onChange, value } }) => (
                                            <EnumDropdown
                                                placeholder={t('globaly.select', {title: t('settings.timeOff.balance_reset_rule')})}
                                                onChange={onChange}
                                                errorText={errors.balance_reset_rule ? errors.balance_reset_rule.message : '' as any}
                                                value={value}
                                                options={balanceResetRule}
                                            />
                                        )}
                                    />
                                </StyledFieldItem>
                            </AddtionalFields>
                    </FormConatiner>}
                </Fragment>}
            </div>

            {checkError && <DialogModal
                open={!!checkError}
                title={`${t('dictionaries.edit')} ${singularTitle}`}
                onClose={() => setCheckError(undefined)}
                actionButton={() => { setCheckError(undefined); handleSubmit(onUpdateTimeOffTypes)() }}
                withButtons
                cancelButtonText={t('globaly.cancel')}
                actionButtonText={t('globaly.save')}
                upperPosition
                fullWidth
              >
                  <ModalContentContainer>
                    <WarningMark />
                    <p>{t('timeOff.errors.time_off_change')}</p>
                    <p>{checkError}</p>
                  </ModalContentContainer>
            </DialogModal>}
        </DialogModal>
    )
}
const StyledNumberOfDaysInput = styled(NumericFormat) <{ $inputError?: boolean }>`
    width: 100%;
    border-radius: 4px;
    border: ${({ $inputError }) => $inputError ? '1px solid var(--red)' : '1px solid #D6D6D6'};
    padding: 11px 13px;

    &:focus {
      border-color:  ${({ $inputError }) => $inputError ? 'var(--red)' : '#99CC33'};
    }
`;
const StyledFieldItem = styled.div`
    margin-bottom: 16px;
    margin-right: 10px;
    & sup {
        color: #C54343;
    }
    & > label {
        display: inline-block;
        margin-bottom: 6px;
    }
`;
const StyledFormControlLabel = styled(FormControlLabel)`
    align-items: flex-start;
    white-space: pre-wrap;
    .MuiFormControlLabel-label { 
        margin-top: 10px 
    }
`;
const FormConatiner = styled.div `
    border-top: 1px solid #f2f2f4;
`
const FormTitle = styled.div `
    font-size: 14px;
    font-family: 'Aspira Demi', 'FiraGO Regular';
    font-feature-settings: "case";
    margin-top: 29px;
`
const AddtionalFields = styled.div `
    max-width: 278px;
    margin-top: 19px;
`
const Container = styled.div `
    max-width: 285px;
`
const ModalContentContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  padding: 30px 20px;
  & > svg {
    margin-bottom: 25px;
  };
  & > p {
    font-size: 12px;
    font-family: 'Aspira Demi', 'FiraGO Regular';
    color: #414141;
    margin-bottom: 14px;
  }
`;

export default TimeOfftypesModal;