import { Fragment, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSelector } from "react-redux";
import styled from "styled-components";
import {
  peopleDirPathSelector,
  currentUserSelector,
  globalErrorSelector,
  companyFeaturesSelector
} from "redux/selectors";
import useQuery from "hooks/useQueryCustom";
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import DialogModal from 'components/Modal/Dialog';
import CompanyActions from "./CompanyActions";
import EmployeeSearchField from "./EmployeeSearch";
import AccountMenu from './AccountMenu';
import DisableAccessModal from 'containers/people/DisableAccessModal';
import PermissionGate from 'permissions/PermissionGate';
import FinishRegistrationModal from './FinishRegistration';
import { usePermissionGate } from 'permissions/usePermissionGate';

import { ReactComponent as SettingIcon } from 'assets/svg/gear_circle.svg';
import { ReactComponent as ProfestoLogo } from 'assets/svg/profesto_logo.svg';
import { ReactComponent as TimerIcon } from 'assets/svg/timer-with-x_circles.svg';
import { ReactComponent as HamburgerMenuIcon } from 'assets/svg/hamburger-lines.svg';
import { ReactComponent as LockedIcon } from 'assets/svg/locked.svg';
import { ReactComponent as TimeSheetIcon } from 'assets/svg/timesheet.svg';
import { useTranslation } from "react-i18next";
import LockedFeatureModal from 'components/LockedFeatureModal';

