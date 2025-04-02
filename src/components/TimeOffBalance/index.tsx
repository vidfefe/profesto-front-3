import styled from "styled-components";
import { isEmpty } from "lodash";
import { formatNumber } from "utils/common";
import { useTranslation } from "react-i18next";

const TimeOffBalance = ({balance, requestedDays, view, timeOffType, height, left, auth}: any) => {
    const { t } = useTranslation();

    const prularDays = (number: any) => {
        return Number(number) <= 1 ? t('timeOff.adjustmentDay') : t('timeOff.plural_day');
    }

    return (
        <SummarizedInfoBoxContainer 
            $left={left ? true : false} 
            $viewMode={view} 
            $auth={auth ? true : false}
        >
            {(auth) && <TypeOffTitle>{timeOffType?.name}</TypeOffTitle>}
            <SummarizedInfoBox $height={height}>

                    <table style={{width: '100%'}}>
                        <tbody>
                            <tr>
                                <td style={{textAlign: 'right', fontSize: 22}}><NumberStyle>{formatNumber(requestedDays ? requestedDays : 0.00)}</NumberStyle></td>
                                <td style={{position: 'relative'}}><DayTitleStyle>{prularDays(requestedDays)}</DayTitleStyle></td>
                                <TableTd style={{width: '100%', textAlign: 'right', fontSize: 14}}>{t('timeOff.requested')}</TableTd>
                            </tr>

                            {timeOffType && timeOffType?.has_time_off_rule && <tr style={{color: Number(balance?.today_balance) < 0 ? '#CE5E5E' : '#000'}}>
                                <td style={{textAlign: 'right', opacity: 0.61, fontSize: 16}}><NumberStyle>{formatNumber(!isEmpty(balance?.today_balance) ? balance?.today_balance : 0)}</NumberStyle></td>
                                <td style={{position: 'relative', opacity: 0.61}}><DayTitleStyleCurrentAndYear>{prularDays(balance?.today_balance)}</DayTitleStyleCurrentAndYear></td>
                                <TableTd style={{width: '100%', opacity: 0.61, textAlign: 'right', fontSize: 12}}>{t('timeOff.current_balance')}</TableTd>
                            </tr>}

                            {timeOffType && timeOffType?.has_time_off_rule && <tr style={{color: Number(balance?.days_balance) < 0 ? '#CE5E5E' : '#000'}}>
                                <td style={{textAlign: 'right', opacity: 0.61, fontSize: 16}}><NumberStyle>{formatNumber(!isEmpty(balance?.days_balance) ? balance?.days_balance : 0)}</NumberStyle></td>
                                <td style={{position: 'relative', opacity: 0.61}}><DayTitleStyleCurrentAndYear>{prularDays(balance?.days_balance)}</DayTitleStyleCurrentAndYear></td>
                                <TableTd style={{width: '100%', textAlign: 'right', fontSize: 12, opacity: 0.61}}>{t('timeOff.year_end_balance')}</TableTd>
                            </tr>}

                            {(!timeOffType || !timeOffType.has_time_off_rule) && <tr>
                                <td style={{textAlign: 'right', opacity: 0.61, fontSize: 16}}><NumberStyle>{formatNumber(!isEmpty(balance?.days_used) ? balance?.days_used : 0)}</NumberStyle></td>
                                <td style={{position: 'relative', opacity: 0.61}}><DayTitleStyleCurrentAndYear>{prularDays(balance?.days_used)}</DayTitleStyleCurrentAndYear></td>
                                <TableTd style={{width: '100%', textAlign: 'right', fontSize: 12, opacity: 0.61}}>{t('timeOff.year_end_used')}</TableTd>
                            </tr>}

                        </tbody>
                    </table>

            </SummarizedInfoBox>
        </SummarizedInfoBoxContainer>
    )
}
export default TimeOffBalance;
const TableTd = styled.td `
    font-family: 'Aspira Regular', 'FiraGO Regular', Helvetica, sans-serif;
    padding-bottom: 4px;
`
const TypeOffTitle = styled.div `
    font-family: "Aspira Wide Demi", "FiraGO Medium";
    font-feature-settings: "case";
`
const SummarizedInfoBox = styled.div<{ $height: any }> `
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    flex: 1;
    height: ${props => props.$height ? props.$height+'px' : 'auto'};
`
const SummarizedInfoBoxContainer = styled.div<{ $viewMode: any, $auth: any, $left: any }>`
    display: ${props => props.$viewMode ? 'flex' : 'block'};
    padding: 10px 15px;
    border-radius: 4px;
    width: ${props => props.$viewMode ? '62%' : props.$auth ? '420px' : '267px'};
    height: ${props => props.$viewMode ? '120px' : 'auto'};
    flex-direction: column;
    background-color: #C3E1D2;
    margin-right: ${props => props.$viewMode ? props.$left ? '0px' : '15px' : '0px'};
    margin-left: ${props => props.$left ? '15px' : '0px'};
`;

const NumberStyle = styled.div `
    margin: 0px 0px 0px 0px;
    padding: 0px;
    font-family: "Aspira Wide Demi", "FiraGO Medium";
    text-align: right;
`
const DayTitleStyle = styled.div `
    font-size: 12px;
    display: block;
    margin: 0px 0px 0px 0px;
    font-family: "Aspira Regular", "FiraGO Regular";
    text-align: right;
    padding-left: 3px;
    position: absolute;
    top: 6px;
`

const DayTitleStyleCurrentAndYear = styled.div `
    font-size: 12px;
    display: block;
    margin: 0px 0px 0px 0px;
    font-family: "Aspira Regular", "FiraGO Regular";
    text-align: right;
    padding-left: 3px;
    position: absolute;
    top: 1px;
`