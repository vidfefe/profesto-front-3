import { useEffect, useState } from "react";
import styled from "styled-components";
import { withRouter } from "react-router";
import { useToasts } from "react-toast-notifications";
import { useDispatch, useSelector } from "react-redux";
import Section, { ListItem } from "../section";
import CompensationInformationEdit from './edit';
import CompensationHistory from "./history";
import EmploymentHistoryDelete from './delete';
import {
    updateEmployeeCompensation,
    createEmployeeCompensation,
    getCurrencies,
    getJobEmployeeCompensationList,
    deleteEmployeeCompensation,
    getJobEmployeeActiveCompensation,
} from 'services'
import { setUpdateCompensation } from "redux/actionSlice";
import { updateCompensationSelector } from 'redux/selectors'
import { numberWithCommas } from 'utils/common';
import PermissionGate from "permissions/PermissionGate";
import { useTranslation } from "react-i18next";
import { dateFormat } from "lib/DateFormat";
import { PaymentType } from "types";
import { sortBy } from "lodash";

const Wrapper = styled.div`
.section-body{
    padding: 20px 45px 20px 12px;

    .effective-as{
        margin-bottom: 20px;
        font-size: 12px;
        font-family: 'Aspira Wide Demi', 'FiraGO Medium';
    }
    
    .list-item .title{
        width: 170px;
        display: inline-block;
        text-align: right;
    }
}
`;

