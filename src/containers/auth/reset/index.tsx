import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { Link, useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { useDispatch } from "react-redux";
import { useToasts } from "react-toast-notifications";
import { ReactComponent as ProfestoLogo } from 'assets/svg/profesto_logo.svg';
import LoadingButton from "@mui/lab/LoadingButton";
import MainErrorBox from 'components/error/mainError';
import UniversalInput from "components/Input/UniversalInput";
import FormContainerTemplate from "../FormContainer";
import { checkRecoveryToken, ResetPasswordService, getCurrentUser } from '../../../services';
import { FORM_PATTERNS } from "../../../constants";
import { saveStorageObject } from "../../../utils/storage";
import { setAuthorizationToken } from 'services/mainAxios';
import { setDomain, setCurrentUser } from "../../../redux/authSlice";

import { ReactComponent as ArrowIcon } from 'assets/svg/arrow.svg';
import { ReactComponent as ToliaIcon } from 'assets/svg/tolia.svg'
import { ReactComponent as CloseIcon } from 'assets/svg/close-icon_thin.svg'
import { useTranslation } from "react-i18next";

type Inputs = {
    password: any,
    confirmPassword: string
};

const StatusImg = (data: any) => {
    return data.status ? <StyledToliaIcon /> : <CloseIcon />
};

const Reset = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const { addToast } = useToasts();
    const dispatch = useDispatch();
    const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>({
        defaultValues: {
            password: '',
            confirmPassword: ''
        }
    });

    const location = useLocation();
    let params = queryString.parse(location.search);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorType, setErrorType] = useState<string>('error');
    const [errorText, setErrorText] = useState<string>('');
    const [errorDesc, setErrorDesc] = useState<string>('');

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isInvalid, setIsInvalid] = useState(false);

    const watchPassword = watch("password");
    const watchConfirmPassword = watch("confirmPassword");
    const passwordRef = useRef({});
    passwordRef.current = watch("password", "");

    const onSubmit = (data: Inputs) => {
        setIsLoading(true);
        setErrorText('');
        ResetPasswordService(params['token'], data.password,).then(res => {
            if (res.data.token) {
                setTimeout(() => {
                    addToast(t('auth.reset.updated_successfully'), {
                        appearance: 'success',
                        autoDismiss: true
                    });
                }, 200);
                setAuthorizationToken(res.data.token);
                saveStorageObject('token', res.data.token);
                saveStorageObject('refresh_token', res.data.refresh_token);
                getCurrentUser().then(res => {
                    dispatch(setDomain(res.data.company.id));
                    dispatch(setCurrentUser(res.data));
                });
                history.push({
                    pathname: '/people',
                    state: { fromReset: true }
                })
            }
            setIsLoading(false);
        }).catch((err) => {
            setErrorText(err.response.data.errors[0].message);
            setErrorType('error');
            setIsLoading(false);
        })
    };

    useEffect(() => {
        checkRecoveryToken(params['token']).then((res) => {
        }).catch((err) => {
            setIsInvalid(true);
            setErrorText(err.response.data.errors[0].message);
            if (err.response.data.errors[0].code === 6) {
                setErrorDesc(t('auth.reset.sent_your_password'));
            }
        })
    }, []);

    if (isInvalid) {
        return <FormContainerTemplate>
            <FormTopContainer>
                <ProfestoLogo
                    width={274}
                    height={56}
                    id='profesto_logo'
                />
            </FormTopContainer>
            <MainErrorBox
                type={errorType}
                text={errorText}
            />
            {errorDesc ? <p
                style={{ margin: '40px', textAlign: 'left', fontSize: 13, color: '#000' }}>
                {errorDesc}
            </p> : null}
            <LoadingButton
                loading={isLoading}
                onClick={() => history.push('/recover')}
                sx={{ marginTop: 3, fontSize: 12, padding: 2 }}
                fullWidth
                variant="contained"
            >
                {t('auth.reset.request_link')}
            </LoadingButton>
        </FormContainerTemplate>
    };

    return (
        <FormContainerTemplate>
            <FormTopContainer>
                <ProfestoLogo
                    width={274}
                    height={56}
                    id='profesto_logo'
                />
                <h3>{t('auth.reset.password_secure')}</h3>
            </FormTopContainer>
            {errorText && <MainErrorBox
                type={errorType}
                text={errorText}
            />}
            <form onSubmit={handleSubmit(onSubmit)}>
                <UniversalInput
                    maxLength='128'
                    placeholder={t('auth.reset.pass_placeholder')}
                    size='medium'
                    withEyeAdornment={true}
                    onEyeAdornmentClick={() => setShowPassword(!showPassword)}
                    type={showPassword ? `text` : 'password'}
                    errorText={errors.password ? errors.password.message : '' as any}
                    {...register("password", {
                        maxLength: 128,
                        required: t('auth.reset.required'), validate: (value) =>
                            FORM_PATTERNS.uppercase.value.test(value) &&
                            FORM_PATTERNS.lowercase.value.test(value) &&
                            FORM_PATTERNS.oneDigit.value.test(value) &&
                            FORM_PATTERNS.minEightChars.value.test(value)
                    })}
                    style={{ marginBottom: 22 }}
                />
                <UniversalInput
                    maxLength='128'
                    size='medium'
                    placeholder={t('auth.reset.confirm_pass_placeholder')}
                    withEyeAdornment={true}
                    onEyeAdornmentClick={() => setShowPassword(!showPassword)}
                    errorText={errors.confirmPassword ? errors.confirmPassword.message : ''}
                    type={showPassword ? `text` : 'password'} {...register("confirmPassword", {
                        required: t('auth.reset.required'),
                        maxLength: 128,
                        validate: value =>
                            value === watchPassword || t('auth.reset.password_validation')
                    })}
                    style={{ marginBottom: 22 }}
                />
                {watchPassword && <>
                    <PasswordStatusContainer>
                        <span>
                            {t('validations.more_character', { count: 8 })}
                        </span>
                        <StatusImg status={watchPassword && watchPassword.match(FORM_PATTERNS.minEightChars.value)} />
                    </PasswordStatusContainer>
                    <PasswordStatusContainer>
                        <span>{t('validations.uppercase')} </span>
                        <StatusImg status={watchPassword && watchPassword.match(FORM_PATTERNS.uppercase.value)} />
                    </PasswordStatusContainer>
                    <PasswordStatusContainer>
                        <span> {t('validations.lowercase')} </span>
                        <StatusImg status={watchPassword && watchPassword.match(FORM_PATTERNS.lowercase.value)} />
                    </PasswordStatusContainer>
                    <PasswordStatusContainer>
                        <span> {t('validations.at_least_number', {count: 1})} </span>
                        <StatusImg status={watchPassword && watchPassword.match(FORM_PATTERNS.oneDigit.value)} />
                    </PasswordStatusContainer>
                    <PasswordStatusContainer>
                        <span>{t('validations.passwords_match')} </span>
                        <StatusImg status={watchPassword === watchConfirmPassword} />
                    </PasswordStatusContainer>
                </>}
                <LoadingButton
                    loading={isLoading}
                    sx={{ marginTop: 3, fontSize: 12, padding: 2 }}
                    fullWidth
                    type="submit"
                    variant="contained"
                >
                    {t('auth.reset.set_password')}
                </LoadingButton>
            </form>
            <BackButton to='login'><StyledArrowIcon /> {t('button.back_sign_in')}</BackButton>
        </FormContainerTemplate>
    );
};

export default Reset;

const StyledArrowIcon = styled(ArrowIcon) <{ direction?: string, fill?: string }>`
    margin-right: 5px;
    & path {
        fill: #396;
    }
    transform: rotate(90deg);
`;

const StyledToliaIcon = styled(ToliaIcon)`
    & path {
        fill: #339966;
    }
`;

const FormTopContainer = styled.div`
  margin-bottom: 44px;
  text-align: center;
  h3 {
    color: var(--dark-gray);
    max-width: 80%;
    font-family: 'Aspira Regular';
    font-weight:  900;
    font-size: 1.4rem;
    line-height: 2.2rem;
    margin: 20px auto 0;
    }
`;

const PasswordStatusContainer = styled.div`
    span {
      margin-right: 8px;
      margin-bottom: 6px;
      display: inline-block;
      width: 130px;
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
