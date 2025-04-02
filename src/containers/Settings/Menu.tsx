import { useState, useEffect } from "react";
import { useHistory, useLocation } from 'react-router';
import styled from "styled-components"
import Text from 'components/Text';
import PermissionGate from "permissions/PermissionGate";
import { ReactComponent as ArrowDownIcon } from 'assets/svg/arrow.svg';
import useQuery from "../../hooks/useQueryCustom";
import { useTranslation } from "react-i18next";
import { billing } from "lib/Subscription";
import { region } from "lib/Regionalize";

const Menu = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const [jobInformationVisible, setJobInformationVisible] = useState<boolean>(false);
    const [personalInfoVisible, setPersonalInfoVisible] = useState<boolean>(false);
    const [benefitInfoVisible, setBenefitInfoVisible] = useState<boolean>(false);
    let location = useLocation();

    useEffect(() => {
        if (location.pathname.indexOf('/settings/job_information') !== -1) {
            setJobInformationVisible(true);
        }
        if (location.pathname.indexOf('/settings/personal_information') !== -1) {
            setPersonalInfoVisible(true);
        }
        if (location.pathname.indexOf('/settings/benefit_information') !== -1) {
            setBenefitInfoVisible(true);
        }
    }, [location]);

    const { refetch: getPortalLink } = useQuery<any>(["portal_url"], {
        endpoint: 'billing/portal_link',
        options: { method: "get" },
    }, { enabled: false });

    const onClickChoosePlan = async () => {
        const { data } = await getPortalLink();
        window.open(data.url, '_blank');
    };

    return (
        <SettingMenu>
            <TextContainer>
                <Text type="title">{t('settings.menu.settings')}</Text>
            </TextContainer>
            <Divider />

            <PermissionGate on="billing">
                <div style={{ marginBottom: 20 }}>
                    <TextContainer>
                        <Text type="subtitle">{t('settings.menu.application_settings')}</Text>
                    </TextContainer>
                    <ClickableTextContainerMain active={location.pathname.indexOf('/settings/company_info') !== -1}
                        onClick={() => history.push('/settings/company_info')}>
                        <Text type="medium">{t('settings.menu.company_info')}</Text>
                    </ClickableTextContainerMain>
                    { billing() &&
                        <ClickableTextContainerMain active={location.pathname.indexOf('/settings/billing') !== -1}
                            onClick={() => onClickChoosePlan()}>
                            <Text type="medium">{t('settings.menu.subscriptions_billing')}</Text>
                        </ClickableTextContainerMain>
                    }
                </div>
            </PermissionGate>

            <TextContainer>
                <Text type="subtitle">{t('settings.menu.system_access_control')}</Text>
            </TextContainer>

            <ClickableTextContainerMain active={location.pathname.indexOf('/settings/employee_access') !== -1}
                onClick={() => history.push('/settings/employee_access')}>
                <Text type="medium">{t('settings.menu.employee_access')}</Text>
            </ClickableTextContainerMain>

            <TextContainer largeSpacing>
                <Text type="subtitle">{t('settings.menu.dictionaries')}</Text>
            </TextContainer>

            <RootClickableTextContainer
               active={location.pathname.indexOf('/settings/timeoff_types') !== -1}
               onClick={() => history.push('/settings/timeoff_types')}
            >
               <Text type="medium">{t('settings.menu.time_off_type')}</Text>
            </RootClickableTextContainer>

            <RootClickableTextContainer active={benefitInfoVisible} onClick={() => setBenefitInfoVisible(prev => !prev)}>
                <Text type="medium">{t('settings.menu.benefit_information')}</Text>
                <ArrowDownIcon />
            </RootClickableTextContainer>

            <Submenu open={benefitInfoVisible}>
                <ClickableTextContainer
                    active={location.pathname === '/settings/benefit_information/benefit'}
                    onClick={() => history.push('/settings/benefit_information/benefit')}
                >
                    <Text type="medium">{t('settings.menu.benefits')}</Text>
                </ClickableTextContainer>
                <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/benefit_information/benefit_type') !== -1}
                    onClick={() => history.push('/settings/benefit_information/benefit_type')}
                >
                    <Text type="medium">{t('settings.menu.benefit_types')}</Text>
                </ClickableTextContainer>
                <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/benefit_information/benefit_completion_reason') !== -1}
                    onClick={() => history.push('/settings/benefit_information/benefit_completion_reason')}
                >
                    <Text type="medium">{t('settings.menu.benefit_completion_reasons')}</Text>
                </ClickableTextContainer>
            </Submenu>

            <RootClickableTextContainer active={jobInformationVisible} onClick={() => setJobInformationVisible(!jobInformationVisible)}>
                <Text type="medium">{t('settings.menu.job_information')}</Text>
                <ArrowDownIcon />
            </RootClickableTextContainer>

            <Submenu open={jobInformationVisible}>
                <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/job_information/department') !== -1}
                    onClick={() => history.push('/settings/job_information/department')}
                >
                    <Text type="medium">{t('settings.menu.departments')}</Text>
                </ClickableTextContainer>

                <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/job_information/divisions') !== -1}
                    onClick={() => history.push('/settings/job_information/divisions')}
                >
                    <Text type="medium">{t('settings.menu.divisions')}</Text>
                </ClickableTextContainer>

                <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/job_information/location') !== -1}
                    onClick={() => history.push('/settings/job_information/location')}
                >
                    <Text type="medium">{t('settings.menu.locations')}</Text>
                </ClickableTextContainer>

                <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/job_information/job_title') !== -1}
                    onClick={() => history.push('/settings/job_information/job_title')}
                >
                    <Text type="medium">{t('settings.menu.job_titles')}</Text>
                </ClickableTextContainer>

                <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/job_information/employment_status') !== -1}
                    onClick={() => history.push('/settings/job_information/employment_status')}
                >
                    <Text type="medium">{t('settings.menu.employment_statuses')}</Text>
                </ClickableTextContainer>

                <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/job_information/job_change_reason') !== -1}
                    onClick={() => history.push('/settings/job_information/job_change_reason')}
                >
                    <Text type="medium">{t('settings.menu.job_change_reasons')}</Text>
                </ClickableTextContainer>

                <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/job_information/compensation_change') !== -1}
                    onClick={() => history.push('/settings/job_information/compensation_change')}
                >
                    <Text type="medium">{t('settings.menu.compensation_change_reasons')}</Text>
                </ClickableTextContainer>

                <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/job_information/job_termination_reason') !== -1}
                    onClick={() => history.push('/settings/job_information/job_termination_reason')}
                >
                    <Text type="medium">{t('settings.menu.termination_reasons')}</Text>
                </ClickableTextContainer>

                <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/job_information/job_termination_type') !== -1}
                    onClick={() => history.push('/settings/job_information/job_termination_type')}
                >
                    <Text type="medium">{t('settings.menu.termination_types')}</Text>
                </ClickableTextContainer>

                <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/job_information/payment_type') !== -1}
                    onClick={() => history.push('/settings/job_information/payment_type')}
                >
                    <Text type="medium">{t('settings.menu.pay_types')}</Text>
                </ClickableTextContainer>

                <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/job_information/additional_earning') !== -1}
                    onClick={() => history.push('/settings/job_information/additional_earning')}
                >
                    <Text type="medium">{t('settings.menu.additional_earnings')}</Text>
                </ClickableTextContainer>

                <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/job_information/deduction') !== -1}
                    onClick={() => history.push('/settings/job_information/deduction')}
                >
                    <Text type="medium">{t('settings.menu.deductions')}</Text>
                </ClickableTextContainer>

                {/* // hidden based on {@link https://app.clickup.com/t/86c2numxj} 
                <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/job_information/payment_period') !== -1}
                    onClick={() => history.push('/settings/job_information/payment_period')}
                >
                    <Text type="medium">{t('settings.menu.pay_rate_periods')}</Text>
                </ClickableTextContainer> */}

                <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/job_information/payment_schedule') !== -1}
                    onClick={() => history.push('/settings/job_information/payment_schedule')}
                >
                    <Text type="medium">{t('settings.menu.pay_schedules')}</Text>
                </ClickableTextContainer>

            </Submenu>

            <RootClickableTextContainer active={personalInfoVisible} onClick={() => setPersonalInfoVisible(!personalInfoVisible)}>
                <Text type="medium">{t('settings.menu.personal_information')}</Text>
                <ArrowDownIcon />
            </RootClickableTextContainer>
            <Submenu open={personalInfoVisible}>

                <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/personal_information/contact_relationship') !== -1}
                    onClick={() => history.push('/settings/personal_information/contact_relationship')}
                >
                    <Text type="medium">{t('settings.menu.emergency_contact_relationships')}</Text>
                </ClickableTextContainer>

                <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/personal_information/education_degree') !== -1}
                    onClick={() => history.push('/settings/personal_information/education_degree')}
                >
                    <Text type="medium">{t('settings.menu.education_degrees')}</Text>
                </ClickableTextContainer>

                <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/personal_information/identification_document_type') !== -1}
                    onClick={() => history.push('/settings/personal_information/identification_document_type')}
                >
                    <Text type="medium">{t('settings.menu.identification_document_types')}</Text>
                </ClickableTextContainer>

                <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/personal_information/driver_classification') !== -1}
                    onClick={() => history.push('/settings/personal_information/driver_classification')}
                >
                    <Text type="medium">{t('settings.menu.driver_license_classifications')}</Text>
                </ClickableTextContainer>

                {region(['eng']) &&  <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/personal_information/visa') !== -1}
                    onClick={() => history.push('/settings/personal_information/visa')}
                >
                    <Text type="medium">{t('settings.menu.visas')}</Text>
                </ClickableTextContainer>}

                <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/personal_information/nationality') !== -1}
                    onClick={() => history.push('/settings/personal_information/nationality')}
                >
                    <Text type="medium">{t('settings.menu.nationalities')}</Text>
                </ClickableTextContainer>

                <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/personal_information/language') !== -1}
                    onClick={() => history.push('/settings/personal_information/language')}
                >
                    <Text type="medium">{t('settings.menu.languages')}</Text>
                </ClickableTextContainer>

                <ClickableTextContainer
                    active={location.pathname.indexOf('/settings/personal_information/shirt_size') !== -1}
                    onClick={() => history.push('/settings/personal_information/shirt_size')}
                >
                    <Text type="medium">{t('settings.menu.shirt_sizes')}</Text>
                </ClickableTextContainer>

            </Submenu>
        </SettingMenu >
    )
}

