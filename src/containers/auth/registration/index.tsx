import { useEffect, useState, useCallback } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import styled from "@mui/system/styled";
import { useForm } from "react-hook-form";
import queryString from 'query-string';
import { useLocation } from "react-router-dom";
import { useMutation } from "react-query";
import { axiosInstance } from 'services/axios';
import { useToasts } from "react-toast-notifications";
import UniversalInput from "components/Input/UniversalInput";
import LoadingButton from "@mui/lab/LoadingButton";
import useMediaQuery from '@mui/material/useMediaQuery';
import { FORM_PATTERNS } from '../../../constants';
import UnauthorizedHeader from "partials/Header/unauthorizedHeader";
import EmailSent from './emailsent';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

import { ReactComponent as ArcIcon } from 'assets/svg/arc.svg';
import { ReactComponent as ToliaIcon } from 'assets/svg/tolia.svg'
import { ReactComponent as CloseIcon } from 'assets/svg/close-icon_thin.svg'
import { ReactComponent as RegistrationArt } from 'assets/svg/registration-art.svg'
import { useTranslation } from "react-i18next";
import ChangeLanguage from "components/ChangeLanguage";
const svgStringArc = encodeURIComponent(renderToStaticMarkup(<ArcIcon />));
const svgStringRegArt = encodeURIComponent(renderToStaticMarkup(<RegistrationArt />));

const ReCaptchaComponent = ({ setToken, loading, matchesQuery }: any) => {
  const { t } = useTranslation();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const handleReCaptchaVerify = useCallback(async () => {
    if (!executeRecaptcha) {
      console.log('Execute recaptcha not yet available');
      return;
    };

    const token = await executeRecaptcha('register');
    setToken(token);
  }, [executeRecaptcha, setToken]);

  useEffect(() => {
    handleReCaptchaVerify();
  }, [handleReCaptchaVerify]);

  return <LoadingButton
    loading={loading}
    size='large'
    sx={{ height: matchesQuery ? 40 : 50 }}
    onClick={handleReCaptchaVerify}
    type="submit"
    variant='contained'
  >
    {t('auth.registration.create_account')}
  </LoadingButton>;
};

