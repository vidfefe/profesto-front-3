import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import styled from 'styled-components';
import { renderToStaticMarkup } from "react-dom/server";
import UnauthorizedHeader from "partials/Header/unauthorizedHeader";
import { ReactComponent as ArcIcon } from 'assets/svg/arc.svg';
import { ReactComponent as ApprovedIcon } from 'assets/svg/timeoff/approved.svg'
import { ReactComponent as DenyIcon } from 'assets/svg/timeoff/deny.svg'
import { ReactComponent as AlertIcon } from 'assets/svg/timeoff/alert.svg'
import { currentUserSelector } from "redux/selectors";
import { useSelector } from "react-redux";
import { isEmpty } from 'lodash';
import { saveTimeOffUnauthorizedData } from 'services';
import CircularProgress from '@mui/material/CircularProgress';
import ChangeLanguage from "components/ChangeLanguage";
import { dateFormat } from 'lib/DateFormat';
import TimeOffBalance from 'components/TimeOffBalance';

const svgStringArc = encodeURIComponent(renderToStaticMarkup(<ArcIcon />));

const TimeOffRequest = ({props}: any) => {
    const { t } = useTranslation();
    const [screenLoading, setScreenLoading] = useState<any>(true);
    const [item, setItem] = useState<any>({});
    const query = new URLSearchParams(window.location.search);
    const status = query.get('status');
    const token = query.get('token');
    const currentUser = useSelector(currentUserSelector);

    useEffect(() => {
        if (!isEmpty(token) && !isEmpty(status)) {
            fecthTimeOffData(token, status);
        }
    }, [status, token]);


    const fecthTimeOffData = (token: any, status: any) => {
        saveTimeOffUnauthorizedData(token, status).then(res => {
            setScreenLoading(false);
            setItem(res?.data);
          }).catch(err => {
            setItem(err?.response?.data)
            setScreenLoading(false);
          })
    }

    const renderText = () => {
        const { employee, company } = item;
        const firstAndLastName = `${employee?.first_name} ${employee?.last_name}`;
        if (item?.time_off_status?.id === 'approved') {
            return <p>{t('timeOff.approve_text', {employee: firstAndLastName, companyName: company?.name})}</p>;
            
        }
        else if (item?.time_off_status?.id === 'denied') {
            return (
                <Fragment>
                    <p>{t('timeOff.time_off_denied_alert', {employee: firstAndLastName, companyName: company?.name})}</p>
                    {!isEmpty(item?.errors) && <span>{item?.errors[0]?.message}</span>}
                </Fragment>
            )
        }
    }

    const renderAlertText = () => {
        const { employee, company } = item;
        const firstAndLastName = `${employee?.first_name} ${employee?.last_name}`;
        if (status === 'approved') {
            return (
                <Fragment>
                    <p>{t('timeOff.time_off_alert_text', {employee: firstAndLastName})}</p>
                    {!isEmpty(item?.errors) && <span>{item?.errors[0]?.message}</span>}
                </Fragment>
            )
        }
        else if (status === 'denied') {
            return (
                <Fragment>
                    <p>{t('timeOff.time_off_denied_text', {employee: firstAndLastName})}</p>
                    {!isEmpty(item?.errors) && <span>{item?.errors[0]?.message}</span>}
                </Fragment>
            )
        }
    }

    const renderPermissionText = () => {
        if (status === 'approved') {
            return (
                <Fragment>
                    <p>{t('timeOff.time_off_permission_approved')}</p>
                    {!isEmpty(item?.errors) && <span>{item?.errors[0]?.message}</span>}
                </Fragment>
            )
        }
        else if (status === 'denied') {
            return (
                <Fragment>
                    <p>{t('timeOff.time_off_permission_denied')}</p>
                    {!isEmpty(item?.errors) && <span>{item?.errors[0]?.message}</span>}
                </Fragment>
            )
        }


    }

    return (
        <PageContainer>
            {isEmpty(currentUser) && <UnauthorizedHeader />}
            <ContentContainer>
                {screenLoading ? <CircularProgress thickness={4} /> : <Fragment>
                <FormContainer>
                    <IconContainer style={{marginBottom: isEmpty(item?.employee?.uuid) ? 15 : 75}}>
                        {!isEmpty(item?.errors) ? <AlertIcon/> : item?.time_off_status?.id === 'denied' ? <DenyIcon/> : <ApprovedIcon/>}
                        {
                            isEmpty(item?.employee?.uuid) ? 
                                null 
                            : 
                                <UserImage>
                                    <img
                                        src={`${process.env.REACT_APP_BASE_API_URL}employee_photo/${item?.company?.id}/${item?.employee?.uuid}?version=small`}
                                        alt='profile'
                                    />
                                </UserImage>
                        }
                    </IconContainer>

                    {(!isEmpty(item) && item.id && !isEmpty(item?.errors)) ? renderAlertText() : renderText()}
                    {(!item?.id && !isEmpty(item?.errors)) && renderPermissionText()}

                    {!isEmpty(item) && item?.id &&
                    <HeaderContainer>
                    <DateBox>
                        <DateBoxHeader>{item && dateFormat(new Date(item?.date_from), 'shortMonthAndYear')}</DateBoxHeader>
                        <DateBoxItems>
                            <p>{item && dateFormat(new Date(item?.date_from), 'shortDay')}</p>
                            <span>{item && dateFormat(new Date(item?.date_from), 'shortDayNumber')}</span>
                        </DateBoxItems>
                    </DateBox>
                    <Arrow>&rarr;</Arrow>
                    <DateBox>
                        <DateBoxHeader>{item && dateFormat(new Date(item?.date_to), 'shortMonthAndYear')}</DateBoxHeader>
                        <DateBoxItems>
                            <p>{item && dateFormat(new Date(item?.date_to), 'shortDay')}</p>
                            <span>{item && dateFormat(new Date(item?.date_to), 'shortDayNumber')}</span>
                        </DateBoxItems>
                    </DateBox>

                    <TimeOffBalance
                            height={95}
                            balance={item?.hours} 
                            requestedDays={item?.requested_days}
                            timeOffType={item?.time_off_type}
                            auth
                            left
                        />
                    </HeaderContainer>}


                    <LanguageContainer>
                    <ChangeLanguage/>
                </LanguageContainer>
                </FormContainer>
                </Fragment>
                }

            </ContentContainer>
        </PageContainer>
    )
}
const LanguageContainer = styled.div `
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 40px;
`
const PageContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    background: `#F8F8F7 url('data:image/svg+xml;utf8, ${svgStringArc}') left center/cover no-repeat`,
    backgroundSize: 450,
    [theme.breakpoints.down('lg')]: {
      backgroundSize: 350,
    },
}));
const ContentContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
}));
const FormContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 525,
    padding: '10px 16px 40px 16px',
    alignItems: 'center',
    '& > h2': {
      fontSize: 33,
      fontFamily: "'Aspira Wide Demi', 'FiraGO Medium'",
      color: '#172B37',
      textAlign: 'center',
      paddingInline: 30,
      [theme.breakpoints.down('sm')]: {
        fontSize: 18,
      },
    },
    '& > p': {
      fontSize: 25,
      color: '#676767',
      textAlign: 'center',
      fontFamily: 'Aspira Demi',
      '& > b': {
        fontFamily: 'Aspira Demi',
      },
      [theme.breakpoints.down('sm')]: {
        fontSize: 10,
        marginTop: 8
      },
    },
    '& > span': {
        fontSize: 16,
        color: '#676767',
        display: 'block',
        marginTop: 30,
        fontFamily: "'Aspira Wide', 'FiraGO Regular'",
    }
}));
const IconContainer = styled.div `
    position: relative;
    z-index: 1;
`
const UserImage = styled.div `
    position: absolute;
    width: 105px;
    height: 105px;
    border: 1px solid #fff;
    top: 140px;
    left: 34%;
    border-radius: 50%;
    padding: 3px;
    & > img {
        border-radius: 50%;
    }
`
const HeaderContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    height: 130px;
    margin-top: 15px;
`;
const Arrow = styled.div `
    margin: 0px 4px;
    font-size: 20px;
    font-family: 'Courier New', Courier, monospace;
    padding-top: 15px;
`
const DateBox = styled.div`
    border-radius: 4px;
    border: 1px solid var(--meddium-green);
    width: 92px;
    height: 130px;
`;
const DateBoxHeader = styled.div `
    padding: 6px;
    background-color: var(--meddium-green);
    text-align: center;
    font-family: 'Aspira Wide Demi', 'FiraGO Medium';
    font-size: 12px;
`
const DateBoxItems = styled.div `
    display: flex;
    flex-direction: column;
    text-align: center;
    align-items: center;
    justify-content: center;
    margin-top: 13px;
    & > span {
      font-size: 32px;
      text-align: center;
      font-family: 'Aspira Wide Demi', 'FiraGO Medium';
    }
  
    & > p {
        text-align: center;
        color: #000000;
        opacity: .61;
        font-size: 16px;
        margin-bottom: 5px;
    }
`
export default TimeOffRequest;