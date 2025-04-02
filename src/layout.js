import styled from "styled-components";
import { isEmpty } from "lodash";
import { Route, Redirect } from 'react-router-dom';
import { useSelector } from "react-redux";
import { currentUserSelector, companyFeaturesSelector } from "redux/selectors";
import CircularProgress from '@mui/material/CircularProgress';
import AuthorizedHeader from "./partials/Header/authorizedHeader";
import OnboardingHeader from "partials/Header/OnboardingHeader";
import { usePermissionGate } from "permissions/usePermissionGate";
import Footer from "./partials/Footer";
import { getToken } from "./utils/storage";

const MainLayout = ({ children }) => {
  const currentUser = useSelector(currentUserSelector);
  const companyFeatures = useSelector(companyFeaturesSelector);

  const { status } = usePermissionGate();
  return (
    <Wrapper>
      {!isEmpty(currentUser) && !isEmpty(companyFeatures) ? (
        <>
          {status === 'onboarding' ? <OnboardingHeader /> : <AuthorizedHeader />}
          <ContentContainer>{children}</ContentContainer>
          <Footer />
        </>
      ) : (
        <LoadingScreenContainer>
          <CircularProgress thickness={4} />
        </LoadingScreenContainer>
      )}
    </Wrapper>
  );
};

const MainLayoutRoute = ({ component: Component, ...rest }) => {
  const token = getToken();
  return (
    <Route
      {...rest}
      render={(props) =>
        token ?
          <MainLayout>
            <Component {...props} />
          </MainLayout>
          : <Redirect to="/login" />
      }
    />
  );
};

const AuthLayout = ({ children }) => {
  return (
    <Wrapper>
      <ContentContainer>{children}</ContentContainer>
      <Footer />
    </Wrapper>
  );
};

const AuthLayoutRoute = ({ component: Component, ...rest }) => {
  const token = getToken();
  return (
    <Route {...rest} render={props => (
      !token ? <AuthLayout>
        <Component {...props} />
      </AuthLayout> : <Redirect to={'/'} />
    )} />
  )
};

const UniversalLayoutRoute = ({ component: Component, ...rest }) => {
  const token = getToken();
  return (
    <Route {...rest} render={props => (
      !token ? <AuthLayout>
        <Component {...props} />
      </AuthLayout> : <MainLayout>
        <Component {...props} />
      </MainLayout>
    )} />
  )
};

export { AuthLayoutRoute, MainLayoutRoute, UniversalLayoutRoute };

const LoadingScreenContainer = styled.div`
   display: flex;
   justify-content: center;
   align-items: center;
   flex: 1;
`;

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: auto;
  overflow: overlay;
  & > * {
    flex: 1
  }
`;