const Registration = () => {
  const { addToast } = useToasts();
  const { search } = useLocation();
  const { t } = useTranslation();
  const queryParams = queryString.parse(search);
  const [isPasswordVisible, setPasswordVisible] = useState<boolean>(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [isSuccessRegister, setSuccessRegister] = useState<boolean>(false);
  const matchesQuery = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  const { mutate, isLoading } = useMutation<string[], any, any>((data) => axiosInstance.post("registration/sign_up", data), {
    onSuccess: () => setSuccessRegister(true),
    onError: (err) => {
      err?.response?.data?.errors?.forEach((item: any) => {
        addToast(item.message, {
          appearance: 'error',
          autoDismiss: true,
          placement: 'top-center'
        });
      });
    }
  });

  const { register, watch, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: queryParams?.email as string ?? '',
      password: '',
    }
  });

  const watchEmail = watch('email');
  const watchPassword = watch('password');

  const StatusImg = (data: any) => {
    return data.status ? <StyledToliaIcon /> : <CloseIcon />
  };

  const onRegistrationSubmit = (data: { email: string, password: string }) => {
    let formData = {
      email: data.email,
      password: data.password,
      captcha: captchaToken,
      plan: queryParams.plan ?? null,
      interval: queryParams.interval ?? null
    };

    mutate(formData);
  };

  if (isSuccessRegister) {
    return <div style={{ display: 'flex', flexDirection: 'column' }}>
      <UnauthorizedHeader />
      <EmailSent />
    </div>
  };

  return (
    <PageContainer>
      <UnauthorizedHeader />
      <ContentContainer>
        <FormContainer>
          <h2>{t('auth.registration.get_started')}</h2>
          {
            queryParams?.plan === 'core' ? 
              <p dangerouslySetInnerHTML={{ __html: t('auth.registration.trial_version') }}/>
            :
              <p dangerouslySetInnerHTML={{ __html: t('auth.registration.basic_package') }}/>
            }
            
          <FormFieldsContainer onSubmit={handleSubmit(onRegistrationSubmit)}>
            <UniversalInput
              size={matchesQuery ? "small" : "medium"}
              placeholder={t('auth.registration.placeholder_email')}
              visiblePlaceholder={watchEmail ? true : false}
              errorText={errors.email?.message}
              inputProps={{
                autoComplete: "email"
              }}
              {...register('email', { required: t('auth.registration.enter_email'), pattern: FORM_PATTERNS.email })}
            />
            <UniversalInput
              size={matchesQuery ? "small" : "medium"}
              placeholder={t('auth.registration.placeholder_password')}
              visiblePlaceholder={watchPassword ? true : false}
              withEyeAdornment
              onEyeAdornmentClick={() => setPasswordVisible(e => !e)}
              type={isPasswordVisible ? 'text' : 'password'}
              errorText={errors.password?.message}
              inputProps={{
                maxLength: 128,
                autoComplete: "new-password"
              }}
              {...register('password', {
                required: t('auth.registration.enter_password'),
                maxLength: 128,
                validate: (value) =>
                  FORM_PATTERNS.uppercase.value.test(value) &&
                  FORM_PATTERNS.lowercase.value.test(value) &&
                  FORM_PATTERNS.oneDigit.value.test(value) &&
                  FORM_PATTERNS.minEightChars.value.test(value)
              })}
            />
            {watchPassword && <div>
              <PasswordStatusContainer>
                <span>{t('validations.more_character', { count: 8 })}</span>
                <StatusImg status={watchPassword && watchPassword.match(FORM_PATTERNS.minEightChars.value)} />
              </PasswordStatusContainer>
              <PasswordStatusContainer>
                <span>{t('validations.uppercase')}</span>
                <StatusImg status={watchPassword && watchPassword.match(FORM_PATTERNS.uppercase.value)} />
              </PasswordStatusContainer>
              <PasswordStatusContainer>
                <span>{t('validations.lowercase')}</span>
                <StatusImg status={watchPassword && watchPassword.match(FORM_PATTERNS.lowercase.value)} />
              </PasswordStatusContainer>
              <PasswordStatusContainer>
                <span>{t('validations.at_least_number', {count: 1})} </span>
                <StatusImg status={watchPassword && watchPassword.match(FORM_PATTERNS.oneDigit.value)} />
              </PasswordStatusContainer>
            </div>}
            <ReCaptchaComponent setToken={setCaptchaToken} loading={isLoading} matchesQuery={matchesQuery} />
            <TOSContainer>
              {t('auth.registration.agree_creating_account')} <a target={'_blank'} rel="noreferrer" href='https://profesto.net/terms-of-service/'>
                {t('auth.registration.terms_conditions')}

                
              </a>
            </TOSContainer>
          </FormFieldsContainer>
          <LanguageContainer>
            <ChangeLanguage/>
          </LanguageContainer>
        </FormContainer>
      </ContentContainer>
    </PageContainer>
  );
};

export default Registration;


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
  alignItems: 'center',
  background: `url('data:image/svg+xml;utf8, ${svgStringRegArt}') right 60px bottom 80px /cover no-repeat`,
  backgroundSize: 450,
  [theme.breakpoints.down('lg')]: {
    background: 'none',
  },
}));

const FormContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  maxWidth: 525,
  padding: '10px 16px 40px 16px',
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
    fontSize: 18,
    color: '#676767',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 30,
    '& > b': {
      fontFamily: 'Aspira Demi',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: 10,
      marginTop: 8,
    },
  }
}));

const FormFieldsContainer = styled('form')`
  display: flex;
  flex-flow: column;
  gap: 20px;
`;
const LanguageContainer = styled('div')`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
`;
const TOSContainer = styled('div')`
  text-align: center;
  font-size: 12px;
  color: #172B37;
  & > a {
    font-family: 'Aspira Demi', 'FiraGO Regular';
    text-decoration: underline;
    cursor: pointer;
  }
`;

const StyledToliaIcon = styled(ToliaIcon)`
  & path {
      fill: #339966;
  }
`;

const PasswordStatusContainer = styled('div')`
  span {
    margin-right: 8px;
    margin-bottom: 6px;
    display: inline-block;
    width: 130px;
  }
`;


