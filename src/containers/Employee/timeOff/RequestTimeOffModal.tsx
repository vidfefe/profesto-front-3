import { useEffect, ChangeEvent, useState, PropsWithChildren, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQueryClient } from "react-query";
import isEqual from 'date-fns/isEqual';
import isWithinInterval from "date-fns/isWithinInterval";
import { useToasts } from "react-toast-notifications";
import { NumericFormat } from 'react-number-format';
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { utcToZonedTime } from "date-fns-tz";
import { isEmpty } from "lodash";
import { CircularProgress } from "@mui/material";
import styled from "styled-components";

import useMutationCustom from "hooks/useMutationCustom";
import { getWorkingDays, getTimeOffRequestTypes } from "services";
import DialogModal, { IDialogProps } from "components/Modal/Dialog";
import SelectDropdown from "components/Dropdowns/SelectDropdown";
import Checkbox from "components/Checkbox";
import DatePicker from "components/DatePickers/DatePicker";
import UniversalInput from "components/Input/UniversalInput";
import TextArea from "components/TextArea";
import { usePermissionGate } from "permissions/usePermissionGate";
import EmployeeInfoHeader from 'containers/Employee/editHeader';
import { formatNumber } from "utils/common";
import TimeOffBalance from "components/TimeOffBalance";
import MainErrorBox from 'components/error/mainError';
import { currentUserSelector } from "redux/selectors";
import { IEmployeeMainInfo } from ".";
import TimeOffStatus from "components/TimeOffStatus";
import useQueryCustom from "hooks/useQueryCustom";
import {
    CalendarRange,
    TimeOffRequest,
    TimeOffRequestMutation,
    TimeOffType,
} from "types";
import { StatusBox } from "./StatusBox";

type TFormValues = {
    automatic_approval: boolean,
    time_off_type: TimeOffType | null,
    date_from: Date | string,
    date_to: Date | string,
    requested_hours: number | null,
    requested_days: number | null,
    time_off_period: string,
    note: string
};

type TRequestError = {
    errors: [{
        type: string,
        field: string,
        message: string
    }]
};

type TServerErrors = {
    overlaps: string,
    duplication: string
};

type RequestTimeOffModalProps = {
    employeeInfo: IEmployeeMainInfo;
    open: boolean;
    timeOffType?: TimeOffType;
    onClose: () => void;
    onRefresh?: () => void;
  } & (
    | {
        requestId: number;
        mode: 'edit';
      }
    | {
        requestId?: never;
        mode?: 'create';
      }
  ) & PropsWithChildren<IDialogProps>;

