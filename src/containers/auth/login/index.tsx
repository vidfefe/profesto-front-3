import { useEffect, useState } from "react";
import styled from "styled-components";
import queryString from "query-string";
import { useForm } from "react-hook-form";
import { Link, useHistory, useLocation } from 'react-router-dom';
import UniversalInput from "components/Input/UniversalInput";
import MainErrorBox from 'components/error/mainError';
import LoadingButton from "@mui/lab/LoadingButton";
import { getCurrentUser, LoginService, UpdateLocales } from 'services'
import { saveStorageObject } from 'utils/storage'
import { setAuthorizationToken } from 'services/mainAxios';
import { useDispatch } from "react-redux";
import { setDomain, setToken, setCurrentUser } from "redux/authSlice";
import FormContainerTemplate from "../FormContainer";
import { useTranslation } from "react-i18next";
import { ReactComponent as ProfestoLogo } from 'assets/svg/profesto_logo.svg';
import ChangeLanguage from "components/ChangeLanguage";


const Login = (props: any) => {
  const { t, i18n } = useTranslation('translation', { keyPrefix: 'auth.login' });


  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorType, setErrorType] = useState<string>('error');
  const [showError, setShowError] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>(t('validation_text'));
  const [isPass, setIsPass] = useState(true);
  const dispatch = useDispatch();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const history = useHistory();
  const watchEmail = watch('email', false);
  const watchPassword = watch('password', false)
  const location = useLocation();
  let params = queryString.parse(location.search);

  const onSubmit = (data: any) => {
    setIsLoading(true);
    setShowError(false);
    
    LoginService(data.email, data.password, params['c']).then(res => {
      saveStorageObject('token', res.data.token);
      saveStorageObject('refresh_token', res.data.refresh_token);
      setAuthorizationToken(res.data.token);
      dispatch(setToken(res.data.token));
      getCurrentUser().then( async res => {
        dispatch(setDomain(res.data.company.id));
        dispatch(setCurrentUser(res.data));
        if (res.data.locale) {
          UpdateLocales(i18n.language);
        }
      })
      setTimeout(() => {
        history.push(params.c && params.to ? `/redirect/link?c=${params.c}&to=${params.to}` : '/people');
      }, 100)

    }).catch((err) => {
      setValue('password', '');
      if (err?.response?.data?.errors?.[0].code === 2) {
        setErrorText(err.response.data.errors[0].message);
        setErrorType('warning');
        setShowError(true);
        setIsLoading(false);
      } else if (err?.response?.data?.errors?.[0].code === 3) {
        history.push({
          pathname: '/locked',
          state: { email: data.email }
        });
      } else {
        setErrorText(err.response.data.errors[0].message);
        setErrorType('warning');
        setShowError(true);
        setIsLoading(false);
      }
    })
  };

  useEffect(() => {
    if (props.location && props.location.state && props.location.state.fromUnlock) {
      setErrorText(t('account_unlocked'));
      setErrorType('success');
      setShowError(true);
    } else if (props.location && props.location.state && props.location.state.fromReset) {
      setErrorText(t('password_reset_successfully'));
      setErrorType('success');
      setShowError(true);
    } else if (props.location && props.location.state && props.location.state.fromActivation) {
      setErrorText(t('account_successfully_activated'));
      setErrorType('success');
      setShowError(true);
    } else if (props.location && props.location.state && props.location.state.fromRecovery) {
      setErrorText(t('check_your_email'));
      setErrorType('success');
      setShowError(true);
    } else if (props?.location?.state?.alreadyConfirmed) {
      setErrorText(props.location.state.alreadyConfirmed);
      setErrorType('warning');
      setShowError(true);
    } else if (props?.location?.state?.unlockLinkInvalid) {
      setErrorText(props.location.state.unlockLinkInvalid);
      setErrorType('error');
      setShowError(true);
    }
  }, [props.location, t])

  useEffect(() => {
    if (errors.email || errors.password) {
      setErrorText(t('validation_text'));
      setErrorType('error');
    }
  }, [errors.email, errors.password, t]);

  return (
    <FormContainerTemplate>
      <FormTopContainer>
        <ProfestoLogo
          width={274}
          height={56}
          id='profesto_logo'
        />
        <p>{t('dont_have_an_account')} <Link to='signup'>{t('sign_up')}</Link></p>
      </FormTopContainer>

      {!!(errors.email || errors.password || showError) && <MainErrorBox
        type={errorType}
        text={errorText.replaceAll("<br/>", "\n")}
      />}

      <form onSubmit={handleSubmit(onSubmit)}>
        <UniversalInput
          placeholder={t('email')}
          visiblePlaceholder={watchEmail ? true : false}
          size='medium'
          style={{ marginBottom: 22 }}
          {...register("email", { required: true })}
        />
        <UniversalInput
          size='medium'
          placeholder={t('password')}
          type={isPass ? 'password' : 'text'}
          withEyeAdornment={true}
          onEyeAdornmentClick={() => setIsPass(!isPass)}
          visiblePlaceholder={watchPassword ? true : false}
          style={{ marginBottom: 22 }}
          {...register("password", { required: true })}
        />
        <ForgotPasswordLink to={{ pathname: 'recover', state: { email: watchEmail } }}>{t('forgot_password')}</ForgotPasswordLink>
        <LoadingButton
          loading={isLoading}
          sx={{ marginTop: 3, fontSize: 12, padding: 2 }}
          fullWidth
          variant='contained'
          type="submit"
        >
          {t('login')}
        </LoadingButton>
      </form>
      <LanguageContainer>
      <ChangeLanguage/>
      </LanguageContainer>
    </FormContainerTemplate>
  );
};

export default Login;
const LanguageContainer = styled.div `
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
`
const FormTopContainer = styled.div`
  margin-bottom: 44px;
  text-align: center;
  p {
    color: var(--dark-gray);
    margin-top: 20px;
    & > a {
      font-family: 'Aspira Demi', 'FiraGO Regular';
      color: var(--green)
    }
  }
`;

const ForgotPasswordLink = styled(Link)`
  color: var(--dark-gray);
  text-decoration: underline;
`;
