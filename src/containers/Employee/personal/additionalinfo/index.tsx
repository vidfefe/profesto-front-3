
import { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import AdditionalInformationEdit from "./edit";
import Section, { ListItem } from "../section";
import { createAdditionalInfo, getAdditionalInfo } from 'services'
import { useToasts } from "react-toast-notifications";
import { useTranslation } from "react-i18next";

const Wrapper = styled.div`
.section-body{
    padding: 20px 35px;
    
    .list-item .title{
        width: 170px;
        display: inline-block;
        text-align: right;
    }
}
`;

const NoData = styled.div`
    padding: 20px 25px;
    font-size: 11px;
    color: #80888D;
`;

const AdditionalInformation = ({ person, match, onSave, disabled, view }: any) => {
    const { t } = useTranslation();
    const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [additionalInfo, setAdditionalInfo] = useState<any>(null);
    const { addToast } = useToasts();
    const [editErrors, setEditErrors] = useState<any>([]);

    useEffect(() => {
        if (match.params.id || person.id) {
            getAdditionalInfo(match.params.id ?? person.id).then(res => setAdditionalInfo(res.data))
        }
    }, [match.params.id, person.id])

    const handleEditSubmit = (data: any) => {
        setLoadingRequest(true);
        createAdditionalInfo(data, person.id).then(res => {
            setLoadingRequest(false);
            setAdditionalInfo(res.data);
            setIsOpen(false);
            addToast(t('myInfo.additional_information.edit_additional_information'), {
                appearance: 'success',
                autoDismiss: true,
            })
            onSave && onSave();
        }).catch(err => {
            setLoadingRequest(false);
            addToast(<div><span style={{ fontWeight: 'bold' }}> {t('myInfo.visa.there_form')}</span> <span style={{ marginTop: 6, display: 'inline-block' }}>{t('myInfo.visa.please_below')}</span></div>, {
                appearance: 'error',
                autoDismiss: true,
                placement: 'top-center'
            });
            setEditErrors(err.response.data.errors)
        });
    }

    return (
        <Wrapper>
            <Section title={t('onBoarding.additionalInfo.additional_information')} onEditClick={() => setIsOpen(true)} disabled={disabled} view={view}>
                {!additionalInfo ?
                    <NoData>{t('myInfo.additional_information.no_added')}</NoData> :
                    <div className='section-body'>
                        <ListItem title={t('myInfo.additional_information.shirt_size')} value={additionalInfo.shirt_size && additionalInfo.shirt_size.name} />
                        <ListItem title={t('myInfo.additional_information.allergies')} value={additionalInfo.allergies} />
                        <ListItem title={t('myInfo.additional_information.dietary_restrictions')} value={additionalInfo.dietary_restrictions} />
                        <ListItem title={t('globaly.comment')} value={additionalInfo?.comment} /> 
                    </div>
                }

                <AdditionalInformationEdit
                    isOpen={isOpen}
                    user={person}
                    jobData={person.active_job_detail}
                    additionalInfo={additionalInfo}
                    onModalClose={() => setIsOpen(false)}
                    onSubmit={handleEditSubmit}
                    editErrors={editErrors}
                    loadingRequest={loadingRequest}
                />
            </Section>
        </Wrapper>
    );
};

export default withRouter(AdditionalInformation);
