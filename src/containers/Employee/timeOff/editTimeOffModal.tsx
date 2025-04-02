import styled from "styled-components";
import { useQueryClient } from "react-query";
import useMutationCustom from "hooks/useMutationCustom";
import { useToasts } from "react-toast-notifications";
import DialogModal, { IDialogProps } from "components/Modal/Dialog";
import {getEmployee} from "services";
import EmployeeInfoHeader from 'containers/Employee/editHeader';
import useQueryCustom from "../../../hooks/useQueryCustom";
import {Fragment, useEffect, useState} from "react";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import LoadingButton from "@mui/lab/LoadingButton";
import { usePermissionGate } from 'permissions/usePermissionGate';
import { dateFormat } from "lib/DateFormat";
import { useTranslation } from "react-i18next";
import TimeOffStatus from "components/TimeOffStatus";
import PartialDate from "./PartialDateChoose/view";
import { isEmpty } from "lodash";
import { ReactComponent as ArrowIcon } from 'assets/svg/arrow-down-sign-to-navigate.svg';
import TimeOffBalance from "components/TimeOffBalance";
import { useSelector } from "react-redux";
import { currentUserSelector } from "redux/selectors";
import { TimeOffRequest } from "types";
import { StatusBox } from "./StatusBox";

interface IRequestTimeOffModal extends IDialogProps {
    employeeId: number,
    requestId: number | undefined,
    onRefresh: any
};

type timeOffValues = {
    id: number | undefined
};

type TRequestError = {
    errors: [{ field: string, message: string, }]
};

