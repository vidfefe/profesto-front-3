import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { PageHeaderTitle } from 'components/DesignUIComponents';
import PermissionGate from 'permissions/PermissionGate';
import { usePermissionGate } from 'permissions/usePermissionGate';
import { ReactComponent as PersonIcon } from 'assets/svg/info_circle/person-circle.svg';
import { ReactComponent as HeadCountIcon } from 'assets/svg/info_circle/persons_headcount-circle.svg';
import { ReactComponent as GotItIcon } from 'assets/svg/got-it.svg';
import { useTranslation } from "react-i18next";
import LockedFeatureModal from 'components/LockedFeatureModal';
import { ReactComponent as TimeSheetIcon } from 'assets/svg/timesheet.svg';
import { ReactComponent as ReportTimeSheetIonc } from 'assets/svg/rep-timesheet.svg';

export default function ReportsList() {
    const { t } = useTranslation();
    const { permissions, role } = usePermissionGate();
    const [visible, setVisible] = useState<any>(false);


    const firstBlock: any = {
        job_history: permissions?.report?.job_history.view,
        compensation_history: permissions?.report?.compensation_history.view,
        work_anniversaries: permissions?.report?.work_anniversaries.view,
        birthdays: permissions?.report?.birthdays.view,
    };
    const firstBlockVisibility = Object.keys(firstBlock).some((e) => firstBlock[e]);

    const secondBlock: any = {
        additions: permissions?.report?.additions.view,
        terminations: permissions?.report?.terminations.view,
        pay_change: permissions?.report?.pay_change.view,
    };
    const secondBlockVisibility = Object.keys(secondBlock).some((e) => secondBlock[e]);

    return (
        <>
            <PageHeaderTitle title={t('reports.reports')} />
            <ListsContainer>
                <ContentRow>
                    {firstBlockVisibility || role === 'owner' ? <ContentRowHeader>
                        <PersonIcon /><p>{t('reports.list.employee_information')}</p>
                    </ContentRowHeader> : null}
                    <ContentRowList>
                        <PermissionGate on='work_anniversaries'>
                            <Link to='work_anniversaries'>{t('reports.list.work_anniversaries')}</Link>
                        </PermissionGate>
                        <PermissionGate on='birthdays'>
                            <Link to='birthdays'>{t('reports.list.birthdays')}</Link>
                        </PermissionGate>
                        <PermissionGate on='pay_change'>
                            <Link to='pay_change'>{t('reports.list.pay_change')}</Link>
                        </PermissionGate>
                        <PermissionGate on='compensation_history'>
                            <Link to='compensation_history'>{t('reports.list.compensation_history')}</Link>
                        </PermissionGate>
                        <PermissionGate on='benefits'>
                            <Link to='benefits'>{t('reports.list.benefits')}</Link>
                        </PermissionGate>
                    </ContentRowList>
                </ContentRow>
                <ContentRow>
                    {secondBlockVisibility || role === 'owner' ? <ContentRowHeader>
                        <HeadCountIcon /><p>{t('reports.list.headcount_and_turnover')}</p>
                    </ContentRowHeader> : null}
                    <ContentRowList>
                        <PermissionGate on='job_history'>
                            <Link to='job_history'>{t('reports.list.job_history')}</Link>
                        </PermissionGate>
                        <PermissionGate on='additions'>
                            <Link to='additions'>{t('reports.list.additions')}</Link>
                        </PermissionGate>
                        <PermissionGate on='terminations'>
                            <Link to='terminations'>{t('reports.list.terminations')}</Link>
                        </PermissionGate>
                        <PermissionGate on='month_change'>
                            <Link to='month_changes'>{t('reports.list.month_changes')}</Link>
                        </PermissionGate>
                    </ContentRowList>
                </ContentRow>
                <ContentRow>
                    <ContentRowHeader>
                        <ReportTimeSheetIonc />
                        <p>{t('reports.list.time_management')}</p>
                        {/* <GotIt onClick={() => setVisible(true)}><GotItIcon /> <p>{t('globaly.got_it')}</p></GotIt> */}
                    </ContentRowHeader>
                    <ContentRowList>
                        <Link to='time_off_used'>{t('reports.list.time_off_used')}</Link>
                        <Link to='time_off_requests'>{t('reports.list.time_off_requests')}</Link>
                        <Link to='time_off_balances'>{t('reports.list.time_off_balances')}</Link>
                        <Link className="not-pointer" to='#'>{t('reports.list.timesheet')}</Link>
                    </ContentRowList>
                </ContentRow>
                <LockedFeatureModal
                    title={t('reports.list.try_our_time_management')}
                    content={t('reports.list.time_management_feature')}
                    icon={<TimeSheetIcon />}
                    visible={visible}
                    onCloseModal={() => setVisible(false)}
                />
            </ListsContainer>
        </>
    )
};

const GotIt = styled.div`
    margin-left: 20px;
    height: 24px;
    display: flex;
    background-color: #fff;
    border: 1px solid #FF9933;
    border-radius: 4px;
    align-items: center;
    justify-content: flex-start;
    padding: 0px 5px;
    cursor: pointer;
    & > p {
        font-size: 11px;
        margin-left: 5px;
        color: #FF9933;
        text-transform: capitalize;
    }
    &:hover {
        background-color: #FF9933;
        & > svg {
            path {
                fill: #fff;
            }
        }
        & > p {
            color: #fff;
        }
    }
`
const ListsContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
    margin: 12px 60px;
`;

const ContentRow = styled.div`
    flex: 1 0 31%;
    margin: 5px;
`;

const ContentRowHeader = styled.div`
    display: flex;
    align-items: center;
    & > p {
        font-size: 16px;
        color: #339966;
        font-weight: bold;
        margin-left: 8px;
    }
    .opacity {
        opacity: 0.47;
    }
`;

const ContentRowList = styled.div`
    display: flex;
    flex-direction: column;
    margin: 20px 0 20px 33px;
    font-size: 12px;
    color: #00101A;
    gap: 15px;
    a.not-pointer {
        cursor: default;
        opacity: 0.47;
    }
`;


