import { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import Section, { ListItem } from "../section";
import AddressInformationEdit from './edit';
import { getEmployeeAddress, updateEmployeeAddress } from 'services'
import { useToasts } from "react-toast-notifications";
import { useTranslation } from "react-i18next";
const Wrapper = styled.div`
    .section-body{
        padding: 15px;

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

const AddressInformation = ({ person, match, disabled, view }: any) => {
    const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [AddressInfo, setAddressInfo] = useState<any>([]);
    const [editErrors, setEditErrors] = useState<any>([]);
    const { addToast } = useToasts();
    const { t } = useTranslation();

    let homeAddress = AddressInfo?.find((item: any) => item.address_type.id === 'home_address')
    let mailingAddress = AddressInfo?.find((item: any) => item.address_type.id === 'mailing_address')

    useEffect(() => {
        if (match.params.id || person.id) {
            getEmployeeAddress(match.params.id ?? person.id).then(res => setAddressInfo(res.data))
        }
    }, [match.params.id, person.id]);

    const handleEditSubmit = (data: any) => {
        setLoadingRequest(true);
        updateEmployeeAddress(person.id, data).then(res => {
            setLoadingRequest(false);
            setAddressInfo(res.data)
            setIsOpen(false);
            addToast(t('onBoarding.your_changes_have_been_saved'), { appearance: 'success', autoDismiss: true })
        }).catch(err => {
            setLoadingRequest(false);
            setEditErrors(err.response.data.errors);
        });
    }

    return (
        <Wrapper style={{ height: 'calc(100% - 15px)' }}>
            <Section style={{ height: '100%' }} title={t('employee.address.address')} onEditClick={() => setIsOpen(true)} disabled={disabled} view={view}>
                <div className='section-body'>

                    <div>
                        <h4>{t('employee.address.home_address')}</h4>
                        <div>
                            {!homeAddress && <NoData style={{ paddingBottom: 85 }}>{t('myInfo.home_address_information')}</NoData>}
                            {homeAddress &&
                                <div>
                                    <ListItem title={t('employee.address.country')} value={homeAddress.country.name} />
                                    <ListItem title={t('employee.address.address_line_one')} value={homeAddress.address} />
                                    <ListItem title={t('employee.address.address_line_two')} value={homeAddress.address_details} />
                                    <ListItem title={t('employee.address.city')} value={homeAddress.city} />
                                    {homeAddress.country && homeAddress.country.iso === 'US' ?
                                        <ListItem title={t('employee.address.state_province_region')} value={homeAddress.state && homeAddress.state.name} /> :
                                        <ListItem title={t('employee.address.state_province_region')} value={homeAddress.region} />}
                                    <ListItem title={t('employee.address.postal_code')} value={homeAddress.postal_code} />
                                </div>
                            }
                        </div>

                        <br />

                        <h4>{t('employee.address.mailing_address')}</h4>
                        <div>
                            {!mailingAddress && <NoData>{t('myInfo.mailing_address_information')}</NoData>}
                            {mailingAddress &&
                                <div>
                                    <ListItem title={t('employee.address.country')} value={mailingAddress.country.name} />
                                    <ListItem title={t('employee.address.address_line_one')} value={mailingAddress.address} />
                                    <ListItem title={t('employee.address.address_line_two')} value={mailingAddress.address_details} />
                                    <ListItem title={t('employee.address.city')} value={mailingAddress.city} />
                                    {mailingAddress.country && mailingAddress.country.iso === 'US' ?
                                        <ListItem title={t('employee.address.state_province_region')}
                                            value={mailingAddress.state && mailingAddress.state.name} /> :
                                        <ListItem title={t('employee.address.state_province_region')} value={mailingAddress.region} />}
                                    <ListItem title={t('employee.address.postal_code')} value={mailingAddress.postal_code} />
                                </div>
                            }
                        </div>
                    </div>

                </div>
            </Section>

            <AddressInformationEdit
                isOpen={isOpen}
                user={person}
                jobData={person.active_job_detail}
                editErrors={editErrors}
                AddressInfoData={AddressInfo}
                onModalClose={() => setIsOpen(false)}
                onSubmit={handleEditSubmit}
                loadingRequest={loadingRequest}
            />
        </Wrapper>
    );
};

export default withRouter(AddressInformation);