const AuthorizedHeader = () => {
  const { t } = useTranslation();
  const [portalTargetLink, setPortalTargetLink] = useState<string>('')
  const { pathname } = useLocation();
  const { role, isRegFinished } = usePermissionGate();
  const peopleDir = useSelector(peopleDirPathSelector);
  const currentUser = useSelector(currentUserSelector);
  const globalError = useSelector(globalErrorSelector);
  const [timeSheetModalVisible, setTimeSheetModalVisible] = useState<boolean>(false);
  const companyFeatures = useSelector(companyFeaturesSelector);

  

  const isPeoplePathMenu = pathname.includes('people') ||
    pathname.includes('createperson') ||
    pathname.includes('list') ||
    pathname.includes('employee') ||
    pathname === '/';

  const { refetch: refetchSubscriptionInfo, data, isLoading } = useQuery<any>(["subscription_info"], {
    endpoint: 'billing/subscription',
    options: { method: "get" },
  }, { refetchOnMount: false, refetchOnWindowFocus: false, refetchOnReconnect: false });

  useEffect(() => {
    if (globalError?.code === '2') {
      refetchSubscriptionInfo();
    }
  }, [globalError?.code, refetchSubscriptionInfo]);

  const { refetch: getPortalLink, isFetching } = useQuery<any>(["portal_url"], {
    endpoint: `billing/portal_link?to=${portalTargetLink}`,
    options: { method: "get" },
  }, { enabled: false });

  const renderRemainingDays = (day: number) => {
    if (day === 2) return t('headers.authorized.tomorrow');
    if (day === 1) return t('headers.authorized.today');
    return t('headers.authorized.in_days', {day: day});
  };

  const onClickChoosePlan = async () => {
    const { data } = await getPortalLink();
    window.open(data.url, '_blank');
    setPortalTargetLink('');
  };

  useEffect(() => {
    if (portalTargetLink) {
      onClickChoosePlan();
    }
  }, [portalTargetLink]);

  const showTimeSheetModal = (e: any) => {
    setTimeSheetModalVisible(true);
    e.preventDefault()
  }

  const isAdminOrOwner = !['employee', 'manager'].includes(role);

  return (
    <Fragment>
      <Container>
        <NavLeftSideContainer>
          <Link className='logo' to='/'>
            <ProfestoLogo />
          </Link>
          <NavContainer style={{ marginLeft: isAdminOrOwner ? 56 : 68 }}>
            <ul style={{ gap: isAdminOrOwner ? 0 : 30 }}>
              <li><NavLink className={isPeoplePathMenu ? 'active' : ''} to={`/${peopleDir}`}>{t('headers.authorized.people')}</NavLink></li>
              <li><NavLink to="/myinfo">{t('headers.authorized.my_info')}</NavLink></li>
              {role !== 'employee' &&
                <>
                  <li>
                    <NavLink to="/timesheet" className="with-icon" onClick={(e) => false ? showTimeSheetModal(e) : undefined}>
                      {t('headers.authorized.timesheet')} {false ? <LockedIcon /> : null}
                    </NavLink>
                  </li>
                  {companyFeatures?.payroll && isAdminOrOwner && <li><NavLink to="/payroll">{t('headers.authorized.payroll')}</NavLink></li>}
                </>
              }
              <li><NavLink to='/reports/'>{t('headers.authorized.reports')}</NavLink></li>
            </ul>
          </NavContainer>
        </NavLeftSideContainer>
        <NavRightSideContainer>
          {role === 'owner' && data && data.status === 'trialing' && <TrialInformerContainer>
            <p>{t('headers.authorized.trial_ends')} {isLoading ?
              <CircularProgress size={15} sx={{ margin: "0 16px" }} /> :
              renderRemainingDays(data.trial)} <br /><span onClick={() => setPortalTargetLink('update_plan')}>{t('headers.authorized.choose_plan')}</span>
              {isFetching ?
                <CircularProgress sx={{ position: 'absolute', marginTop: 0.5, marginLeft: 0.3 }} size={10} /> : null}
            </p>
          </TrialInformerContainer>}
          <PermissionGate on='search_employee'>
            <EmployeeSearchField />
          </PermissionGate>
          <CompanyActionsContainer>
            <CompanyActions />
          </CompanyActionsContainer>
          <PermissionGate on='search_employee'>
            <NavLink
              className='settings'
              activeClassName='settings-active'
              to={role === 'owner' ? '/settings/company_info' : '/settings/employee_access'}
            >
              <SettingIcon />
            </NavLink>
          </PermissionGate>

          <AccountMenuContainer>
            <AccountMenu />
          </AccountMenuContainer>

          <HamburgerMenuContainer>
            <HamburgerMenuIcon />
          </HamburgerMenuContainer>

        </NavRightSideContainer>
      </Container>
      <DialogModal open={globalError?.code === '1'} withoutHeader upperPosition>
        <ModalContentContainer>
          <TimerIcon />
          {role === 'owner' ? <Fragment>
            <ModalMainText>
              {t('headers.authorized.app_trial', {companyName: currentUser.company?.name})}
            </ModalMainText>
            <ModalSecondaryText>
              {t('homePage.please')} <span onClick={() => setPortalTargetLink('update_quantity')}>
                {t('headers.authorized.upgrade_available')}
              </span> {t('homePage.or')} <span onClick={() => setPortalTargetLink('update_plan')}>
                {t('headers.authorized.choose_another_plan')}
              </span> {t('headers.authorized.continue_working')}
              {isFetching ? <LinearProgress /> : <div style={{ height: 4 }}></div>}
            </ModalSecondaryText>
          </Fragment> : <Fragment>
            <ModalMainText>
              {t('headers.authorized.app_trial', {companyName: currentUser.company?.name})}
            </ModalMainText>
            <ModalSecondaryText>
              {t('headers.authorized.company_account_owner')}
            </ModalSecondaryText>
          </Fragment>}
        </ModalContentContainer>
      </DialogModal>
      <DisableAccessModal
        open={globalError?.code === '2'}
        subscriptionData={globalError}
        withoutHeader
      />
      <FinishRegistrationModal
        open={!isRegFinished}
      />
      <LockedFeatureModal
        title={t('globaly.try_our_timesheet')}
        content={t('globaly.timesheet_feature')}
        icon={<TimeSheetIcon/>}
        visible={timeSheetModalVisible}
        onCloseModal={() => setTimeSheetModalVisible(false)}
      />
    </Fragment>
  );
};

