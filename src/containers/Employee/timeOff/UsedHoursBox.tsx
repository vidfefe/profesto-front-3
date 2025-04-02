import styled from "styled-components";
import useQueryCustom from "../../../hooks/useQueryCustom";
import { isEmpty } from "lodash";
import Carousel from 'react-elastic-carousel'
import { ReactComponent as SliderArrow } from 'assets/svg/sliderArrow.svg';
import { ReactComponent as SliderAdditem } from 'assets/svg/timeoff/s-add.svg';
import { ReactComponent as SliderEditItem } from 'assets/svg/timeoff/s-edit.svg';
import { ReactComponent as RequestTimeOffIcon } from 'assets/svg/timeoff/add.svg';
import { usePermissionGate } from "permissions/usePermissionGate";
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import Tooltip from '@mui/material/Tooltip';
import { formatNumber } from "utils/common";
interface IUsedHoursBox {
    employeeId: number,
    openTimeOffModal: any,
    requestTimeOff: any,
    openEditBalanceModal: any,
    userHours: any
};

type TDictionary = {
    id: number,
    name: string
}

type THours = [{
    type: TDictionary,
    hours_used: number,
    hours_scheduled: number
}]

export default function UsedHoursBox({ employeeId, openTimeOffModal, openEditBalanceModal, requestTimeOff, userHours, ...rest }: IUsedHoursBox) {
    const [length, setLength] = useState<any>(0);
    const { role } = usePermissionGate();
    const { t } = useTranslation();

    useEffect(() => {
        if (!isEmpty(userHours)) {
            setLength(userHours?.length)
        }
    }, [userHours]);

    const dayOrDays = (numb: any) => {
        return Number(numb) <= 1 ? t('timeOff.adjustmentDay') : t('timeOff.day');
    }

    return (
        <div style={{marginBottom: 18, display: 'flex'}}>
            <ReuqestTimeOff onClick={() => openTimeOffModal(true)}>
                <RequestTimeOffIcon style={{marginTop: 4}}/>
                <span>{t('leftMenuCard.request_time_off')}</span>
            </ReuqestTimeOff>
        {!isEmpty(userHours) ? <MainSlider>
            <Carousel
                pagination={false}
                isRTL={false}
                itemsToShow={3}
                enableSwipe={false}
                itemsToScroll={3}
                itemPadding={[0,5,0,5]}
                showArrows={length <= 3 ? false : true}
                renderArrow={(props) => {
                    return (
                        props.type == 'NEXT' ?
                            !props.isEdge ? <ArrowButtonNext onClick={() => props.onClick()}>
                                <SliderArrow/>
                            </ArrowButtonNext> : <div/>
                        :
                            !props.isEdge ? <ArrowButtonPrev onClick={() => props.onClick()}>
                                <SliderArrow/>
                            </ArrowButtonPrev> : <div/>
                    )
                }}
            >
            {userHours?.map((item: any, index: number) => (
                <SummarizedInfoBox key={index}>
                    <h1>{item?.type.name}</h1>
                    <SummarizedInfoBoxInfo>
                        <SummarizedInfoBoxInfoBlock>
                            <InfoCountBlock>
                                <p>{formatNumber(item.days_used)}</p>
                                <span>{dayOrDays(item.days_used)}</span>
                            </InfoCountBlock>
                            <InfoTitle>{t('timeOff.used')}</InfoTitle>
                        </SummarizedInfoBoxInfoBlock>

                        {item?.has_rules && <SummarizedInfoBoxInfoBlock style={{color: Number(item?.days_balance) < 0 ? '#CE5E5E' : '#000'}}>
                            <InfoCountBlock>
                                <p>{formatNumber(item.days_balance)}</p>
                                <span style={{color: Number(item?.days_balance) < 0 ? '#CE5E5E' : '#5E6D76'}}>{dayOrDays(item.days_balance)}</span>
                            </InfoCountBlock>
                            <InfoTitle style={{color: Number(item?.days_balance) < 0 ? '#CE5E5E' : '#243844'}}>{t('timeOff.remaining_balance')}</InfoTitle>
                        </SummarizedInfoBoxInfoBlock>}
                    </SummarizedInfoBoxInfo>
                    <OverlayBg>
                        <OverlayContent>
                            <Tooltip title={t('leftMenuCard.request_time_off')} arrow placement='bottom'><SliderAdditem onClick={() => requestTimeOff(item?.type)}/></Tooltip>
                            {item?.has_rules && !['employee', 'manager'].includes(role) && <Tooltip title={t('timeOff.adjust_balance')} arrow placement='bottom'><SliderEditItem onClick={() => openEditBalanceModal(item)}/></Tooltip>}
                        </OverlayContent>
                    </OverlayBg>
                </SummarizedInfoBox>
            ))}
        </Carousel></MainSlider> : <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><CircularProgress thickness={4} size={18} /></div>}
        </div>
    )
};
const MainSlider = styled.div `
    flex: 1;
    .rec-slider-container {
      margin: 0px 0px;
    }
`
const ReuqestTimeOff = styled.div `
    width: 112px;
    height: 122px;
    background-color: #339966;
    border-radius: 4px;
    margin-right: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    flex-direction: column;
    padding: 5px;
    transition: background-color 250ms cubic-bezier(0.4,0,0.2,1) 0ms, box-shadow 250ms cubic-bezier(0.4,0,0.2,1) 0ms, border-color 250ms cubic-bezier(0.4,0,0.2,1) 0ms, color 250ms cubic-bezier(0.4,0,0.2,1) 0ms;
    & > span {
        color: #fff;
        text-align: center;
        line-height: 13px;
        display: block;
        margin-top: 13px;
        font-size: 12px;
        font-feature-settings: "case";
        font-family: 'Aspira Wide Demi', 'FiraGO Medium';

    }
    &:hover {
        background-color: rgb(35, 107, 71);
    }
`
const ArrowButtonNext = styled.div `
    transform: rotate(0deg);
    background-color: #000;
    width: 26px;
    height: 25px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: absolute;
    top: 46px;
    right: -9px;
    z-index: 4;
`
const ArrowButtonPrev = styled.div `
    transform: rotate(180deg);
    background-color: #000;
    width: 26px;
    height: 25px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: absolute;
    top: 46px;
    left: -8px;
    z-index: 4;
`
const OverlayBg = styled.div `
    position: absolute;
    background-color: rgb(52 153 102 / 90%);
    top: 0px;
    height: 100%;
    width: 100%;
    left: 0px;
    display: none;
    border-radius: 4px;
    transition: 0.3s;
`
const OverlayContent = styled.div `
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 18px;
`
const SummarizedInfoBox = styled.div`
    position: relative;
    border: 1px solid #D5EAE0;
    background-color: #EEF7F3;
    padding: 15px 14px;
    border-radius: 4px;
    font-weight: bold;
    width: 100%;
    height: 122px;
    cursor: pointer;
    padding-right: 10px;
    transition: 0.3s;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    & > h1 {
        font-size: 13px;
        font-weight: normal;
        color: #243844;
        font-feature-settings: "case";
        font-family: 'Aspira Wide Demi', 'FiraGO Medium';
        letter-spacing: 0px;
    }

    &:hover {
        ${OverlayBg} {
            transition: 0.3s;
            display: block;
        }
    }
`;
const SummarizedInfoBoxInfo = styled.div `
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: row;
    gap: 45px;
`
const SummarizedInfoBoxInfoBlock = styled.div `
    display: flex;
    flex-direction: column;
`
const InfoCountBlock = styled.div `
    display: flex;
    flex-direction: row;
    gap: 5px;
    margin-bottom: 3px;
    & > p {
        font-size: 32px;
        line-height: 32px;
    }
    & > span {
        display: flex;
        margin-top: 17px;
        font-size: 10px;
        line-height: 10px;
    }
`
const InfoTitle = styled.div `
    font-size: 11px;
    font-weight: normal;
    opacity: 0.73;
    font-feature-settings: "case";
    font-family: 'Aspira Wide Demi', 'FiraGO Medium';
`