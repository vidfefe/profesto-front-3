import styled from "styled-components";
import useQuery from "hooks/useQueryCustom";
import { useSelector } from "react-redux";
import { currentUserSelector } from "redux/selectors";
import isToday from "date-fns/isToday";
import CircularProgress from "@mui/material/CircularProgress";

import { StepTitle, StepDesc } from "./Welcome";
import EmergencyBlock from '../../Employee/emergency';
import EducationBlock from '../../Employee/personal/education';
import VisaInfoBlock from '../../Employee/personal/visa';
import PassportBlock from '../../Employee/personal/passport';
import DriverLicenseBlock from '../../Employee/personal/driverslicense';
import AdditionalInfoBlock from '../../Employee/personal/additionalinfo';
import { useTranslation } from "react-i18next";
import { region } from "lib/Regionalize";
import { dateFormat } from "lib/DateFormat";
interface IAdditionalInfo {
    updatedAt: Date,
    onBlockSave: (e: { continue: boolean }) => void
};

export default function AdditionalInfo({ updatedAt, onBlockSave }: IAdditionalInfo) {
    const { t } = useTranslation();
    const { employee } = useSelector(currentUserSelector);

    const { data, isLoading } = useQuery<string[], {}, any>(["get_employee_info"], {
        endpoint: `employee_info/main?employee_id=${employee.id}`,
        options: { method: "get" },
    }, { refetchOnWindowFocus: false });

    if (isLoading) return <LoadingScreenContainer><CircularProgress thickness={4} /></LoadingScreenContainer>;

    return (
        <ContentContainer>
            <StepTitle>{t('onBoarding.additionalInfo.additional_information')}</StepTitle>
            <StepDesc>
                {t('onBoarding.additionalInfo.detailed_information')}<br />{t('onBoarding.additionalInfo.up_to_date_information')}
                <span>{t('onBoarding.personalDetails.last_saved')} {isToday(new Date(updatedAt)) ? t('onBoarding.personalDetails.today') : dateFormat(new Date(updatedAt), 'shortMonthAndDay')} at {dateFormat(new Date(updatedAt), 'shortTime')}</span>
            </StepDesc>
            <AdditionalInfoContainer>
                <EmergencyBlock person={data} onSave={() => onBlockSave({ continue: false })} />
                <EducationBlock person={data} onSave={() => onBlockSave({ continue: false })} />
                {region(['eng']) && <VisaInfoBlock person={data} onSave={() => onBlockSave({ continue: false })} />}
                <PassportBlock person={data} onSave={() => onBlockSave({ continue: false })} />
                <DriverLicenseBlock person={data} onSave={() => onBlockSave({ continue: false })} />
                <AdditionalInfoBlock person={data} onSave={() => onBlockSave({ continue: false })} />
            </AdditionalInfoContainer>
        </ContentContainer>
    )
};

const ContentContainer = styled.div`
    flex: 1;
    padding-top: 60px;
    overflow-y: auto;
`;

const AdditionalInfoContainer = styled.div`
    margin-top: 20px;
    margin-right: 60px;
`;

const LoadingScreenContainer = styled.div`
   display: flex;
   justify-content: center;
   align-items: center;
   flex: 1;
`;