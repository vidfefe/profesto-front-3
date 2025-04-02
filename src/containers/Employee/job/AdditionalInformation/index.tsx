import { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import Section, { ListItem } from "../section";
import AdditionalInformationEdit from './edit';
import { useToasts } from "react-toast-notifications";
import { useTranslation } from "react-i18next";
import PermissionGate from "permissions/PermissionGate";
import { createJobAddetionalInfo, getJobAddetionalInfo } from "services";


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

const AdditionalInformation = ({ person, match, disabled }: any) => {
    const { t } = useTranslation();
    const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [addetionalInfo, setAddetionalInfo] = useState<any>(null);
    const { addToast } = useToasts();
    const [editErrors, setEditErrors] = useState<any>([]);

    useEffect(() => {
        getCompensation();
    }, [match.params.id, person])

    const getCompensation = () => {
        getJobAddetionalInfo(match.params.id ?? person.id).then((res: any) => {
            setAddetionalInfo(res.data)
        })
    };

    const handleEditSubmit = (data: any) => {
        setLoadingRequest(true);
        createJobAddetionalInfo(person.id, data, addetionalInfo).then((res: any) => {
            setIsOpen(false);
            addToast(t('onBoarding.your_changes_have_been_saved'), {
                appearance: 'success',
                autoDismiss: true,
            });
            setLoadingRequest(false);
            getCompensation();
        }).catch((err: any) => {
            setIsOpen(false);
            setLoadingRequest(false);
            getCompensation();
        })
    };

    return (
        <Wrapper style={{ height: 'calc(100% - 15px)' }}>
            <PermissionGate 
                action="edit" 
                on="job" 
                shouldVisible 
                properties={{ disabled: true }}
            >
            <Section 
                style={{ height: '100%' }} 
                title={t('jobInfo.additional_information')} 
                onEditClick={() => setIsOpen(true)} 
                withEdit={true}
                withUpdate={false}
                disabled={disabled}
            >
                <div className='section-body'>
                    <ListItem smallBlock title={t('jobInfo.pension_status')} value={addetionalInfo?.pension_status?.name ?? '-'} />
                    <ListItem smallBlock title={t('jobInfo.bank_account')} value={addetionalInfo?.bank_account ?? '-'} />
                </div>
            </Section>
            </PermissionGate>
            <AdditionalInformationEdit
                isOpen={isOpen}
                user={person}
                jobData={person.active_job_detail}
                onModalClose={() => setIsOpen(false)}
                onSubmit={handleEditSubmit}
                editErrors={editErrors}
                loadingRequest={loadingRequest}
                addetionalInfo={addetionalInfo}
            />
        </Wrapper>
    );
};

export default withRouter(AdditionalInformation);
