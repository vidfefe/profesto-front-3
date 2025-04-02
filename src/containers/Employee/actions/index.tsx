
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled, { css } from "styled-components";
import { useHistory } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import {
    deleteEmployee,
    getEmployeeW4,
    getEmployeeI9,
    getUserRoleList,
    changeUserRole,
    deactivateUser,
    getActiveJobDetails,
    createJobInfo,
    getEmploymentStatus,
    getJobEmployeeActiveCompensation,
    createEmployeeCompensation,
    getCurrencies,
    rsgeAuthenthification,
    rsgePinAuthenthification,
    sendDataToRsge,
    checkEmployeeData
} from 'services'
import { currentUserSelector } from "redux/selectors";
import { setOverlayLoading } from 'redux/personSlice';
import DeleteEmployee from "./delete";
import JobInfoEdit from "../job/jobinfo/edit";
import CompensationInformationEdit from "../job/compensation/edit";
import InviteModal from "../../Settings/UsersList/InviteModal";
import RequestTimeOffModal from "../timeOff/RequestTimeOffModal";
import PermissionGate from "permissions/PermissionGate";

import { ReactComponent as ArrowIcon } from 'assets/svg/arrow.svg';
import { ReactComponent as ToliaIcon } from 'assets/svg/tolia.svg'
import { useTranslation } from "react-i18next";
import { region } from "lib/Regionalize";
import RsgeAuthenticationModal from "../rsgeAuthenticationModal";
import RsgeErros from "../rsgeAuthenticationModal/errors";
import { Add } from "../benefits/Benefits/modals";
import { useQueryClient } from "react-query";



const Wrapper = styled.div`
    position: absolute;
    top: 43px;
    box-shadow: 0px 3px 6px #00000029;
    border: 1px solid #D6D6D6;
    width: 100%;
    z-index: 99;
    background: white;
    border-radius: 4px;

    hr{
        margin: 0;
        border-top: 1px solid #D6D6D6;
     
    }

    .list-item{
        font-size: 12px;
        padding: 14px 12px;
        color: #00101A;
        justify-content: space-between;
        align-items: center;

        .dropdown-items{
            display: none; 
            position: absolute;
            right: -200px;
            margin-top: -30px;
            background: white;
            box-shadow: 0px 3px 6px #00000029;
            border: 1px solid #D6D6D6;
            border-radius: 4px;
            min-width: 200px;

            li{
                font-size: 12px;
                padding: 15px 12px;
                color: black;

                svg {
                    margin-right: 5px;
                }

                &:hover{
                    cursor: pointer;
                    background: #DCEEE5;
                    color: var(--green);
                }           
            }
        }

        &:hover{
            cursor: pointer;
            background: #DCEEE5;
            color: var(--green);

            .dropdown-items{
                display: block;
            }
        }
    }
`;

const documentTypes = [{
    name: 'W-4',
    id: null
},
{
    name: 'I-9',
    id: null,
}]

const ActionItem = ({ onClick, text, withDropDown, dropdownitems, dropdownItemClick, withCount }: any) => {
    const { t } = useTranslation();

    return <li onClick={onClick} className='list-item' style={{ display: withDropDown ? 'flex' : 'block' }}>
        {text}

        {withDropDown && <StyledArrowIcon direction='right' fill='#00101A' />}

        {withDropDown && <ul className='dropdown-items'>
            {dropdownitems.map((item: any) =>
                <li key={item.name} style={{ borderTop: item.name === t('enums.roles.no_access') ? '1px solid #D6D6D6' : 'none' }}
                    onClick={() => dropdownItemClick(item.name, item.id, item.id || item.name === t('enums.roles.no_access') ? true : false)}>
                    {item.current_role ? <StyledToliaIcon /> : <span style={{ width: 17, display: 'inline-block' }}></span>}
                    {item.name} {withCount && `(${item.user_count})`}
                </li>)}
        </ul>}
    </li>
}

