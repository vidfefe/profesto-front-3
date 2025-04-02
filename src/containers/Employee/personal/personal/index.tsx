import { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import { formatInTimeZone } from 'date-fns-tz'
import Section, { ListItem } from "../section";
import PersonalInformationEdit from './edit';
import { getEmployeeWithId, updateEmployee } from 'services';
import { useToasts } from "react-toast-notifications";
import { calculateAge } from "utils/common";
import { useTranslation } from "react-i18next";
import { region } from "lib/Regionalize";
import { dateFormat } from "lib/DateFormat";

const Wrapper = styled.div`
    .section-body{
        padding: 15px;
        
        .list-item .title{
            width: 170px;
            display: inline-block;
            text-align: right;
        }
    }
    
    .viewSsn {
        cursor: pointer;
        text-decoration: underline;
        
        :hover {
            color: var(--orange);
        }
    }
`;

const PersonalInformation = ({ person, refreshEmployeeInfo, match, disabled, view }: any) => {
    const { t } = useTranslation();
    const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [showSsn, setShowSsn] = useState<boolean>(false);
    const [showPersonalNumber, setShowPersonalNumber] = useState<boolean>(false);

    
    const [personWithId, setPersonWithId] = useState<any>();
    const { addToast } = useToasts();
    const [editErrors, setEditErrors] = useState<any>([]);

    useEffect(() => {
        if (match.params.id || person.id) {
            getEmployeeWithId(match.params.id ?? person.id).then(res => setPersonWithId(res.data))
        }
        return setShowSsn(false)
    }, [match.params.id, person.id])


    const handleEditSubmit = (data: any) => {
        setLoadingRequest(true);
        updateEmployee(person.id, data).then(res => {
            setLoadingRequest(false);
            setPersonWithId(res.data)
            refreshEmployeeInfo()
            setIsOpen(false)
            addToast(t('onBoarding.your_changes_have_been_saved'), { appearance: 'success', autoDismiss: true })
        }).catch(err => {
            setLoadingRequest(false);
            setEditErrors(err.response.data.errors)
        });
    };

    return (
        <Wrapper style={{ height: 'calc(100% - 15px)' }}>
            <Section style={{ height: '100%' }} title={t('settings.menu.personal_information')} onEditClick={() => setIsOpen(true)} disabled={disabled} view={view}>
                <div className='section-body'>
                    <ListItem smallBlock title={t('employee.first_name')} value={personWithId?.first_name ?? ''} />
                    {region(['eng']) ? <ListItem smallBlock title={t('employee.middle_name')} value={personWithId?.middle_name ?? ''} /> : null}
                    <ListItem smallBlock title={t('employee.last_name')} value={personWithId?.last_name ?? ''} />
                    <ListItem smallBlock title={t('employee.preferred_name')} value={personWithId?.preferred_name ?? ''} />
                    
                    {region(['geo']) ? <ListItem smallBlock title={t('employee.personal_number')} value={personWithId?.personal_number && personWithId?.personal_number !== '' ?
                        <span>
                            <span style={{ width: 20 }}>{showPersonalNumber ? personWithId.personal_number : 'XXXXXXXXXXX'}</span>&nbsp;
                            <span className='viewSsn' onClick={() => setShowPersonalNumber(!showPersonalNumber)}>({t('globaly.click_to')} {showPersonalNumber ? t('globaly.hide') : t('globaly.view')})</span>
                        </span> : ''} /> : null} 

                    <ListItem smallBlock title={t('employee.birth_date')} value={personWithId?.birth_date ?
                        dateFormat(personWithId.birth_date, 'shortDate') + ` (${t('employee.age')}: ${calculateAge(new Date(personWithId.birth_date))})` : ''} />
                    <ListItem smallBlock title={t('employee.place_of_birth')} value={personWithId?.place_of_birth ?? ''} />
                    <ListItem smallBlock title={t('employee.gender')} value={personWithId?.gender?.name ?? ''} />
                    <ListItem smallBlock title={t('employee.marital_status_name')} value={personWithId?.marital_status?.name ?? ''} />
                    {region(['eng']) ? <ListItem title={t('employee.ssn')} value={personWithId?.ssn && personWithId?.ssn !== '' ?
                        <span>
                            <span style={{ width: 20 }}>{showSsn ? personWithId.ssn : 'XXX-XX-XXXX'}</span>&nbsp;
                            <span className='viewSsn' onClick={() => setShowSsn(!showSsn)}>({t('globaly.click_to')} {showSsn ? t('globaly.hide') : t('globaly.view')})</span>
                        </span> : ''} /> : null}
                    <ListItem smallBlock title={t('employee.address.nationality_name')} value={personWithId?.nationality?.name ?? ''} />
                    <ListItem smallBlock title={t('employee.address.citizenship_name')} value={personWithId?.citizenship?.name ?? ''} />
                    <ListItem smallBlock title={t('employee.preferred_language_name')} value={personWithId?.preferred_language?.name ?? ''} />
                </div>
            </Section>

            <PersonalInformationEdit
                isOpen={isOpen}
                user={personWithId}
                jobData={person.active_job_detail}
                onModalClose={() => setIsOpen(false)}
                onSubmit={handleEditSubmit}
                editErrors={editErrors}
                loadingRequest={loadingRequest}
            />
        </Wrapper>
    );
};

export default withRouter(PersonalInformation);