const RequestTimeOffModal = ({
    employeeInfo,
    open,
    timeOffType,
    onClose,
    onRefresh,
    requestId,
    mode = 'create',
    ...rest
}: RequestTimeOffModalProps) => {
    const { addToast } = useToasts();
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { role } = usePermissionGate();
    const [intervalWithHourData, setIntervalWithHourData] = useState<CalendarRange[]>([]);
    const [balance, setBalance] = useState<any>(null);
    const [skipRecalculation, setSkipRecalculation] = useState<boolean>(false);
    const emptyErrors: TServerErrors = { overlaps: '', duplication: '' };
    const [serverErrors] = useState<TServerErrors>(emptyErrors);
    const { control, setValue, watch, reset, handleSubmit, clearErrors, formState: { errors } } = useForm<TFormValues>({
        defaultValues: {
            automatic_approval: false,
            time_off_type: null,
            date_from: '',
            date_to: '',
            requested_hours: null,
            requested_days: null,
            time_off_period: 'full',
            note: '',
        }
    });
    const watchFromDate = watch('date_from');
    const watchToDate = watch('date_to', '');
    const watchTimeOffType = watch('time_off_type');
    const watchRequestedDays = watch('requested_days');
    const watchRequestedHours = watch('requested_hours');
    const currentUser = useSelector(currentUserSelector);

    const openDate = watchTimeOffType?.open_date && !watchToDate;

    useEffect(() => {
        if (!isEmpty(timeOffType)) {
            setValue('time_off_type', timeOffType)
        }
    }, [timeOffType])

    const onFormError = (err: any) => {
        if (err) {
            addToast(<ToastContentContainer dangerouslySetInnerHTML={{ __html: t('globaly.fix_Highlighted') }} />, {
                appearance: 'error',
                autoDismiss: true,
                placement: 'top-center'
            });
        }
    };

    const clearServerErrors = useCallback(() => {
        serverErrors.overlaps = '';
        serverErrors.duplication = '';
    }, [serverErrors]);

    const onSuccess = useCallback((_, variables: TimeOffRequestMutation) => {
        clearServerErrors();
        addToast(
            variables.automatic_approval
                ? mode === 'create'
                    ? t('timeOff.You_have_successfully_added')
                    : t('timeOff.you_have_successfully_saved_and_approved_time_fff')
                : variables.date_to 
                    ? t('timeOff.you_have_successfully_requested_time_fff')
                    : mode === 'create'
                        ? t('timeOff.you_have_successfully_added_time_fff')
                        : t('timeOff.you_have_successfully_saved_time_fff'),
            { appearance: 'success', autoDismiss: true }
        );
        onClose?.({}, 'escapeKeyDown');
        reset();
        setBalance(null);
        queryClient.invalidateQueries('time_off_requests_list');
        setIntervalWithHourData([]);
        onRefresh?.();
    }, [addToast, clearServerErrors, mode, onClose, onRefresh, queryClient, reset, t]);

    const onError = useCallback((err: TRequestError) => {
        clearServerErrors();
        err.errors.forEach((item) => {
            if (['overlaps', 'duplication'].includes(item.type)) {
                addToast(<ToastContentContainer dangerouslySetInnerHTML={{ __html: t('globaly.fix_Highlighted') }} />, {
                    appearance: 'error',
                    autoDismiss: true,
                    placement: 'top-center'
                });
                Object.assign(serverErrors, { [item.type]: item.message });
            } else {
                addToast(item.message, { appearance: 'error', autoDismiss: true });
            }
        });
    }, [addToast, clearServerErrors, serverErrors, t]);

    const { data: timeOffRequest, isFetching } = useQueryCustom<TimeOffRequest, TRequestError>(["show_time_off", requestId], {
        endpoint: `time_off/time_off_request/${requestId}`,
        options: { method: "get" },
        onSuccess: (data) => {
            setValue('time_off_type', data.time_off_type);
            setValue('date_from', utcToZonedTime(new Date(data.date_from), 'UTC'));
            setValue('note', data.note);
        }
    }, { enabled: open && !!requestId, refetchOnWindowFocus: false });

    const { mutate: createTimeOff, isLoading: createTimeOffLoading } = useMutationCustom<string[], TRequestError, TimeOffRequestMutation>(["post_time_off_request"], {
        endpoint: 'time_off/time_off_request', options: { method: "post" },
    }, {
        onSuccess,
        onError,
    });

    const { mutate: updateTimeOff, isLoading: updateTimeOffLoading } = useMutationCustom<string[], TRequestError, TimeOffRequestMutation>(["put_time_off_request"], {
        endpoint: `time_off/time_off_request/${timeOffRequest?.id}`, options: { method: "put" },
    }, {
        onSuccess,
        onError,
    });

    const { mutate: cancelTimeOff } = useMutationCustom<string[], TRequestError, { id: number | undefined }>(["cancel_time_off"], {
        endpoint: 'time_off/time_off_request/cancel', options: { method: "post" },
    }, {
        onSuccess: () => {
            addToast(t('timeOff.successfully_canceled'), { appearance: 'success', autoDismiss: true });
            onClose?.({}, 'escapeKeyDown');
            queryClient.invalidateQueries('time_off_requests_list');
            onRefresh?.();
        },
        onError: (err) => {
            err.errors.forEach((item) => {
                addToast(item.message, { appearance: 'error', autoDismiss: true });
            });
        }
    });

    useEffect(() => {
        setSkipRecalculation(true);
        const newHour = oneDay(watchFromDate, watchToDate) ? 8 : (!watchFromDate || !watchToDate ? 0 : watchRequestedHours)

        if (watchFromDate) {
            holidayList(watchFromDate, watchToDate, newHour);
        } else {
            setValue('requested_hours', newHour);
        }
        clearServerErrors();
        setSkipRecalculation(false);
    }, [setValue, watchFromDate, watchToDate, watchTimeOffType]);

    useEffect(() => {
        if (!skipRecalculation && oneDay(watchFromDate, watchToDate)) {
            holidayList(watchFromDate, watchToDate, watchRequestedHours);
        }
        setValue('requested_days', formatNumber(Number(watchRequestedHours)/8));
    }, [watchRequestedHours]);

    const oneDay = (from: any, to: any) => {
        return from && to && from.toDateString() === to.toDateString();
    };

    const dateValidator = (value: Date | string, type: string) => {
        if (type === 'date_from') {
            if (!openDate && value > watchToDate) { 
                return t('timeOff.validation_date_from');
            }
        };
        if (type === 'date_to') {
            if (!value && watchTimeOffType?.open_date) {
                return undefined;
            } else if (value < watchFromDate) {
                return t('timeOff.validation_date_from')
            }
        };

        return value === null ? t('validations.valid_date') : value !== '' || t('validations.is_required', {attribute: t('timeOff.date')})
    };

    useEffect(() => {
        if (watchToDate >= watchFromDate) {
            clearErrors(['date_from', 'date_to'])
        }
    }, [watchToDate, watchFromDate]);

    useEffect(() => {
        clearErrors(['date_from', 'date_to']);
    }, [watchTimeOffType]);

    const handleFormSubmit = (data: TFormValues) => {
        let formHoursAttributes = intervalWithHourData.filter(e => isWithinInterval(new Date(e.time_off_day), { start: watchFromDate as Date, end: watchToDate as Date }));

        let formData = {
            employee_id: employeeInfo.id,
            automatic_approval: data.automatic_approval,
            time_off_type_id: data.time_off_type?.id,
            date_from: data.date_from,
            date_to: data.date_to,
            requested_hours: data.requested_hours || null,
            time_off_period: data.time_off_period,
            note: data.note,
            time_off_hours_attributes: formHoursAttributes
        };
        mode === 'create' ? createTimeOff(formData) : updateTimeOff(formData);
    };

    const holidayList = (from: any, to: any, requestedHours: any) => {
        getWorkingDays(from.toDateString(), to ? to.toDateString() : null, requestedHours ? requestedHours : 0, employeeInfo, watchTimeOffType).then(res => {
            setSkipRecalculation(true);
            setBalance(res.data.hours);
            setValue('requested_hours', Number(res.data.requested_hours) ? Number(res.data.requested_hours) : null);
            setSkipRecalculation(false);
        })
    };

    const onCloseModal = () => {
        setBalance(null)
        reset();
        onClose();
    }

    return (
        <DialogModal
            open={open}
            onClose={onCloseModal}
            withButtons
            title={t('leftMenuCard.request_time_off')}
            actionButtonText={openDate ? t('timeOff.save_request') : t('timeOff.send_request')}
            cancelButtonText={t('globaly.cancel')}
            actionButton={handleSubmit(handleFormSubmit, onFormError)}
            actionLoading={createTimeOffLoading || updateTimeOffLoading}
            preDefinedPadding={false}
            nominalHeader={
                <EmployeeInfoHeader
                    employeeName={`${employeeInfo.first_name} ${employeeInfo.last_name}`}
                    avatarUuid={employeeInfo.uuid}
                    employeeId={employeeInfo.id}
                    jobData={employeeInfo.active_job_detail}
                    rightSide={mode === 'edit' &&
                        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end'}}>
                            <TimeOffStatus status={timeOffRequest?.time_off_status}/>
                            {timeOffRequest?.time_off_status.id !== 'cancelled' &&
                                <CancelStyle onClick={() => cancelTimeOff({ id: timeOffRequest?.id })}>{t('timeOff.cancel_request')}</CancelStyle>
                            }
                        </div>
                    }
                />}
            maxWidth={'sm'}
            fullWidth
            {...rest}
        >
            {isFetching ? (
                <CircularProgressContainer>
                    <CircularProgress sx={{ alignSelf: 'center' }} />
                </CircularProgressContainer>
            ) : (
                <DialogContainer>
                    <FieldsContainer>
                        <div>
                            <Controller
                                name="time_off_type"
                                control={control}
                                rules={{ required: t('validations.is_required', {attribute: t('timeOff.time_off_type')}) }}
                                render={({ field: { onChange, value } }) => (
                                    <SelectDropdown
                                        inputPlaceholder={t('globaly.select', {title: t('timeOff.time_off_type')})}
                                        onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: unknown) => {
                                            onChange(newValue)
                                        }}
                                        value={value}
                                        loadRemoteData={() => getTimeOffRequestTypes(100, 1)}
                                        errorText={errors.time_off_type?.message || serverErrors.duplication}
                                        label={t('timeOff.time_off_type')}
                                        required
                                    />
                                )}
                            />
                        </div>
                        {!!serverErrors.duplication && <MainErrorBox type='error' text={serverErrors.duplication}/>}
                        <DatePickersContainer>
                            <div>
                                <Controller
                                    name="date_from"
                                    control={control}
                                    rules={{
                                        validate: value => dateValidator(value, 'date_from')
                                    }}
                                    render={({ field: { onChange, value, ref } }) => (
                                        <DatePicker
                                            ref={ref}
                                            selected={value}
                                            onChange={(date, event) => {
                                                onChange(date, event);
                                            }}
                                            errorWithoutText={!!serverErrors.overlaps}
                                            errorText={errors.date_from?.message || serverErrors.overlaps}
                                            label={t('timeOff.from')}
                                            required
                                        />
                                    )}
                                />
                            </div>
                            <div>
                                <Controller
                                    name="date_to"
                                    control={control}
                                    rules={{
                                        validate: value => dateValidator(value, 'date_to')
                                    }}
                                    render={({ field: { onChange, value, ref } }) => (
                                        <DatePicker
                                            ref={ref}
                                            selected={value}
                                            onChange={onChange}
                                            errorWithoutText={!!serverErrors.overlaps}
                                            errorText={errors.date_to?.message || serverErrors.overlaps}
                                            label={t('timeOff.to')}
                                            required={!watchTimeOffType?.open_date}
                                        />
                                    )}
                                />
                            </div>
                        </DatePickersContainer>
                        {openDate && <MainErrorBox type='warning' text={t('timeOff.warnings.open_date')}/>}
                        {!!serverErrors.overlaps && <MainErrorBox type='error' text={serverErrors.overlaps}/>}
                        {watchFromDate && watchToDate && isEqual(watchFromDate as Date, watchToDate as Date) && <Controller
                            control={control}
                            name="requested_hours"
                            rules={{
                                required:  t('validations.is_required', {attribute: t('timeOff.requested_hours')}),
                                validate: value => +Number(value) <= 24 || t('timeOff.maximum_24_hours')
                            }}
                            render={({ field: { onChange, value, ref } }) => (
                                <NumericFormat
                                    onValueChange={(values) => onChange(values.value)}
                                    value={value}
                                    inputRef={ref}
                                    customInput={UniversalInput}
                                    decimalSeparator="."
                                    decimalScale={2}
                                    valueIsNumericString
                                    required
                                    label={t('timeOff.requested_hours')}
                                    errorText={errors.requested_hours?.message}
                                    style={{width: 267}}
                                />
                            )}
                        />}
                        {
                            // {/*  not need this time */}
                            // watchFromDate && watchToDate && !isEqual(watchFromDate as Date, watchToDate as Date) && <Controller
                            // control={control}
                            // name="time_off_period"
                            // render={({ field }) => (
                            //     <RadioGroup
                            //         row
                            //         {...field}
                            //         onChange={(_, value) => {
                            //             field.onChange(value);
                            //             if (value === 'full') setIntervalWithHourData([]);
                            //         }}>
                            //         <FormControlLabel
                            //             value={'full'}
                            //             control={<RadioButton />}
                            //             label={t('timeOff.full_days')}
                            //         />
                                    
                            //         <FormControlLabel
                            //             value={'partial'}
                            //             control={<RadioButton />}
                            //             label={'Partial Days'}
                            //         />
                            //     </RadioGroup>
                            // )}
                            // />
                        }

                        {/* dont need this time */}
                        {/* {watchTimeOffPeriod === 'partial' && watchFromDate && watchToDate && !isEqual(watchFromDate as Date, watchToDate as Date) && <PartialDateChoose
                            onChangeRange={handlePartialCalendarChangeRange}
                            onChangeCell={handlePartialCalendarChangeCell}
                            intervalWithHourData={intervalWithHourData}
                            startDate={watchFromDate as Date}
                            endDate={watchToDate as Date}
                        />} */}
                        <TimeOffBalance 
                            balance={balance} 
                            requestedDays={watchRequestedDays}
                            timeOffType={watchTimeOffType}
                        />
                        
                        <div>
                            <Controller
                                name="note"
                                rules={{ maxLength: { value: 2500, message: t('max_character', {attribute: 2500})} }}
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <TextArea
                                        onChange={(event: ChangeEvent<HTMLTextAreaElement>) => { onChange(event.target.value) }}
                                        maxRows={5}
                                        value={value}
                                        label={t('timeOff.note')}
                                        placeholder={t('timeOff.comments')}
                                        maxLength={2500}
                                    />
                                )}
                            />
                        </div>
                        {!openDate && (role !== 'employee' && (role !== 'manager' || (role === 'manager' && currentUser.employee.id === employeeInfo.active_job_detail.manager?.id))) && <Controller
                            name="automatic_approval"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <Checkbox
                                    checked={value}
                                    onChange={onChange}
                                    label={t('timeOff.without_managers_approval')}
                                />
                            )}
                        />}
                    </FieldsContainer>
                    {mode === 'edit' && <StatusBox timeOffRequest={timeOffRequest} />}
                </DialogContainer>
            )}
        </DialogModal>
    )
};

export default RequestTimeOffModal;

const DialogContainer = styled.div `
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    height: calc(100vh - 300px);
    
    .type-error, .type-warning {
        margin-bottom: 0px;
        font-size: 11px;
        line-height: 18px;
        padding: 12px;
    }
`
const ToastContentContainer = styled.div`
    & > b {
        font-family: 'Aspira Demi', 'FiraGO Regular';
    }
`;

const FieldsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
    padding: 16px 24px;
`;

const DatePickersContainer = styled.div`
    display: flex; 
    flex-direction: row; 
    gap: 20px;
    & > div {
        flex: 1;
    }
`;

const CancelStyle = styled.div`
    color: #B51212;
    font-size: 11px; 
    cursor: pointer;
    text-decoration: underline;
`;

const CircularProgressContainer = styled.div`
    display: flex;
    justify-content: center;
    height: calc(100vh - 300px);
`;