const EmploymentDetails = ({ person, match, disabled }: any) => {
    const { t, i18n } = useTranslation();
    const { addToast } = useToasts();
    const dispatch = useDispatch();
    const isEditCompensationOpen = useSelector(updateCompensationSelector);

    const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
    const [compensation, setCompensation] = useState<any>([]);
    const [compensationList, setCompensationList] = useState<any>([])
    const [currencies, setCurrencies] = useState([]);

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isOpenHistory, setIsOpenHistory] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [updateMode, setUpdateMode] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
    const [chosenItem, setChosenItem] = useState<any>(null);
    const [chosenForDeleteId, setChosenForDeleteId] = useState<any>(null);

    const isTermination = person?.active_job_detail?.employment_status?.id_name === 'terminated';
    const jobEffectiveDate = person?.active_job_detail?.effective_date;
    const [formErrors, setFormErrors] = useState<any>([]);

    const getCompensation = () => {
        getJobEmployeeActiveCompensation(match.params.id ?? person.id).then(res => {
            setCompensation(res.data)
        })
    };

    useEffect(() => {
        getCompensation();
    }, [match.params.id, person])

    useEffect(() => {
        getCurrencies(55, 1).then(res => setCurrencies(res.data.list));
    }, []);

    useEffect(() => {
        if (isOpenHistory) {
            getJobEmployeeCompensationList(25, 1, person.id).then(res => setCompensationList(res.data.list))
        }
    }, [isOpenHistory]);

    useEffect(() => {
        if (!isOpen) {
            dispatch(setUpdateCompensation(false));
        }
    }, [isOpen]);

    useEffect(() => {
        if (isEditCompensationOpen) {
            setEditMode(false)
            setIsOpen(true)
        }
    }, [isEditCompensationOpen]);
    

    const handleEditSubmit = (data: any) => {
        if (editMode && !updateMode) {
            if (chosenItem) {
                setLoadingRequest(true);
                updateEmployeeCompensation(data, chosenItem.id).then(() => {
                    setLoadingRequest(false);
                    getCompensation();
                    setIsOpen(false);
                    setEditMode(false);
                    addToast(t('myInfo.compensation.updated'), {
                        appearance: 'success',
                        autoDismiss: true,
                    });
                    getJobEmployeeCompensationList(25, 1, person.id).then(res => setCompensationList(res.data.list))
                }).catch(err => {
                    setLoadingRequest(false);
                    setFormErrors(err.response.data.errors)
                });
            } else {
                setLoadingRequest(true);
                updateEmployeeCompensation(data, compensation.id).then(() => {
                    setLoadingRequest(false);
                    getCompensation();
                    setIsOpen(false);
                    setEditMode(false);
                    addToast(t('myInfo.compensation.updated'), {
                        appearance: 'success',
                        autoDismiss: true,
                    })
                    getJobEmployeeCompensationList(25, 1, person.id).then(res => setCompensationList(res.data.list))
                }).catch(err => {
                    setLoadingRequest(false);
                    setFormErrors(err.response.data.errors)
                });
            }
        } else {
            setLoadingRequest(true);
            createEmployeeCompensation(data, person.id).then(() => {
                setLoadingRequest(false);
                getCompensation();
                setIsOpen(false)
                setEditMode(false);
                addToast(t('myInfo.compensation.added'), {
                    appearance: 'success',
                    autoDismiss: true,
                });
                getJobEmployeeCompensationList(25, 1, person.id).then(res => setCompensationList(res.data.list))
            }).catch(err => {
                setLoadingRequest(false);
                setFormErrors(err.response.data.errors)
            });
        }
    };

    const handleDeleteSubmit = () => {
        setLoadingRequest(true);
        deleteEmployeeCompensation(chosenForDeleteId).then(() => {
            setLoadingRequest(false);
            getCompensation();
            addToast(t('myInfo.compensation.deleted'), {
                appearance: 'success',
                autoDismiss: true,
            })
            setIsDeleteOpen(false);
            getJobEmployeeCompensationList(25, 1, person.id).then(res => setCompensationList(res.data.list))
        })
    };

    return (
        <Wrapper>
            <PermissionGate action="edit" on="compensation" shouldVisible properties={{ disabled: true }}>
                <Section
                    title={t('employee.job.compensation')}
                    onEditClick={() => {
                        setEditMode(true)
                        setUpdateMode(false);
                        setIsOpen(true);
                        setChosenItem(compensation);
                    }}
                    withEdit={compensation?.id ? true : false}
                    withHistory={compensation?.has_history ? true : false}
                    onHistoryClick={() => setIsOpenHistory(true)}
                    onUpdateClick={() => {
                        setIsOpen(true);
                        setUpdateMode(true);
                        setEditMode(false);
                        setChosenItem(compensation)
                    }}
                    disabled={disabled}
                >
                    <div className='section-body'>
                        {compensation && compensation.effective_date && <p className='effective-as'>
                            {isTermination ? `${t('myInfo.compensation.terminated')} ${dateFormat(new Date(jobEffectiveDate), 'shortMonthAndDay')}` : `${t('myInfo.compensation.effective')} ${dateFormat(new Date(compensation.effective_date), 'shortMonthAndDay')} ${i18n.language === 'ka' && ' - '+t('globaly.from')}`}
                        </p>}
                        <ListItem title={t('employee.job.payment_type')} value={compensation?.payment_type?.name} />
                        <ListItem
                            title={t('employee.job.payment_rate')}
                            value={compensation?.currency ?
                                `${compensation.currency.symbol || ''} 
                            ${numberWithCommas((+compensation.pay_amount).toFixed(2)) || ''} / 
                            ${compensation.payment_period?.name || ''}` : ''}
                        />
                        <ListItem
                            title={t('employee.job.additional_payment_types')}
                            value={compensation?.additional_payment_types?.length
                                ? sortBy(compensation.additional_payment_types, ['id']).map((item: PaymentType) => <>{item.name}<br/></>)
                                : undefined
                            }
                        />
                        <ListItem title={t('employee.job.payment_schedule')} value={compensation?.payment_schedule?.name} />
                    </div>

                    {isOpenHistory ? <CompensationHistory
                        isOpen={isOpenHistory}
                        disabled={disabled}
                        user={person}
                        jobData={person.active_job_detail}
                        compensationList={compensationList}
                        onModalClose={() => {
                            setIsOpenHistory(false);
                            setChosenItem(null);
                            setUpdateMode(false);
                            setEditMode(false);
                        }}
                        onUpdateClick={() => {
                            setIsOpen(true);
                            setUpdateMode(true);
                            setEditMode(false);
                            setChosenItem(compensation);
                        }}
                        onDeleteClick={(id: any) => {
                            setChosenForDeleteId(id)
                            setIsDeleteOpen(true);
                        }}
                        onEditClick={(item: any) => {
                            setIsOpen(true);
                            setEditMode(true);
                            setChosenItem(item);
                        }}
                    /> : null}

                    {isOpen ?
                        <PermissionGate action="edit" on="compensation" shouldVisible properties={{ disabled: true }}>
                            <CompensationInformationEdit
                                isOpen={isOpen}
                                user={person}
                                jobData={person.active_job_detail}
                                isTermination={isTermination}
                                onModalClose={() => {
                                    setEditMode(false);
                                    setUpdateMode(false)
                                    setIsOpen(false);
                                    setChosenItem(null);
                                    setFormErrors([]);
                                }}
                                onSubmit={handleEditSubmit}
                                loadingRequest={loadingRequest}
                                currencies={currencies}
                                formErrors={formErrors}
                                updateMode={updateMode}
                                chosenItem={chosenItem}
                                disabled={disabled}
                            />
                        </PermissionGate>
                        : null}

                    <EmploymentHistoryDelete
                        isOpen={isDeleteOpen}
                        onModalClose={() => setIsDeleteOpen(false)}
                        onDelete={handleDeleteSubmit}
                        loadingRequest={loadingRequest}
                    />
                </Section>
            </PermissionGate>
        </Wrapper>
    );
};

export default withRouter(EmploymentDetails);
