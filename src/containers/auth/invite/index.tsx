import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { useDispatch } from "react-redux";
import { useToasts } from "react-toast-notifications";
import LoadingButton from "@mui/lab/LoadingButton";
import MainErrorBox from 'components/error/mainError';
import UniversalInput from "components/Input/UniversalInput";
import FormContainerTemplate from "../FormContainer";
import {
    confirmInviteTokenService,
    getCurrentUser,
    checkInviteToken
} from 'services';
import { FORM_PATTERNS } from "../../../constants";
import { saveStorageObject } from "utils/storage";
import { setAuthorizationToken } from 'services/mainAxios';
import { setDomain, setCurrentUser } from "redux/authSlice";

import { ReactComponent as ProfestoLogo } from 'assets/svg/profesto_logo.svg';
import { ReactComponent as ToliaIcon } from 'assets/svg/tolia.svg'
import { ReactComponent as CloseIcon } from 'assets/svg/close-icon_thin.svg'
import { useTranslation } from "react-i18next";
import ChangeLanguage from "components/ChangeLanguage";

type Inputs = {
    password: any,
    confirmPassword: string
};

const StatusImg = (data: any) => {
    return data.status ? <StyledToliaIcon /> : <CloseIcon />
};

const Invite = () => {
    const { t } = useTranslation();
    const history = useHistory();
    const { addToast } = useToasts();
    const dispatch = useDispatch();
    const { register, trigger, handleSubmit, watch, formState: { errors } } = useForm<Inputs>({
        defaultValues: {
            password: '',
            confirmPassword: ''
        }
    });

    const location = useLocation();
    let params = queryString.parse(location.search);
    const [companyName, setCompanyName] = useState<string>('');
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
        confirmInviteTokenService(params['token'], data.password,).then(res => {
            if (res.data.token) {
                setTimeout(() => {
                    addToast(t('auth.invite.your_password_has_been_updated'), {
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
        checkInviteToken(params['token']).then((res: any) => {
            setCompanyName(res.data.company_name)
        }).catch((err) => {
            setIsInvalid(true);
            setErrorText(err.response.data.errors[0].message);
            if (err.response.data.errors[0].code === 6) {
                setErrorDesc(t('auth.invite.than_hours_since'));
            } else {
                setErrorDesc(t('auth.invite.link_is_invalid'));
            }
        })
    }, []);

    useEffect(() => {
        if (watchConfirmPassword) {
            trigger("confirmPassword");
        }
    }, [watchPassword, trigger, watchConfirmPassword]);

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
                {companyName && <h3>
                    {t('auth.invite.welcome_to_in', {companyName: companyName})}<br />
                    {t('auth.invite.get_started')}
                </h3>}
            </FormTopContainer>
            {errorText && <MainErrorBox
                type={errorType}
                text={errorText}
            />}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ marginBottom: 22 }}>
                    <UniversalInput
                        maxLength='128'
                        placeholder={t('auth.invite.password')}
                        size='medium'
                        withEyeAdornment={true}
                        onEyeAdornmentClick={() => setShowPassword(!showPassword)}
                        type={showPassword ? `text` : 'password'}
                        errorText={errors.password ? errors.password.message : '' as any}
                        {...register("password", {
                            maxLength: 128,
                            required: t('validations.please_enter_valid_password'), validate: (value) =>
                                FORM_PATTERNS.uppercase.value.test(value) &&
                                FORM_PATTERNS.lowercase.value.test(value) &&
                                FORM_PATTERNS.oneDigit.value.test(value) &&
                                FORM_PATTERNS.minEightChars.value.test(value)
                        })}
                    />
                </div>
                <div style={{ marginBottom: 22 }}>
                    <UniversalInput
                        maxLength='128'
                        size='medium'
                        placeholder={t('auth.invite.confirm_password')}
                        withEyeAdornment={true}
                        onEyeAdornmentClick={() => setShowPassword(!showPassword)}
                        errorText={errors.confirmPassword ? errors.confirmPassword.message : ''}
                        type={showPassword ? `text` : 'password'} {...register("confirmPassword", {
                            required: t('validations.please_enter_valid_password'),
                            maxLength: 128,
                            validate: value => {
                                if (watchPassword !== value) {
                                    return t('validations.do_not_match');
                                }
                            }
                        })}
                    />
                </div>
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
                        <span>{t('validations.at_least_number', {count: 1})} </span>
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
                    {t('auth.invite.set_password')}
                </LoadingButton>
                <LanguageContainer>
                    <ChangeLanguage/>
                </LanguageContainer>
            </form>
        </FormContainerTemplate>
    );
};

export default Invite;

const StyledToliaIcon = styled(ToliaIcon)`
    & path {
        fill: #339966;
    }
`;

const FormTopContainer = styled.div`
  margin-bottom: 44px;
  text-align: center;
  p {
    color: var(--dark-gray);
    margin-top: 20px;
    }
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

const LanguageContainer = styled.div `
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
`