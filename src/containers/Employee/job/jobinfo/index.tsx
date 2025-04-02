
import { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import { useToasts } from "react-toast-notifications";
import { withRouter } from 'react-router-dom';
import { formatInTimeZone } from 'date-fns-tz'
import JobInfoEdit from "./edit";
import JobInfoHistory from './history';
import Section, { LightPersonListItem, ListItem } from "../section";
import {
    updateJobInfo,
    createJobInfo,
    getActiveJobDetails,
    deleteJobInfo,
} from 'services'
import { isEmpty } from "lodash";
import EmployeeDirectReportList from "./DirectReports";
import Tooltip from '@mui/material/Tooltip';
import PermissionGate from "permissions/PermissionGate";
import { useTranslation } from "react-i18next";
import { dateFormat } from "lib/DateFormat";

const Wrapper = styled.div`
    .section-body{
        padding: 15px;
    
        .effective-as{
            font-weight: 500;
            margin-bottom: 20px;
            margin-top: 5px;
            font-size: 12px;
            font-family: 'Aspira Wide Demi', 'FiraGO Medium';
        }
    
        .user-info{
            margin-bottom: 0;
            border-bottom: 0 !important;
        }
        
        .list-item .title{
            width: 170px;
            display: inline-block;
            text-align: right;
        }
    
        .list-item .dot{
            width: 9px;
            height: 9px;
            display: inline-block;
            border-radius: 50%;
            background: #D26E6E;
            margin-right: 4px;
        }
    }
    
    .tooltip {
        max-width: 300px;
     }
`;

const JobInfo = ({ person, refreshEmployeeInfo, match, disabled, view }: any) => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
    const [isOpenHistory, setIsOpenHistory] = useState<boolean>(false);
    const [isOpenDirectRep, setIsOpenDirectRep] = useState<boolean>(false);

    const [editMode, setEditMode] = useState<boolean>(false);
    const [activeJob, setActiveJob] = useState<any>([]);
    const { addToast } = useToasts();
    const [chosenItem, setChosenItem] = useState<any>(null);
    const [updateMode, setUpdateMode] = useState(false);
    const [isCommentOverflowed, setIsCommentOverflowed] = useState(false);

    const commentRef = useRef<any>(null);
    const [formErrors, setFormErrors] = useState<any>([]);
    const isTermination = activeJob?.employment_status?.id_name === 'terminated';

    useEffect(() => {
        getActiveJobDetails(match.params.id ?? person.id).then(res => setActiveJob(res.data))
    }, [match.params.id, person])

    useEffect(() => {
        if (commentRef?.current) {
            setIsCommentOverflowed(commentRef.current.offsetHeight < commentRef.current.scrollHeight ||
                commentRef.current.offsetWidth < commentRef.current.scrollWidth)
        }
    }, [commentRef.current, activeJob]);

    const handleEditSubmit = (data: any) => {
        if (editMode) {
            setLoadingRequest(true);
            updateJobInfo(data, chosenItem.id).then(res => {
                setLoadingRequest(false);
                setIsOpen(false);
                setEditMode(false);
                addToast(t('jobInfo.job_updated'), {
                    appearance: 'success',
                    autoDismiss: true,
                })

                getActiveJobDetails(match.params.id).then(res => setActiveJob(res.data))
                refreshEmployeeInfo()
            }).catch(err => { setFormErrors(err.response.data.errors); setLoadingRequest(false); });
        } else {
            setLoadingRequest(true);
            createJobInfo(data, person.id).then(res => {
                setLoadingRequest(false);
                setIsOpen(false);
                setEditMode(false);
                addToast(t('jobInfo.job_added'), {
                    appearance: 'success',
                    autoDismiss: true,
                });
                getActiveJobDetails(match.params.id).then(res => setActiveJob(res.data))
                refreshEmployeeInfo()
            }).catch(err => { setFormErrors(err.response.data.errors); setLoadingRequest(false); })
        }
    }

    const handleDeleteSubmit = (id: any) => {
        setLoadingRequest(true);
        deleteJobInfo(id).then(res => {
            setLoadingRequest(false);
            addToast(t('jobInfo.job_deleted'), {
                appearance: 'success',
                autoDismiss: true,
            })
            getActiveJobDetails(match.params.id).then(res => setActiveJob(res.data))
            refreshEmployeeInfo();
        })
    }

    return (
        <Wrapper>
            <PermissionGate action="edit" on="job" shouldVisible properties={{ disabled: true }}>
                <Section title={t('employee.job.job_information')}
                    withEdit={activeJob.id ? true : false}
                    withHistory={activeJob.has_history}
                    onUpdateClick={() => {
                        if (!isTermination) {
                            setChosenItem(activeJob);
                        }
                        setIsOpen(true);
                        setUpdateMode(true);
                        setEditMode(false);
                    }}
                    onEditClick={() => {
                        setChosenItem(activeJob);
                        setIsOpen(true);
                        setUpdateMode(false);
                        setEditMode(true);
                    }}
                    onHistoryClick={() => setIsOpenHistory(true)}
                    disabled={disabled}
                >

                    <div className='section-body'>
                        {activeJob && activeJob.effective_date && <p className='effective-as'>
                            {isTermination ? t('jobInfo.terminated_from') : t('jobInfo.effective_of')} {dateFormat(new Date(activeJob.effective_date), 'shortMonthAndDay')}{i18n.language === 'ka' && ` - ${t('globaly.from')}`}
                        </p>}
                        <ListItem title={t('jobInfo.employment_status')} value={activeJob?.employment_status?.name} isRed={isTermination} />
                        
                        {isTermination && <ListItem title={t('jobInfo.termination_type')} value={activeJob?.job_termination_type?.name} />}
                        {isTermination && <ListItem title={t('jobInfo.reason')} value={activeJob?.job_termination_reason?.name} />}
                        {isTermination && <ListItem title={t('jobInfo.eligible_rehire')} value={activeJob?.rehire_eligibility?.name} />}
                        {isTermination && (isCommentOverflowed ?
                            <Tooltip title={activeJob?.comment} enterDelay={200}>
                                <div>{isTermination && <ListItem title={t('globaly.comment')} value={activeJob?.comment} ref={commentRef} />}</div>
                            </Tooltip> : <ListItem title={t('globaly.comment')} value={activeJob?.comment} ref={commentRef} />)}
                        <ListItem title={t('employee.job.work_type')} value={activeJob?.work_type?.name}/>
                        <ListItem title={t('employee.job.job_title')} value={activeJob?.job_title?.name} />
                        <ListItem title={t('employee.job.department')} value={activeJob?.department?.name ?? ''} />
                        <ListItem title={t('employee.job.division')} value={activeJob?.division?.name ?? ''} />
                        <ListItem title={t('employee.address.location')} value={activeJob?.location?.name ?? ''} />
                        {activeJob?.manager && <LightPersonListItem title={t('employee.job.manager_t')} manager={activeJob?.manager} />}
                        {activeJob?.subordinates && !isEmpty(activeJob?.subordinates) &&
                            <LightPersonListItem 
                                title={t('employee.job.direct_reports')}
                                values={activeJob?.subordinates}
                                isMulti={true}
                                showMore={() => setIsOpenDirectRep(true)}
                                manager={activeJob.subordinates ? person : undefined}
                            />
                        }
                    </div>
                    <PermissionGate action="edit" on="job" shouldVisible properties={{ disabled: true }}>
                        <JobInfoEdit
                            isOpen={isOpen}
                            person={person}
                            jobData={person.active_job_detail}
                            onModalClose={() => {
                                setEditMode(false);
                                setChosenItem(null);
                                setUpdateMode(false);
                                setIsOpen(false);
                            }}
                            onSubmit={handleEditSubmit}
                            editMode={editMode}
                            updateMode={updateMode}
                            chosenItem={chosenItem}
                            formErrors={formErrors}
                            loadingRequest={loadingRequest}
                            disabled={disabled}
                        />
                    </PermissionGate>

                    {isOpenHistory && <JobInfoHistory
                        isOpen={isOpenHistory}
                        disabled={disabled}
                        view={view}
                        person={person}
                        jobData={person.active_job_detail}
                        onModalClose={() => {
                            setChosenItem(null)
                            setUpdateMode(false)
                            setEditMode(false)
                            setIsOpenHistory(false)
                        }}
                        handleDeleteSubmit={(id: any) => handleDeleteSubmit(id)}
                        onEditClick={(item: any) => {
                            setIsOpen(true);
                            setEditMode(true);
                            setUpdateMode(false);
                            setChosenItem(item);
                        }}
                        onUpdateClick={() => {
                            if (!isTermination) {
                                setChosenItem(activeJob);
                            }
                            setIsOpen(true);
                            setUpdateMode(true);
                            setEditMode(false);
                        }}
                        loadingRequest={loadingRequest}
                    />
                    }

                    {isOpenDirectRep && <EmployeeDirectReportList
                        id={person.id}
                        isOpen={isOpenDirectRep}
                        setOpen={setIsOpenDirectRep}
                        person={person}
                    />}
                </Section>
            </PermissionGate>
        </Wrapper>
    );
};

export default withRouter(JobInfo);
