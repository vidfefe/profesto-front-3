import { useEffect, useState } from "react";
import styled from "styled-components";
import { Link, useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { useDispatch } from "react-redux";
import { setDomain, setCurrentUser } from "redux/authSlice";
import { ConfirmRegisterTokenService, getCurrentUser } from 'services'
import { saveStorageObject } from 'utils/storage';
import MainErrorBox from 'components/error/mainError';
import FormContainerTemplate from "../FormContainer";
import CircularProgress from "@mui/material/CircularProgress";
import { setAuthorizationToken } from 'services/mainAxios';

import { ReactComponent as ProfestoLogo } from 'assets/svg/profesto_logo.svg';
import { ReactComponent as ArrowIcon } from 'assets/svg/arrow.svg';
import { useTranslation } from "react-i18next";

const ConfirmRegisterToken = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();
  let params: any = queryString.parse(location.search)
  const [errorText, setErrorText] = useState('');
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const [errorDesc, setErrorDesc] = useState<string>('');

  useEffect(() => {
    if (params['token']) {
      ConfirmRegisterTokenService(params['token']).then(res => {
        setAuthorizationToken(res.data.token);
        saveStorageObject('token', res.data.token)
        saveStorageObject('refresh_token', res.data.refresh_token);
        getCurrentUser().then(res => {
          dispatch(setDomain(res.data.company.id));
          dispatch(setCurrentUser(res.data));
        })
        history.push({
          pathname: '/people'
        })
      }).catch(err => {
        if (err.response.data.errors[0].code === 10) {
          return history.push('/login', { alreadyConfirmed: err.response.data.errors[0].message })
        }
        setLoading(false)
        setErrorText(err.response.data.errors[0].message)
        if (err.response.data.errors[0].code === 6) {
          setErrorDesc(t('auth.registration.confirmToken.account_activation_email'));
        }
      });
    } else {
      history.push('/login');
    }
  }, [])


  if (loading) {
    return <LoadingContainer>
      <CircularProgress />
    </LoadingContainer>
  };

  return (
    <FormContainerTemplate>
      <FormTopContainer>
        <ProfestoLogo
          width={274}
          height={56}
          id='profesto_logo'
        />
      </FormTopContainer>
      {errorText && <>
        <MainErrorBox type='error' text={errorText} />
        {errorDesc ? <p
          style={{ marginTop: 40, marginBottom: 40, textAlign: 'left', fontSize: 13, color: '#000' }}>
          {errorDesc}
        </p> : null}
        <InformationContainer>
          <ul>
            <li>{t('auth.registration.confirmToken.with_app')} <br /> {t('auth.registration.confirmToken.please')} <Link to='signup'>{t('auth.registration.confirmToken.register_again')}</Link> </li>
            <li>{t('auth.registration.confirmToken.want_to_login')} <br /> {t('auth.registration.confirmToken.please_visit_our')} <Link to='login'>{t('auth.registration.confirmToken.login_page')}</Link></li>
          </ul>
        </InformationContainer>
        {errorText === 'Link has expired' && <p >{t('auth.registration.confirmToken.account_activation_email')}</p>}
      </>}
      {!errorText ? <BackButton to='login'><StyledArrowIcon /> {t('button.back_sign_in')}</BackButton> : null}
    </FormContainerTemplate >
  );
};

export default ConfirmRegisterToken;

const StyledArrowIcon = styled(ArrowIcon) <{ direction?: string, fill?: string }>`
    margin-right: 5px;
    & path {
        fill: #396;
    }
    transform: rotate(90deg);
`;

const FormTopContainer = styled.div`
  margin-bottom: 44px;
  text-align: center;
`;

const InformationContainer = styled.div`
  ul {
    margin-top: 30px;
    padding-left: 30px;

    li {
      position: relative;
      text-align: left;
      margin-bottom: 30px;
      color: var(--dark-gray);
      font-size: 13px;
      line-height: 24px;

      &:after {
        content: '';
        background: #99CC33;
        width: 14px;
        height: 14px;
        top: 5px;
        position: absolute;
        border-radius: 50%;
        left: -30px;
      }
    }
  }
  a {
    text-decoration: underline;
    &:hover {
      color: #FF9933;
    }
  }
`;

const BackButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--green);
  margin-top: 20px;
  text-transform: uppercase;
`;

const LoadingContainer = styled.div`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
`;