export default function RequestTimeOffModal({ employeeId, requestId, open, onClose, onRefresh, ...rest }: IRequestTimeOffModal) {
    const { t } = useTranslation();
    const { addToast } = useToasts();
    const queryClient = useQueryClient();
    const [employeeInfo, setEmployeeInfo] = useState<any>(null);
    const [isVisable, setIsVisable] = useState<any>(false);
    const { role } = usePermissionGate();

    const currentUser = useSelector(currentUserSelector);

    const { data: timeOffRequest, isLoading: timeOffRequestLoading } = useQueryCustom<TimeOffRequest, { response: { data: TRequestError } }>(["show_time_off", requestId], {
        endpoint: `time_off/time_off_request/${requestId}`,
        options: { method: "get" },
    }, {
        enabled: open,
        cacheTime: 0,
        onError: (err) => {
            onClose?.({}, 'escapeKeyDown');
            err.response.data.errors?.forEach(error => addToast(error.message, { appearance: 'error', autoDismiss: true }));
        },
    });

    const { mutate: approveTimeOff, isLoading: approveTimeOffLoading } = useMutationCustom<string[], TRequestError, timeOffValues>(["approve_time_off"], {
        endpoint: 'time_off/time_off_request/approve', options: { method: "post" },
    }, {
        onSuccess: (_, variables) => {
            addToast(t('timeOff.successfully_approved'), { appearance: 'success', autoDismiss: true });
            onClose?.({}, 'escapeKeyDown');
            queryClient.invalidateQueries('time_off_requests_list');
            onRefresh();
        },
        onError: (err) => {
            err.errors.forEach((item) => {
                addToast(item.message, { appearance: 'error', autoDismiss: true });
            });
        }
    });

    const { mutate: denyTimeOff, isLoading: denyTimeOffLoading } = useMutationCustom<string[], TRequestError, timeOffValues>(["deny_time_off"], {
        endpoint: 'time_off/time_off_request/deny', options: { method: "post" },
    }, {
        onSuccess: (_, variables) => {
            addToast(t('timeOff.successfully_denied'), { appearance: 'success', autoDismiss: true });
            onClose?.({}, 'escapeKeyDown');
            queryClient.invalidateQueries('time_off_requests_list');
            onRefresh();
        },
        onError: (err) => {
            err.errors.forEach((item) => {
                addToast(item.message, { appearance: 'error', autoDismiss: true });
            });
        }
    });

    const { mutate: cancelTimeOff } = useMutationCustom<string[], TRequestError, timeOffValues>(["cancel_time_off"], {
        endpoint: 'time_off/time_off_request/cancel', options: { method: "post" },
    }, {
        onSuccess: (_, variables) => {
            addToast(t('timeOff.successfully_canceled'), { appearance: 'success', autoDismiss: true });
            onClose?.({}, 'escapeKeyDown');
            queryClient.invalidateQueries('time_off_requests_list');
            onRefresh();
        },
        onError: (err) => {
            err.errors.forEach((item) => {
                addToast(item.message, { appearance: 'error', autoDismiss: true });
            });
        }
    });

    const handleApprove = () => {
        let formData = {id: timeOffRequest?.id};
        approveTimeOff(formData);
    };

    const handleDeny = () => {
        let formData = {id: timeOffRequest?.id};
        denyTimeOff(formData);
    };

    const handleCancel = () => {
        let formData = {id: timeOffRequest?.id};
        cancelTimeOff(formData);
    };

    const isManagerActionForSelf = () => {
        return (currentUser.employee.id === employeeId && currentUser.permissions.role === 'manager');
    }

    useEffect(() => {
        if (employeeId) {
            getEmployee(employeeId).then(res => setEmployeeInfo(res.data)).catch((err) => console.log(err.response))
        }
    }, [employeeId])

    const showCancelButton =
        timeOffRequest &&
        timeOffRequest.time_off_status.id !== 'cancelled' &&
        (['hr', 'owner'].includes(role) ||
        ['pending', 'open_date'].includes(timeOffRequest.time_off_status.id));

    return (
        <DialogModal
            open={open && !timeOffRequestLoading}
            onClose={onClose}
            preDefinedPadding={false}
            title={t('timeOff.time_off_request', {status: timeOffRequest?.time_off_status.name})}
            nominalHeader={
                <EmployeeInfoHeader
                    employeeName={`${employeeInfo?.first_name} ${employeeInfo?.last_name}`}
                    avatarUuid={employeeInfo?.uuid}
                    employeeId={employeeInfo?.id}
                    jobData={employeeInfo?.active_job_detail}
                    rightSide={
                        <Fragment>
                            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end'}}>
                                <TimeOffStatus status={timeOffRequest?.time_off_status}/>
                                {showCancelButton &&
                                    <CancelStyle onClick={handleCancel}>{t('timeOff.cancel_request')}</CancelStyle>
                                }
                            </div>
                        </Fragment>
                    }
                />}
            fullWidth
            customFooter={
                <DialogActions>
                    <Button
                        tabIndex={1}
                        sx={{ '&:focus': { backgroundColor: '#EAF5EB' }, width: 120 }}
                        onClick={(e) => onClose?.(e, 'escapeKeyDown')}
                        size='large'
                    >
                        {t('globaly.close')}
                    </Button>
                    {role !== 'employee' && timeOffRequest?.time_off_status.id == 'pending' && !isManagerActionForSelf() && <LoadingButton
                        tabIndex={2}
                        type="submit"
                        onClick={() => handleDeny()}
                        size='large'
                        variant='contained'
                        loading={denyTimeOffLoading}
                        sx={{
                            backgroundColor: 'transparent', 
                            color: '#B51212',
                            border: '1px solid #B51212',
                            '&:hover': {backgroundColor: 'transparent'},
                            '&:focus': {backgroundColor: 'transparent'},
                            width: 120,
                            height: 36
                        }}
                    >
                        {t('timeOff.deny')}
                    </LoadingButton>}
                    {role !== 'employee' && timeOffRequest?.time_off_status.id == 'pending' && !isManagerActionForSelf() && <LoadingButton
                        tabIndex={3}
                        type="submit"
                        onClick={() => handleApprove()}
                        size='large'
                        variant='contained'
                        loading={approveTimeOffLoading}
                        sx={{width: 120}}
                    >
                        {t('timeOff.approve')}
                    </LoadingButton>}
                </DialogActions>
            }
            {...rest}
        >
            <DialogContainer>
                <FieldsContainer>
                    <HeaderContainer>
                        <DateBox>
                            <DateBoxHeader>{timeOffRequest && dateFormat(new Date(timeOffRequest?.date_from), 'shortMonthAndYear')}</DateBoxHeader>
                            <DateBoxItems>
                                <p>{timeOffRequest && dateFormat(new Date(timeOffRequest?.date_from), 'shortDay')}</p>
                                <span>{timeOffRequest && dateFormat(new Date(timeOffRequest?.date_from), 'shortDayNumber')}</span>
                            </DateBoxItems>
                        </DateBox>
                        <Arrow>&rarr;</Arrow>
                        <DateBox>
                            <DateBoxHeader>{timeOffRequest && dateFormat(new Date(timeOffRequest?.date_to), 'shortMonthAndYear')}</DateBoxHeader>
                            <DateBoxItems>
                                <p>{timeOffRequest && dateFormat(new Date(timeOffRequest?.date_to), 'shortDay')}</p>
                                <span>{timeOffRequest && dateFormat(new Date(timeOffRequest?.date_to), 'shortDayNumber')}</span>
                            </DateBoxItems>
                        </DateBox>

                        <TimeOffBalance
                            view={true} 
                            balance={timeOffRequest?.hours} 
                            requestedDays={timeOffRequest?.requested_days}
                            timeOffType={timeOffRequest?.time_off_type}
                            auth
                            left
                        />
                    </HeaderContainer>

                    {timeOffRequest && !isEmpty(timeOffRequest.time_off_hours) && 
                        <div style={{paddingLeft: 15, paddingRight: 15}}>
                            <ViewBreakdown onClick={() => setIsVisable((prev: any) => prev ? false : true)}>{t('timeOff.view_breakdown')} {isVisable ? <OpenArrowIcon/> : <CloseArrowIcon/>}</ViewBreakdown>

                            <TimeOfRequestDates style={{display: isVisable ? 'block' : 'none', marginTop: isVisable ? 13 : 0}}>

                                <PartialDate
                                    timesheet={timeOffRequest.time_off_hours}
                                />
                            
                            </TimeOfRequestDates>
                        </div>
                    }
                    {timeOffRequest?.note && <Note>
                        <div>{t('timeOff.request_note')}:</div>
                        <span>{timeOffRequest?.note}</span>
                    </Note>}
                </FieldsContainer>
                <StatusBox timeOffRequest={timeOffRequest} />
            </DialogContainer>
        </DialogModal>
    )
};

