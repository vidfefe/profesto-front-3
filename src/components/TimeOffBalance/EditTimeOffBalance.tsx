import styled from "styled-components";
import { isEmpty } from "lodash";
import { formatNumber } from "utils/common";
import { useTranslation } from "react-i18next";

const EditTimeOffBalance = ({adjustmentDays, adjustmentType, balance, effectiveDate}: any) => {
    const { t } = useTranslation();

    const pluralDays = (number: any) => {
        return Number(number) >= -1 && Number(number) <= 1 ? t('timeOff.adjustmentDay') : t('timeOff.plural_day');
    }

    const calculateBalanceBeforeAdjustment = () => {
        if (!effectiveDate) {
            return 0;
        }
        else return !isEmpty(balance) ? balance : 0
    }

    const calculateNewBalance = () => {
        if (!effectiveDate) {
            return adjustmentType === 'add' ? (0+Number(adjustmentDays)) : (0-Number(adjustmentDays));
        }
        else {
            if (adjustmentDays <= 0) {
                return '0';
            }
            else return formatNumber(adjustmentType === 'add' ? (Number(balance)+Number(adjustmentDays)) : (Number(balance)-Number(adjustmentDays)))
        }
    }

    return (
        <SummarizedInfoBoxContainer>
            <SummarizedInfoBox>
                    <table style={{width: '100%'}}>
                        <tbody>
                            <tr>
                                <td style={{textAlign: 'right'}}><NumberStyle>{formatNumber(adjustmentDays ? adjustmentDays : 0)}</NumberStyle></td>
                                <td style={{position: 'relative'}}><DayTitleStyle>{pluralDays(adjustmentDays)}</DayTitleStyle></td>
                                <td style={{width: '100%', textAlign: 'right'}}>{adjustmentType === 'add' ? t('timeOff.balance_added') : t('timeOff.balance_subtracted')}</td>
                            </tr>
                            <tr><td><div style={{height: 15}}/></td></tr>
                            <tr>
                                <td style={{textAlign: 'right'}}><NumberStyle style={{color: '#5F5F5F'}}>{formatNumber(calculateBalanceBeforeAdjustment())}</NumberStyle></td>
                                <td style={{position: 'relative'}}><DayTitleStyle style={{color: '#5F5F5F'}}>{pluralDays(balance)}</DayTitleStyle></td>
                                <td style={{width: '100%', textAlign: 'right', color: '#5F5F5F'}}>{t('timeOff.balance_before_adjustment')}</td>
                            </tr>

                            <tr>
                                <td style={{textAlign: 'right'}}><NumberStyle style={{color: '#5F5F5F'}}>{calculateNewBalance()}</NumberStyle></td>
                                <td style={{position: 'relative'}}><DayTitleStyle style={{color: '#5F5F5F'}}>{pluralDays(formatNumber(adjustmentType === 'add' ? (Number(balance)+Number(adjustmentDays)) : (Number(balance)-Number(adjustmentDays))))}</DayTitleStyle></td>
                                <td style={{width: '100%', textAlign: 'right', color: '#5F5F5F'}}>{t('timeOff.new_balance')}</td>
                            </tr>

                        </tbody>
                    </table>
            </SummarizedInfoBox>
        </SummarizedInfoBoxContainer>
    )
}
export default EditTimeOffBalance;

const SummarizedInfoBox = styled.div `
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    flex: 1;
`
const SummarizedInfoBoxContainer = styled.div`
    display: flex;
    padding: 10px 15px;
    border-radius: 4px;
    width: 278px;
    flex-direction: column;
    background-color: #e9e9ff;
`;

const NumberStyle = styled.div `
    font-size: 18px;
    margin: 0px 0px 0px 0px;
    padding: 0px;
    font-family: "Aspira Wide Demi", "FiraGO Medium";
    text-align: right;
`
const DayTitleStyle = styled.div `
    font-size: 10px;
    display: block;
    margin: 0px 0px 0px 0px;
    font-family: "Aspira Regular", "FiraGO Regular";
    text-align: right;
    padding-left: 3px;
    position: absolute;
    top: 4px;
`