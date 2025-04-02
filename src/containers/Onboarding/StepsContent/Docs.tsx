import styled from "styled-components";
import { useSelector } from "react-redux";
import { currentUserSelector } from "redux/selectors";
import isToday from "date-fns/isToday";

import { StepTitle, StepDesc } from "./Welcome";
import Documents from '../../Employee/documents';
import { useTranslation } from "react-i18next";
import { dateFormat } from "lib/DateFormat";

interface IDocsUpload {
    updatedAt: Date
};

export default function Docs({ updatedAt }: IDocsUpload) {
    const { employee } = useSelector(currentUserSelector);
    const { t } = useTranslation();

    return (
        <ContentContainer>
            <StepTitle>{t('onBoarding.docs.upload_documents')}</StepTitle>
            <StepDesc>
                {t('onBoarding.docs.upload_your_documents')}
                <span>{t('onBoarding.personalDetails.last_saved')} {isToday(new Date(updatedAt)) ? t('onBoarding.personalDetails.today') : dateFormat(new Date(updatedAt), 'shortMonthAndDay')} at {dateFormat(new Date(updatedAt), 'shortTime')}</span>
            </StepDesc>
            <DocsListContainer>
                <Documents person={{ id: employee.id }} />
            </DocsListContainer>
        </ContentContainer>
    )
};

const ContentContainer = styled.div`
    flex: 1;
    padding-top: 60px;
    overflow-y: auto;
`;

const DocsListContainer = styled.div`
    margin-top: 20px;
    margin-right: 60px;
`;