export default Menu;


const SettingMenu = styled.div`
    width: 19%;
    float: left;
    padding: 23px 30px 0px 30px;
    background-color: #fff;
    height: 100%;
    overflow-y: auto;
    border-radius: 6px;
`

const TextContainer = styled.div<{ largeSpacing?: boolean }>`
    padding-top: ${(props) => props.largeSpacing ? '30px' : '10px'};
    height: auto;
`

const ClickableTextContainer = styled(TextContainer) <{ active?: boolean }>`
    cursor: pointer;
    padding-top: 10px;

    &:hover {
        background-color: #DCEEE5;
    }

    &:hover span {
        color: #339966;
    }

    & span {
        padding-block: 7px;
        padding-top: 0px;
        color: ${(props) => { return props.active ? "#339966" : '#424E55' }};;
    }
`

const ClickableTextContainerMain = styled(ClickableTextContainer) <{ active?: boolean }>`
    &:hover {
        background-color: transparent;
    }
`

const RootClickableTextContainer = styled(TextContainer) <{ active?: boolean }>`
    cursor: pointer;
    padding-top: 10px;

    &:hover span {
        color: #339966;
    }
    
    &:hover path {
        fill: #339966;
    }

    svg{
        margin-left: 5px;
        width: 10px;
        height: 10px;
        transform: ${(props) => { return props.active ? 'rotate(180deg)' : 'rotate(0deg)' }};
        
        path {
            fill: ${(props) => { return props.active ? "#339966" : '#424E55' }};
        }
    }

    & span {
        padding-block: 7px;
        padding-top: 0px;
        color: ${(props) => { return props.active ? "#339966" : '#424E55' }};
    }
`

const Divider = styled.div`
    border-top: 1px solid #F1F1F1;
    margin-top: 25px;
    margin-bottom: 14px;
`

const Submenu = styled.div<{ open: boolean }>`
    max-height: ${props => props.open ? '100%' : "0"};
    overflow: hidden;
    transition-property: all;
    transition-duration: 1s;
    transition-timing-function: ease-out;
    
    backface-visibility: hidden;

    & div span {
        padding-left: 12px;
    }
`;