const DialogContainer = styled.div `
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    height: calc(100vh - 300px);
`

const TimeOfRequestDates = styled.div `
    
`

const CloseArrowIcon = styled(ArrowIcon)`
    transform: rotate(0deg);
`;

const OpenArrowIcon = styled(ArrowIcon)`
    transform: rotate(180deg);
`;

const ViewBreakdown = styled.div `
    text-decoration: underline;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 5px;
`

const FieldsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
    
`;

const HeaderContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    height: 130px;
    padding: 15px 15px;
    margin-top: 15px;
`;
const Arrow = styled.div `
    margin: 0px 4px;
    font-size: 20px;
    font-family: 'Courier New', Courier, monospace;
    padding-top: 15px;
`
const DateBox = styled.div`
    border-radius: 4px;
    border: 1px solid var(--meddium-green);
    width: 92px;
    height: 120px;
`;
const DateBoxHeader = styled.div `
    padding: 6px;
    background-color: var(--meddium-green);
    text-align: center;
    font-family: 'Aspira Wide Demi', 'FiraGO Medium';
    font-size: 12px;
`
const DateBoxItems = styled.div `
    display: flex;
    flex-direction: column;
    text-align: center;
    align-items: center;
    justify-content: center;
    margin-top: 13px;
    & > span {
      font-size: 32px;
      text-align: center;
      font-family: 'Aspira Wide Demi', 'FiraGO Medium';
    }
  
    & > p {
        text-align: center;
        color: #000000;
        opacity: .61;
        font-size: 16px;
        margin-bottom: 5px;
    }
`
const Note = styled.div`
    padding: 0px 15px;
    display: flex;
    max-width: 100%;
    & > div {
        width: 150px;
    }
    & > span {
        width: 420px;
    }
`;

const CancelStyle = styled.div`
    color: #B51212;
    font-size: 11px; 
    cursor: pointer;
    text-decoration: underline;
`;