export default AuthorizedHeader;

const Container = styled('div')(({ theme }) => ({
  padding: "12px 45px",
  height: 62,
  background: "var(--header-dark)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  zIndex: 9,
  flexShrink: 0,
  [theme.breakpoints.down('md')]: {
    padding: "10px 20px",
  },
  [theme.breakpoints.down('sm')]: {
    padding: "10px 16px",
  },
}));

const NavLeftSideContainer = styled('div')`
  display: flex;
  align-items: center;
  & > a.logo {
    margin-top: -3px;
    height: 28px;
  }
`;

const NavContainer = styled('div')(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
  ul: {
    display: "flex",
    alignItems: "center",
    li: {
      marginTop: 8,
      height: 62,
      "a.active": {
        color: "var(--green)",
        borderBottom: "3px solid var(--green)"
      },
      a: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 58,
        color: "white",
        fontSize: 13,
        fontFamily: "'Aspira Wide Demi', 'FiraGO Medium'",
        padding: "20px 20px",
        borderBottom: "3px solid transparent",
        transition: "all 0.15s",
        ":hover": {
          color: "var(--green)",
          borderBottom: "3px solid var(--green)"
        },
      },
      ".with-icon": {
        position: "relative",
        display: "flex",
        gap: "10px",
        alignItems: "center",
        justifyContent: "center",
        height: 58,
        color: "white",
        fontFamily: "'Aspira Wide Demi', 'FiraGO Medium'",
        padding: "20px 20px",
        borderBottom: "3px solid transparent",
        transition: "all 0.15s",
        "& > svg": {
          position: 'absolute',
          right: "-12px"
        },
        ":hover": {
          color: "var(--green)",
          borderBottom: "3px solid var(--green)"
        },
      }
    },
  },
}));

const NavRightSideContainer = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  ".settings": {
    marginRight: 12,
    width: 36,
    height: 36,
    "& > svg": {
      width: 37,
      height: 37
    },
    "&:hover": { "& path:first-child": { fill: "#215549" } },
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  ".settings-active": { "& path:first-child": { fill: "#215549" } }
  
}));

const TrialInformerContainer = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  height: 36,
  marginRight: "16.6rem",
  backgroundColor: "#243844",
  borderRadius: 30,
  padding: "0 15px",
  textAlign: 'center',
  [theme.breakpoints.down('lg')]: {
    marginRight: 50,
  },
  "& > p": {
    color: "#FFFFFF",
    fontSize: 12,
    [theme.breakpoints.down('sm')]: {
      fontSize: 8,
    },
    "& > span": {
      fontSize: 12,
      fontFamily: "'Aspira Demi'",
      textDecoration: "underline",
      textTransform: "uppercase",
      color: "#FF9933",
      cursor: "pointer",
      [theme.breakpoints.down('sm')]: {
        fontSize: 9,
      },
    }
  }
}));

const CompanyActionsContainer = styled('div')(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    display: 'none'
  },
}));

const AccountMenuContainer = styled('div')(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

const HamburgerMenuContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 36,
  height: 36,
  backgroundColor: '#243844',
  borderRadius: 20,
  marginLeft: 12,
  cursor: 'pointer',
  "&:hover": { backgroundColor: "#215549" },
  [theme.breakpoints.up('lg')]: {
    display: 'none',
  },
}));

const ModalContentContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: #FFF;
  padding: 40px 50px;
`;

const ModalMainText = styled.p`
  margin-top: 25px;
  font-size: 13px;
  font-family: 'Aspira Demi', 'FiraGO Regular';
  color: #676767;
  text-align: center;
`;

const ModalSecondaryText = styled.div`
  margin-top: 10px;
  font-size: 12px;
  color: #676767;
  text-align: center;
  & > span {
    color: #339966;
    text-decoration: underline;
    cursor: pointer;
  }
`;