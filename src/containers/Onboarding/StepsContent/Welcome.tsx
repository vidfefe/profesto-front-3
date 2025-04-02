import styled from "styled-components"
import { useSelector } from "react-redux";
import { currentUserSelector } from "redux/selectors";
import { formatInTimeZone } from 'date-fns-tz'

import { ReactComponent as PersonCircle } from 'assets/svg/info_circle/person-circle.svg';
import { ReactComponent as SignatureCircle } from 'assets/svg/info_circle/pencil-circle.svg';
import { ReactComponent as DocCircle } from 'assets/svg/info_circle/doc_upload-circle.svg';
import { ReactComponent as CalendarCircle } from 'assets/svg/info_circle/calendar-circle.svg';
import { ReactComponent as LocationCircle } from 'assets/svg/info_circle/location-circle.svg';
import { useTranslation } from "react-i18next";
import { dateFormat } from "lib/DateFormat";

interface IWelcomeStep {
    fillI9: boolean,
    firstDay: {
        date?: string,
        location?: string
    } | null
};

export default function WelcomeStep({ fillI9, firstDay }: IWelcomeStep) {
    const { t } = useTranslation();
    const { company, employee } = useSelector(currentUserSelector);

    return (
        <ContentContainer>
            <StepTitle>{t('onBoarding.welcomeStep.welcome_to', {companyName: company?.name})}</StepTitle>
            <StepDesc>{t('onBoarding.welcomeStep.set_up_your_account', {firstName: employee?.first_name})}</StepDesc>
            <OnboardingProcessesContainer>
                <h1>{t('onBoarding.welcomeStep.during_help_you')}</h1>
                <div><PersonCircle />{t('onBoarding.welcomeStep.fill_details')}</div>
                <div><DocCircle /> {t('onBoarding.welcomeStep.upload_documents')}</div>
                {fillI9 && <div><SignatureCircle />{t('onBoarding.welcomeStep.setup_your_employment')}</div>}
                {firstDay ? <><h1 style={{ marginTop: 30 }}>{t('onBoarding.welcomeStep.your_first_day')}</h1>
                    {firstDay.date && <div><CalendarCircle />{dateFormat(new Date(firstDay.date), 'longDayAndMontn')}</div>}
                    {firstDay.location && <div><LocationCircle /> {firstDay.location}</div>}</> : null}
            </OnboardingProcessesContainer>
        </ContentContainer>
    )
};

const ContentContainer = styled.div`
    flex: 1;
    padding-top: 60px;
`;

const OnboardingProcessesContainer = styled.div`
    margin-top: 55px;
    display: flex;
    flex-direction: column;
    & > h1 {
        font-family: 'Aspira Wide Demi', 'FiraGO Medium';
        font-size: 13px;
        color: #676767;
        margin-bottom: 15px;
    }
    & > div {
        display: flex;
        align-items: center;
        margin-bottom: 9px;
        font-size: 12px;
        color: #676767;
        & > svg {
            margin-right: 10px;
        }
    }
`;

export const StepTitle = styled.div`
    font-family: 'Aspira Demi', 'FiraGO Medium';
    text-transform: uppercase;
    color: #414141;
    font-size: 13px;
    margin-bottom: 10px;
    font-feature-settings: 'case';
`;

export const StepDesc = styled.div`
    display: flex;
    justify-content: space-between;
    color: #424E55;
    font-size: 12px;
    margin-right: 60px;
    & > span {
        font-size: 12px;
    }
`;