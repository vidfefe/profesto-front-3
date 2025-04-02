import { useEffect } from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { AuthLayoutRoute, MainLayoutRoute, UniversalLayoutRoute } from './layout'
import {
  Login,
  Registration,
  Recover,
  Reset,
  Invite,
  ConfirmRegisterToken,
  Locked,
  People,
  CreatePerson,
  Employee,
  PeopleList,
  Onboarding,
  OnboardingUpdate,
  OnboardingReview,
  TimeOffRequest
} from "./containers";
import { useQueryClient } from 'react-query';
import { getCurrentUser } from "./services";
import { useDispatch } from "react-redux";
import { setDomain, setCurrentUser, setToken } from "./redux/authSlice";
import { Settings } from "./containers/Settings";
import { Reports } from "./containers/Reports";
import { TestComponents } from "./containers/TestComponents";
import RedirectPage from "partials/PageHolders/Redirect";
import UnderConstruction from "partials/PageHolders/UnderConstruction";
import { usePermissionGate } from "permissions/usePermissionGate";
import smartlookClient from 'smartlook-client';
import mixpanel from 'mixpanel-browser';
import { Timesheet } from "containers/Timesheet";
import { Payroll } from "containers/Payroll";
import { RegularPayroll } from "containers/Payroll/RegularPayroll";
import { AdvancePayment } from "containers/Payroll/AdvancePayment";
import { setCompanyFeatures } from "redux/companySlice";
import { CompanyFeatures } from "types";
import useQuery from "hooks/useQueryCustom";

const Routes = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const { role, status, isRegFinished } = usePermissionGate();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      smartlookClient.init(process.env.REACT_APP_SMARTLOOK_KEY as string);
      smartlookClient.record({ forms: true, numbers: true, emails: false, ips: true });
    }
    mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN as string, { debug: process.env.NODE_ENV !== 'development' ? true : false });
  }, []);

  useEffect(() => {
    if (token) {
      dispatch(setToken(token));
      getCurrentUser().then( async res => {
        dispatch(setDomain(res.data.company.id));
        dispatch(setCurrentUser(res.data));
        queryClient.invalidateQueries('subscription_info');
      });
    }
  }, [dispatch, queryClient, token]);

  const { data, isLoading: companyFeaturesLoading } = useQuery<CompanyFeatures>(
    ['company_features', token],
    {
      endpoint: '/company_feature',
      options: { method: 'get' },
    },
    {
      onSuccess: (data) => {
        dispatch(
          setCompanyFeatures({
            payroll: data.payroll,
            time_tracking: data.time_tracking,
          })
        );
      },
      enabled: !!token,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/confirmregistration" component={ConfirmRegisterToken} />
        <Route path="/redirect" component={RedirectPage} />

        <AuthLayoutRoute path="/login" component={Login} />
        <AuthLayoutRoute path="/locked" component={Locked} />
        <AuthLayoutRoute path="/reset" component={Reset} />
        <AuthLayoutRoute path="/invite" component={Invite} />
        <AuthLayoutRoute path="/signup" component={Registration} />
        <AuthLayoutRoute path="/recover" component={Recover} />
        <UniversalLayoutRoute path="/privacy" component={UnderConstruction} />
        <UniversalLayoutRoute path="/terms" component={UnderConstruction} />
        <UniversalLayoutRoute path="/time-off" component={TimeOffRequest} />
        {isRegFinished === false ?
          <Switch>
            <MainLayoutRoute key={1} path="/list" component={PeopleList} />
            <Redirect to="/list" />
          </Switch>
          : status === 'onboarding' ?
            <Switch>
              <MainLayoutRoute path="/onboarding" component={Onboarding} />
              <Redirect to="/onboarding" />
            </Switch>
            :
            <Switch>
              <MainLayoutRoute path={["/", "/people"]} exact component={People} />
              {
                role !== 'employee' && (
                  role === 'manager' ?
                    <MainLayoutRoute path="/timesheet" component={Timesheet} /> :
                    [
                      <MainLayoutRoute key={1} path="/list" component={PeopleList} />,
                      <MainLayoutRoute key={2} path="/createperson" component={CreatePerson} />,
                      <MainLayoutRoute key={3} path="/settings" component={Settings} />,
                      <MainLayoutRoute key={4} path="/onboarding/update/:id" component={OnboardingUpdate} />,
                      <MainLayoutRoute key={5} path="/onboarding/review/:id" component={OnboardingReview} />,
                      <MainLayoutRoute key={6} path="/timesheet" component={Timesheet} />,
                    ].concat((companyFeaturesLoading || data?.payroll) ? [
                      <MainLayoutRoute exact key={7} path="/payroll" component={Payroll} />,
                      <MainLayoutRoute exact key={8} path="/payroll/:id" component={RegularPayroll} />,
                      <MainLayoutRoute exact key={9} path="/advance_payment_document/:id" component={AdvancePayment} />
                    ] : [])
                )
              },
              <MainLayoutRoute
                path={role === 'employee' ? ["/myinfo"] : ["/employee/:id", "/myinfo"]}
                component={Employee}
              />
              <MainLayoutRoute path="/reports" component={Reports} />
              <MainLayoutRoute path="/components" component={TestComponents} />
              <Redirect to="/" />
            </Switch>}
      </Switch>
    </BrowserRouter>
  );
};

export default Routes;