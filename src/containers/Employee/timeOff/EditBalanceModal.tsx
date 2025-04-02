import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import DialogModal, { IDialogProps } from "components/Modal/Dialog";
import EmployeeInfoHeader from 'containers/Employee/editHeader';
import { useToasts } from "react-toast-notifications";
import DatePicker from "components/DatePickers/DatePicker";
import { NumericFormat } from 'react-number-format';
import EnumDropdown from "components/Dropdowns/EnumDropdown";
import FormControlLabel from "@mui/material/FormControlLabel";
import { getEnum, getAdjustmentBalance } from "services";
import { formatNumber } from "utils/common";
import UniversalInput from "components/Input/UniversalInput";
import TextArea from "components/TextArea";
import useMutationCustom from 'hooks/useMutationCustom';
import EditTimeOffBalance from "components/TimeOffBalance/EditTimeOffBalance";
import { find, isEmpty } from "lodash";

interface IAdjustmentType{
    id: string;
    name?: string
}

const EditBalanceModal = ({open, onClose, types, employeeInfo, rest, onRefresh}: any) => {
    const { control, setValue, watch, reset, handleSubmit, clearErrors, setError, formState: { errors } } = useForm<any>({
        defaultValues: {
            adjustment_type: null,
            adjustment_days: '',
            effective_date: null,
            comment: ''
        }
    });
    const { addToast } = useToasts();
    const { t } = useTranslation();
    const [requestLoading, setRequestLoading] = useState<any>(false);
    const [adjustmentTypes, setAdjustmentTypes] = useState<any>([]);
    const [balance, setBalance] = useState<any>(0);

    const watchAdjustmentType = watch('adjustment_type');
    const watchAdjustmentDays = watch('adjustment_days');
    const watchEffectiveDate = watch('effective_date');

    useEffect(() => {
        if (open) {
            getEnum('Enum::TimeOffAdjustmentType').then((res: any) => {
                setAdjustmentTypes(res.data);
                const getAddType = find(res.data, (item: IAdjustmentType) => { return item.id === 'add'});
                if (!isEmpty(getAddType)) {
                    setValue('adjustment_type', getAddType?.id);
                }
            });
            
        }
    }, [open]);

    useEffect(() => {
        if (watchAdjustmentType && watchEffectiveDate) {
            fetchBalanace();
        }
    }, [watchAdjustmentType, watchAdjustmentDays, watchEffectiveDate]);


    const fetchBalanace = () => {
        getAdjustmentBalance(watchAdjustmentType, watchAdjustmentDays, watchEffectiveDate.toDateString(), employeeInfo, types).then((res: any) => {
            setBalance(res?.data)
        })
    };

    const createBalanceAdjustments  = useMutationCustom<{}, { errors: [{ field: string, message: string, }] }, any>(
        ["create_balance_adjustments"], {
        endpoint: `time_off/time_off_balance_adjustments `,
        options: { method: "post" },
    }, {
        onSuccess: () => {
            onClose();
            onRefresh();
            addToast(t('timeOff.you_have_successfully_adjusted_time_off_balance'), { appearance: 'success', autoDismiss: true });
            reset();
        },
        onError: (err) => {
            err.errors.forEach((item) => {
                addToast(item.message, { appearance: 'error', autoDismiss: true });
            });
        }
    });

    const handleFormSubmit = (data: any) => {
        
        const formData = {
            adjustment_type: data?.adjustment_type,
            adjustment_days: data?.adjustment_days,
            effective_date: data?.effective_date,
            note: data?.comment,
            employee_id: employeeInfo?.id,
            time_off_type_id: types?.type?.id
        };

        createBalanceAdjustments.mutate(formData);
    }

    const onCloseModal = () => {
        reset();
        setAdjustmentTypes([]);
        onClose();
        setBalance(0);
    }

    return (
        <DialogModal
            open={open}
            onClose={onCloseModal}
            withButtons
            title={t('timeOff.adjust_balance')+': '+types?.type?.name}
            actionButtonText={t('globaly.save')}
            cancelButtonText={t('globaly.cancel')}
            actionButton={handleSubmit(handleFormSubmit)}
            actionLoading={requestLoading}
            nominalHeader={
                <EmployeeInfoHeader
                    employeeName={`${employeeInfo.first_name} ${employeeInfo.last_name}`}
                    avatarUuid={employeeInfo.uuid}
                    employeeId={employeeInfo.id}
                    jobData={employeeInfo.active_job_detail}
                />}
            maxWidth={'sm'}
            fullWidth
            {...rest}
        >
            <DialogContainer>
                <FieldsContainer>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <StyledFieldItem style={{width: 278}}>
                            <label>{t('timeOff.adjustment')}<sup>*</sup></label>
                            <Controller
                                name="adjustment_type"
                                control={control}
                                rules={{
                                    required: t('validations.is_required', {attribute: t('timeOff.adjustment')})
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <EnumDropdown
                                        placeholder={t('globaly.select', {title: t('timeOff.adjustment')})}
                                        onChange={onChange}
                                        errorText={errors.adjustment_days ? t('timeOff.adjustment_info_required') : errors.adjustment_type ? errors.adjustment_type.message : '' as any}
                                        value={value}
                                        options={adjustmentTypes}
                                        $showClearIcon={false}
                                       
                                    />
                                )}
                            />
                        </StyledFieldItem>
                        <StyledFieldItem style={{marginBottom: errors.adjustment_days ? 17 : 0}}>
                            <Controller
                                control={control}
                                rules={{
                                    required: t('validations.is_required', {attribute: t('timeOff.adjustment')}),
                                    validate: (value: string) => { return !!value }
                                }}
                                name="adjustment_days"
                                render={({ field: { onChange, value, ref } }) => (
                                    <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                                    <StyledNumberOfDaysInput
                                        onValueChange={(values) => onChange(values.value)}
                                        value={formatNumber(value)}
                                        decimalSeparator="."
                                        decimalScale={2}
                                        allowNegative={false}
                                        valueIsNumericString
                                        style={{width: 120, marginTop: 3.9}}
                                        $inputError={!!errors.adjustment_days}
                                    />
                                        <div>
                                            <span>{watchAdjustmentDays >= -1 && watchAdjustmentDays <= 1 ? t('timeOff.adjustmentDay') : t('timeOff.day')}</span>
                                        </div>
                                    </div>
  
                                )}
                            />
                        </StyledFieldItem>
                    </div>
                    <StyledFieldItem style={{width: 278}}>
                        <Controller
                                name="effective_date"
                                control={control}
                                rules={{
                                    validate: value => value === null ? t('validations.valid_date') : (value !== '' || t('validations.date_is_required'))
                                }}
                                render={({ field: { onChange, value, ref } }) => (
                                    <DatePicker
                                        ref={ref}
                                        selected={value}
                                        onChange={onChange}
                                        errorText={errors.effective_date?.message}
                                        label={t('employee.job.effective_date')}
                                        required
                                    />
                                )}
                            />
                    </StyledFieldItem>
                    <StyledFieldItem>
                        <EditTimeOffBalance
                            adjustmentDays={watchAdjustmentDays}
                            adjustmentType={watchAdjustmentType}
                            effectiveDate={watchEffectiveDate}
                            balance={balance}
                        />
                    </StyledFieldItem>
                    <StyledFieldItem>
                        <Controller
                            name="comment"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <TextArea
                                onChange={(event: any) => { onChange(event.target.value) }}
                                label={t('globaly.comment')}
                                defaultValue={value}
                                placeholder={t('timeOff.comments')}
                                maxRows={5}
                                />
                            )}
                        />
                    </StyledFieldItem>
                </FieldsContainer>
            </DialogContainer>
        </DialogModal>
    )
}
const StyledNumberOfDaysInput = styled(NumericFormat) <{ $inputError?: boolean }>`
    width: 100%;
    border-radius: 4px;
    margin-top: 15px;
    border: ${({ $inputError }) => $inputError ? '1px solid var(--red)' : '1px solid #D6D6D6'};
    padding: 11px 13px;

    &:focus {
      border-color:  ${({ $inputError }) => $inputError ? 'var(--red)' : '#99CC33'};
    }
`;
const DialogContainer = styled.div `
    margin: 0px auto;
   // height: calc(100vh - 300px);
`
const ToastContentContainer = styled.div`
    & > b {
        font-family: 'Aspira Demi', 'FiraGO Regular';
    }
`;
const FieldsContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
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
const CalculationBlock = styled.div `
    background-color: #e9e9ff;
    width: 278px;
    height: 96px;
    border-radius: 4px;
    padding: 13px 15px;
`
const BalanceContainer = styled.div `
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
    & > span {
        font-size: 12px;
        display: block;
        margin: 0px 0px 3px 0px;
        font-family: "Aspira Regular", "FiraGO Regular";
    }
`
const BalanceItems = styled.div `
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    gap: 3px;
    & > p {
        font-size: 18px;
        margin: 0px 0px 0px 0px;
        padding: 0px;
        font-family: "Aspira Wide Demi", "FiraGO Medium";
        text-align: right;
    }
    & > span {
        font-size: 10px;
        display: block;
        margin: 0px 0px 5px 0px;
        font-family: "Aspira Regular", "FiraGO Regular";
    }
    
`
export default EditBalanceModal;
