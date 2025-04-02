import { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import Section, { ListItem } from "../section";
import ContactInformationEdit from './edit';
import { getContactInformation, updateContactInformation } from 'services'
import { useToasts } from "react-toast-notifications";
import { WarningDialog } from "components/DesignUIComponents";
import { useSelector } from "react-redux";
import { currentUserSelector } from "redux/selectors";
import { useTranslation } from "react-i18next";
const Wrapper = styled.div`
    .section-body{
        padding: 20px;

        h4{
            color: #172B37;
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

const NoData = styled.div`
    padding-top: 13px;
    padding-left: 35px;
    font-size: 11px;
    color: #80888D;
    padding-bottom: 20px;
`;

const LinkWrapper = styled.span`
   &:hover {
        color: #FF9933;
   }
   cursor: pointer;
   text-decoration: underline; 
`;

const ContactInformation = ({ person, refreshEmployeeInfo, match, disabled, view }: any) => {
    const history = useHistory();
    const { t } = useTranslation();
    const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [contactInfo, setContactInfo] = useState<any>([]);
    const { addToast } = useToasts();
    const [editErrors, setEditErrors] = useState<any>([]);
    const [warningOpen, setWarningOpen] = useState<boolean>(false);
    const [changeEmails, setChangeEmails] = useState<any>([]);
    const currentUser = useSelector(currentUserSelector)

    useEffect(() => {
        if (match.params.id || person.id) {
            getContactInformation(match.params.id ?? person.id).then(res => setContactInfo(res.data))
        }
    }, [match.params.id, person.id])

    const warningTitle = () => {
        return changeEmails && changeEmails.length > 1 ? t('myInfo.personal_and_work_email_change') : (changeEmails[0] === 'work_email' ? t('myInfo.work_email_change') : t('myInfo.personal_email_change'))
    }

    const warningText = () => {
        return <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div>{person.id === currentUser.employee.id ? t('myInfo.your') : t('employee.employee') }
                {changeEmails.length > 1 ? t('myInfo.personal_and_work') : (changeEmails[0] === 'work_email' ? t('myInfo.work') : t('myInfo.personal'))}
                {t('myInfo.email_successfully_updated')}</div><br /><br />
            <div style={{ fontWeight: 'bold' }}>{t('myInfo.please_note_that')} {person.id === currentUser.employee.id ? t('myInfo.your') : t('employee.employee')} {t('myInfo.sign_in_email_updated')}</div>
            {person.id === currentUser.employee.id && <div style={{ marginTop: 2 }}>{t('myInfo.email_go_to')}&nbsp;
                <LinkWrapper onClick={() => {setWarningOpen(false); history.push('?action=change_email')}}>{t('myInfo.sign_in_email_change')}</LinkWrapper>
            </div>}
        </div>
    }

    const handleEditSubmit = (data: any) => {
        setLoadingRequest(true);
        updateContactInformation(person.id, data).then(res => {
            setLoadingRequest(false);
            setContactInfo(res.data)
            setIsOpen(false);
            refreshEmployeeInfo()
            addToast(t('myInfo.contact_successfully_updated'), {
                appearance: 'success',
                autoDismiss: true,
            });

            if (res.data.updated_emails && res.data.updated_emails.length) {
                setChangeEmails(res.data.updated_emails)
                setWarningOpen(true)
            }

        }).catch(err => {
            setLoadingRequest(false);
            addToast(err.response.data.errors[0].message, {
                appearance: 'error',
                autoDismiss: true,
            });
            setEditErrors(err.response.data.errors)
        });
    }

    return (
        <Wrapper>
            <Section title={t('myInfo.contact_information')} onEditClick={() => setIsOpen(true)} disabled={disabled} view={view}>
                <div className='section-body'>
                    {contactInfo ? <div className='row'>
                        <div className='col-md-6'>
                            <div>
                                <h4>{t('employee.contact.phone')}</h4>
                                {!contactInfo.work_phone && !contactInfo.mobile_phone && !contactInfo.home_phone ?
                                    <NoData>{t('myInfo.no_phone_added')}</NoData>
                                    : <div>
                                        <ListItem title={t('employee.contact.work_phone')} value={(contactInfo.work_phone ? contactInfo.work_phone : '') +
                                            (contactInfo.work_phone_ext ? ` ${t('globaly.ext')} ${contactInfo.work_phone_ext}` : '')} />
                                        <ListItem title={t('employee.contact.mobile_phone')} value={contactInfo.mobile_phone} />
                                        <ListItem title={t('employee.contact.home_phone')} value={contactInfo.home_phone} />
                                    </div>}

                            </div>

                            <div>
                                <h4>{t('employee.contact.email')}</h4>
                                {!contactInfo.personal_email && !contactInfo.work_email ?
                                    <NoData>{t('myInfo.no_email_added')}</NoData>
                                    :
                                    <div>
                                        <ListItem title={t('employee.contact.work_email')} value={contactInfo.work_email} />
                                        <ListItem title={t('employee.contact.personal_email')} value={contactInfo.personal_email} />
                                    </div>}
                            </div>
                        </div>

                        <div className='col-md-6'>
                            <div style={{ marginLeft: 7.5 }}>
                                <h4>{t('onBoarding.personalDetails.social_links')}</h4>
                                {!contactInfo.linkedin && !contactInfo.facebook && !contactInfo.twitter ?
                                    <NoData>{t('myInfo.no_social_links_added')}</NoData>
                                    :
                                    <div>
                                        <ListItem title='Linkedin' isLink={true} value={contactInfo.linkedin} />
                                        <ListItem title='Facebook' isLink={true} value={contactInfo.facebook} />
                                        <ListItem title='Twitter' isLink={true} value={contactInfo.twitter} />
                                    </div>}
                            </div>
                        </div>
                    </div> : <div>{t('myInfo.no_contact_added')}</div>}
                </div>

            </Section>

            <ContactInformationEdit
                isOpen={isOpen}
                user={person}
                jobData={person.active_job_detail}
                contactInfoData={contactInfo}
                onModalClose={() => setIsOpen(false)}
                onSubmit={handleEditSubmit}
                editErrors={editErrors}
                loadingRequest={loadingRequest}
            />

            {warningOpen && <WarningDialog
                title={warningTitle()}
                isOpen={warningOpen}
                onClose={() => setWarningOpen(false)}
                warningText={warningText()}
                withButtons={false}
                actionLoading={loadingRequest}
            />}
        </Wrapper >
    );
};

export default withRouter(ContactInformation);