const Actions = ({ person, refreshEmployeeInfo, disabled }: any) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const actionsRef = useRef<any>(null);
    const buttonRef = useRef<any>(null)
    const dispatch = useDispatch();
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const history = useHistory();
    const [accessLevelData, setAccessLevelData] = useState<any>([]);
    const { addToast } = useToasts();
    const [isMailModalOpen, setIsMailModalOpen] = useState<boolean>(false);
    const [isOpenEditEmployee, setIsOpenEditEmployee] = useState<boolean>(false);
    const [isOpenEditCompensation, setIsOpenEditCompensation] = useState<boolean>(false);
    const [isOpenAddBenefit, setIsOpenAddBenefit] = useState<boolean>(false);
    const [formErrors, setFormErrors] = useState<any>([]);
    const [activeJob, setActiveJob] = useState<any>(null);
    const [activeCompensation, setActiveCompensation] = useState<any>(null);
    const [defaultStatus, setDefaultStatus] = useState<any>(null);
    const [exceptStatus, setExceptStatus] = useState<any>(null);
    const [terminationStatus, setTerminationStatus] = useState<any>(false);
    const [currencies, setCurrencies] = useState([]);
    const [chosenRoleId, setChosenRoleId] = useState<any>();
    const [timeOffRequestModal, setTimeOffRequestModal] = useState<boolean>(false);
    const [isOpenRsgeAuthModal, setIsOpenRsgeAuthModal] = useState<boolean>(false);
    const [showPinInput, setShowPinInput] = useState<boolean>(false);
    const [phoneVerificationNumber, setPhoneVerificationNumber] = useState<any>(null);
    const [rsgeError, setRsgeError] = useState<any>(null);
    const [showRsgErrorModal, setShowRsgErrorModal] = useState<any>(false);
    const [sendingDataLoading, setSendingDataLoading] = useState<boolean>(false);


    const currentUser = useSelector(currentUserSelector)

    useEffect(() => {
        function handleClickOutside(event: any) {
            if (actionsRef.current && !actionsRef.current.contains(event.target) && buttonRef.current && !buttonRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [actionsRef])

    useEffect(() => {
        getEmploymentStatus(100, 1).then(res => { setTerminationStatus(res.data.list.find((item: any) => item.id_name === 'terminated')) })
        getCurrencies(55, 1).then(res => setCurrencies(res.data.list));
    }, []);

    useEffect(() => {
        getUserRoleList(25, 1, person.id, false, t).then(res => setAccessLevelData(res.data.list))
    }, [person.id, t]);

    const handleDeleteSubmit = () => {
        setLoadingRequest(true);
        deleteEmployee(person.id).then(res => {
            setLoadingRequest(false);
            history.push('/people')
            addToast(<div>{t('leftMenuCard.successfully_deleted')}</div>, {
                appearance: 'success',
                autoDismiss: true
            });
        }).catch(err => {
            setLoadingRequest(false);
            addToast(<div>{err.response.data.errors[0].message}</div>, {
                appearance: 'error',
                autoDismiss: true
            });
        })
    }

    const handleDropdownItemAction = (name: string, id: number, isRole: boolean) => {
        if (isRole) {
            if (name === t('enums.roles.no_access')) {
                setLoadingRequest(true);
                deactivateUser(person.id).then(res => {
                    setLoadingRequest(false);
                    if (res.status === 200) {
                        addToast(<div>{t('leftMenuCard.updated_successfully')}</div>, {
                            appearance: 'success',
                            autoDismiss: true
                        });
                        getUserRoleList(25, 1, person.id, false, t).then(res => setAccessLevelData(res.data.list))
                        setIsOpen(false)
                        refreshEmployeeInfo()
                    }
                })
            } else {
                if (!person?.role) {
                    setChosenRoleId({ id: id, name: name })
                    setIsOpen(false)
                    setIsMailModalOpen(true)
                    return;
                }

                handleInvite({ role: { id: id } })
            }
        } else if (name == 'W-4') {
            dispatch(setOverlayLoading(true))
            setLoadingRequest(true);
            getEmployeeW4(person.id).then(res => {
                setLoadingRequest(false);
                let blob = new Blob([res.data], { type: 'application/pdf' }),
                    url = window.URL.createObjectURL(blob)

                window.open(url)
                setIsOpen(false)
                dispatch(setOverlayLoading(false))
            }).catch(() => { setLoadingRequest(false); dispatch(setOverlayLoading(false)) })
        } else if (name == 'I-9') {
            setLoadingRequest(true);
            dispatch(setOverlayLoading(true))
            getEmployeeI9(person.id).then(res => {
                setLoadingRequest(false);
                let blob = new Blob([res.data], { type: 'application/pdf' }),
                    url = window.URL.createObjectURL(blob)

                window.open(url);
                dispatch(setOverlayLoading(false))
                setIsOpen(false);
            }).catch(() => { setLoadingRequest(false); dispatch(setOverlayLoading(false)) })
        }
    }

    // Employee Actions
    const updateEmployeeAction = () => {
        setLoadingRequest(true);
        getActiveJobDetails(person.id).then(res => {
            setLoadingRequest(false);
            if (res.data?.employment_status?.id_name !== 'terminated') {
                setActiveJob(res.data);
            }
            setFormErrors([])
            setExceptStatus(terminationStatus?.id)
            setDefaultStatus(null)
            setIsOpenEditEmployee(true)
            setIsOpen(false)
        })
    }

    const terminateEmployeeAction = () => {
        setActiveJob(null);
        setFormErrors([])
        setExceptStatus(null)
        setDefaultStatus(terminationStatus)
        setIsOpenEditEmployee(true)
        setIsOpen(false)
    }

    const rsgeAuthAction = () => {
        checkEmployeeData(person.id).then((res: any) => {
            setIsOpenRsgeAuthModal(true)
            setIsOpen(false)
        }).catch((error: any) => {
            setRsgeError(error?.response?.data?.errors[0]);
            setTimeout(() => {
                setShowRsgErrorModal(true);
            }, 600)
            
        });


    }

    const compensationEmployeeAction = () => {
        setLoadingRequest(true);
        getJobEmployeeActiveCompensation(person.id).then(res => {
            setLoadingRequest(false);
            if (person?.active_job_detail?.employment_status?.id_name !== 'terminated') {
                setActiveCompensation(res.data);
            }
            setFormErrors([])
            setIsOpenEditCompensation(true)
            setIsOpen(false)
        })
    }

    const handleJobEditSubmit = (data: any) => {
        createJobInfo(data, person.id).then(res => {
            setIsOpenEditEmployee(false);
            refreshEmployeeInfo()
        }).catch(err => {
            setFormErrors(err.response.data.errors)
        });
    }

    const handleCompensationEditSubmit = (data: any) => {
        setLoadingRequest(true);
        createEmployeeCompensation(data, person.id).then(() => {
            setLoadingRequest(false);
            setIsOpenEditCompensation(false);
            refreshEmployeeInfo()
        }).catch(err => {
            setLoadingRequest(false);
            setFormErrors(err.response.data.errors)
        });
    }

    const handleInvite = (data: any) => {
        setLoadingRequest(true);
        changeUserRole(data, person.id, !!person.role).then(res => {
            setLoadingRequest(false);
            if (res.status === 200) {
                addToast(<div>{t('leftMenuCard.updated_successfully')}</div>, {
                    appearance: 'success',
                    autoDismiss: true
                });
                getUserRoleList(25, 1, person.id, false, t).then(res => setAccessLevelData(res.data.list))
                setIsMailModalOpen(false);
                setIsOpen(false)
                refreshEmployeeInfo()
            }
        }).catch(err => { setLoadingRequest(false); setFormErrors(err.response.data.errors) });
    }

    const handleAuth = (data: any) => {
        setLoadingRequest(true);
        if (data?.pin) {
            rsgePinAuthenthification(data).then(res => {
                setLoadingRequest(false);
                if (res.status === 200) {
                    sendingDataToRsge();
                }
            }).catch(err => { 
                setLoadingRequest(false); 
                setFormErrors(err.response.data.errors);
            });
        }
        else {
            rsgeAuthenthification(data).then(res => {
                setLoadingRequest(false);
                if (res.status === 200 && !res.data.pin_required) {
                    sendingDataToRsge();
                }
                else {
                    setShowPinInput(true)
                    setIsOpen(false);
                    setPhoneVerificationNumber(res.data.mobile_number);
                    setFormErrors(null);
                }
            }).catch(err => { 
                setLoadingRequest(false); 
                setFormErrors(err.response.data.errors);
                setPhoneVerificationNumber(null)
                
            });
        }
    }

    const sendingDataToRsge = () => {
        setSendingDataLoading(true);
        sendDataToRsge(person.id).then((res: any) => {
            addToast(<div>{t('leftMenuCard.rsgForm.success_notify')}</div>, {
                appearance: 'success',
                autoDismiss: true
            });
            refreshEmployeeInfo();
            setSendingDataLoading(false);
            setIsOpenRsgeAuthModal(false)
            setIsOpen(false)
            setFormErrors(null);
        }).catch((error: any) => {
            setRsgeError(error?.response?.data?.errors[0]);
            setIsOpenRsgeAuthModal(false)
            setIsOpen(false)
            setFormErrors(null);
            setShowRsgErrorModal(true)
            setSendingDataLoading(false);  
        })
    }


    return (
        <div>
            <button className='btn btn-green take-action' ref={buttonRef} onClick={() => setIsOpen(!isOpen)}>{t('leftMenuCard.take_action')}
                <StyledArrowIcon direction={isOpen ? 'up' : 'down'} />
            </button>
            {isOpen &&
                <Wrapper ref={actionsRef}>
                    <ul>
                        {<ActionItem text={t('leftMenuCard.request_time_off')} onClick={() => {
                            setTimeOffRequestModal(true)
                        }} />}
                        <PermissionGate action="edit" on="job">
                            {disabled ? null : <ActionItem text={t('leftMenuCard.update_information')}  onClick={() => {
                                updateEmployeeAction()
                            }} />}
                        </PermissionGate>
                        <PermissionGate action="edit" on="job">
                            {disabled ? null : <ActionItem text={t('leftMenuCard.update_compensation')} onClick={() => {
                                compensationEmployeeAction()
                            }} />}
                        </PermissionGate>
                        <PermissionGate action="edit" on="dependent">
                            {disabled ? null : <ActionItem text={t('leftMenuCard.add_benefit')} onClick={() =>  setIsOpenAddBenefit(true)} />}
                        </PermissionGate>
                        <PermissionGate action="edit" on="job">
                            {disabled ? null : <ActionItem text={t('leftMenuCard.terminate_employee')} onClick={() => {
                                terminateEmployeeAction()
                            }} />}
                        </PermissionGate>

                        {region(['eng']) && <>
                        <hr />
                        <ActionItem
                            text={t('leftMenuCard.download_forms')}
                            onClick={() => { }}
                            withDropDown={true}
                            dropdownitems={documentTypes}
                            dropdownItemClick={(name: string, id: number, isRole: boolean) => handleDropdownItemAction(name, id, isRole)}
                        />
                        <hr />
                        </>}
                        
                        {person?.role?.id_name !== 'owner' && currentUser.employee.id !== person?.id &&
                            <PermissionGate action="edit" on="access">
                                <ActionItem text={t('leftMenuCard.access_level')}
                                    onClick={() => { }} withDropDown={true}
                                    dropdownitems={accessLevelData}
                                    withCount
                                    dropdownItemClick={(name: string, id: number, isRole: boolean) => handleDropdownItemAction(name, id, isRole)} />
                            </PermissionGate>
                        }
                        {person?.role?.id_name !== 'owner' && currentUser.employee.id !== person?.id &&
                            <PermissionGate action="edit" on="employee">
                                <ActionItem text={t('leftMenuCard.delete_employee')} onClick={() => {
                                    setIsDeleteOpen(true)
                                    setIsOpen(false)
                                }} />
                            </PermissionGate>
                        }
                        {region(['geo']) && <PermissionGate action="sync" on="revenue_service">
                            <ActionItem text={t('leftMenuCard.rsgForm.rsge_send_info')} onClick={() => {
                                rsgeAuthAction()
                        }} /></PermissionGate>}
                    </ul>
                </Wrapper>}

            <DeleteEmployee
                isOpen={isDeleteOpen}
                person={person}
                jobData={person.active_job_detail}
                onModalClose={() => setIsDeleteOpen(false)}
                onDelete={handleDeleteSubmit}
                loadingRequest={loadingRequest}
            />

            {isOpenEditEmployee && <JobInfoEdit
                isOpen={isOpenEditEmployee}
                person={person}
                jobData={person.active_job_detail}
                onModalClose={() => {
                    setIsOpenEditEmployee(false);
                }}
                onSubmit={handleJobEditSubmit}
                editMode={false}
                updateMode={true}
                chosenItem={activeJob}
                formErrors={formErrors}
                defaultStatus={defaultStatus}
                exceptStatus={exceptStatus}
                loadingRequest={loadingRequest}
            />}

            {isOpenEditCompensation && <CompensationInformationEdit
                isOpen={isOpenEditCompensation}
                user={person}
                jobData={person.active_job_detail}
                isTermination={person?.active_job_detail?.employment_status?.id_name === 'terminated'}
                onModalClose={() => {
                    setIsOpenEditCompensation(false);
                }}
                onSubmit={handleCompensationEditSubmit}
                currencies={currencies}
                updateMode={true}
                formErrors={formErrors}
                chosenItem={activeCompensation}
                loadingRequest={loadingRequest}
            />}
            {isOpenAddBenefit &&
                <Add
                    isOpen={true}
                    person={person}
                    onCloseModal={() => setIsOpenAddBenefit(false)}
                    refreshData={() => queryClient.invalidateQueries('get_employee_benefit')}
                />
            }
            {isMailModalOpen && <InviteModal
                title={"Fill in Employee's Email"}
                isOpen={isMailModalOpen}
                onModalClose={() => setIsMailModalOpen(false)}
                employeeId={person.id}
                formErrors={formErrors}
                onSubmit={handleInvite}
                chosenRoleId={chosenRoleId}
                loadingRequest={loadingRequest}
            />}
            {isOpenRsgeAuthModal && <RsgeAuthenticationModal
                title={t('leftMenuCard.rsgForm.headerText')}
                isOpen={isOpenRsgeAuthModal}
                onModalClose={() => {
                    setIsOpenRsgeAuthModal(false);
                    setShowPinInput(false);
                    setFormErrors(null);
                    setPhoneVerificationNumber(null)
                }}
                formErrors={formErrors}
                onSubmit={handleAuth}
                showPin={showPinInput}
                loadingRequest={loadingRequest}
                phoneNumber={phoneVerificationNumber}
            />}
            <RequestTimeOffModal
                open={timeOffRequestModal}
                onClose={() => setTimeOffRequestModal(false)}
                employeeInfo={person}
            />
            {
                showRsgErrorModal && <RsgeErros
                isOpen={showRsgErrorModal}
                onModalClose={() => {
                    setShowRsgErrorModal(false);
                    setRsgeError(null);
                }}
                loadingRequest={sendingDataLoading}
                reSendData={() => sendingDataToRsge()}
                errors={rsgeError}
            />
            }
        </div>
    );
};

export default Actions;

const StyledArrowIcon = styled(ArrowIcon) <{ direction?: string, fill?: string }>`
    margin-left: 10px;
    & path {
        fill: ${({ fill }) => fill ? fill : '#FFF'}
    }
    transform: ${({ direction }) => direction === 'up' ?
        css`rotate(180deg)` : direction === 'right' ?
            css`rotate(-90deg)` : css`rotate(0)`};
`;

const StyledToliaIcon = styled(ToliaIcon)`
    & path {
        fill: #339966;
    }
`;
