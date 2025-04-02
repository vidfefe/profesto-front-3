import { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useForm } from "react-hook-form";
import useMutationCustom from 'hooks/useMutationCustom';
import DialogModal from 'components/Modal/Dialog';
import UniversalInput from 'components/Input/UniversalInput';
import MainErrorBox from 'components/error/mainError';
import LoadingButton from '@mui/lab/LoadingButton';
import { useToasts } from "react-toast-notifications";
import EmployeeInfoHeader from 'containers/Employee/editHeader';
import { FORM_PATTERNS } from "../../../constants";

import { ReactComponent as ToliaIcon } from 'assets/svg/tolia.svg'
import { ReactComponent as CloseIcon } from 'assets/svg/close-icon_thin.svg'
import { useTranslation } from "react-i18next";

interface IChangePasswordProps {
    isOpen: boolean,
    closeModal: () => void,
    employeeName: string,
    employeePic: string,
    employeeInfo: any, //no time to desc.
};

type TChangePasswordInputs = {
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
};
type TMutationData = { errors?: [{ message: string }] };
type TMutationArgs = { old_password: string, password: string, password_confirmation: string };

const StatusImg = (data: any) => {
    return data.status ? <StyledToliaIcon /> : <CloseIcon />
};

export default function ChangePassword({ isOpen, closeModal, employeeName, employeePic, employeeInfo }: IChangePasswordProps) {
    const { t } = useTranslation();
    const { mutate: changePassword, isLoading } = useMutationCustom<string[], TMutationData, TMutationArgs>(["change_password"], {
        endpoint: 'umg/password', options: { method: "post" },
    }, {
        onSuccess: () => {
            closeModal();
            addToast(t('headers.authorized.changePassword.your_password_changed'), {
                appearance: 'success',
                autoDismiss: true
            });
        },
        onError: (e) => { setErrorBoxText(e.errors?.[0].message ?? ''); reset({}, { keepDirty: false }); }
    });

    const { addToast } = useToasts();
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [errorBoxText, setErrorBoxText] = useState<string>('');
    const { register, handleSubmit, watch, reset, formState: { errors, isDirty } } = useForm<TChangePasswordInputs>({
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
    });
    const watchCurrentPassword = watch('currentPassword');
    const watchPassword = watch("newPassword");
    const watchConfirmPassword = watch("confirmPassword");

    useEffect(() => { return () => { reset(); setErrorBoxText(''); } }, [reset, isOpen]);

    const onSubmit = ({ currentPassword, newPassword, confirmPassword }: TChangePasswordInputs) => {
        changePassword({
            old_password: currentPassword,
            password: newPassword,
            password_confirmation: confirmPassword
        })
    };

    const onError = (err: any) => {
        if (err) {
            addToast(<ToastContentContainer dangerouslySetInnerHTML={{ __html: t('headers.authorized.changePassword.please_fix_Highlighted')}}/>, {
                appearance: 'error',
                autoDismiss: true,
                placement: 'top-center'
            });
        }
    };

    return (
        <DialogModal
            open={isOpen}
            title={t('headers.authorized.changePassword.change_password')}
            onClose={closeModal}
            nominalHeader={
                <EmployeeInfoHeader
                    employeeName={employeeName}
                    avatarUuid={employeePic}
                    jobData={employeeInfo}
                    withoutLink={true}
                />
            }
            upperPosition
        >
            <Fragment>
                <ContentContainer>
                    <HeaderSectionContainer>
                        <HeaderText>{t('headers.authorized.changePassword.change_account_password')}</HeaderText>
                        <SecondaryHeaderText>{t('headers.authorized.changePassword.make_password_secure')}</SecondaryHeaderText>
                    </HeaderSectionContainer>
                    {errorBoxText && !isDirty && <div style={{ width: 400 }}><MainErrorBox
                        type='error'
                        text={errorBoxText}
                    /></div>}
                    <form onSubmit={handleSubmit(onSubmit, onError)}>
                        <InputContainer>
                            <UniversalInput
                                visiblePlaceholder={watchCurrentPassword ? true : false}
                                maxLength='128'
                                placeholder={t('headers.authorized.changePassword.password')}
                                size='small'
                                withEyeAdornment={true}
                                onEyeAdornmentClick={() => setShowPassword(!showPassword)}
                                type={showPassword ? 'text' : 'password'}
                                errorText={errors.currentPassword ? errors.currentPassword.message : ''}
                                {...register("currentPassword", { maxLength: 128, required: t('headers.authorized.changePassword.enter_current_password') })} />
                        </InputContainer>
                        <InputContainer>
                            <UniversalInput
                                visiblePlaceholder={watchPassword ? true : false}
                                maxLength='128'
                                placeholder={t('headers.authorized.changePassword.new_password')}
                                size='small'
                                withEyeAdornment={true}
                                onEyeAdornmentClick={() => setShowPassword(!showPassword)}
                                type={showPassword ? 'text' : 'password'}
                                errorText={errors.newPassword ? errors.newPassword.message : ''}
                                {...register("newPassword", {
                                    maxLength: 128,
                                    required: t('headers.authorized.changePassword.please_enter_valid_password'), validate: (value) =>
                                        FORM_PATTERNS.uppercase.value.test(value) &&
                                        FORM_PATTERNS.lowercase.value.test(value) &&
                                        FORM_PATTERNS.oneDigit.value.test(value) &&
                                        FORM_PATTERNS.minEightChars.value.test(value)
                                })} />
                        </InputContainer>
                        <InputContainer>
                            <UniversalInput
                                visiblePlaceholder={watchConfirmPassword ? true : false}
                                maxLength='128'
                                size='small'
                                placeholder={t('headers.authorized.changePassword.confirm_password')}
                                withEyeAdornment={true}
                                onEyeAdornmentClick={() => setShowPassword(!showPassword)}
                                errorText={errors.confirmPassword ? errors.confirmPassword.message : ''}
                                type={showPassword ? 'text' : 'password'}
                                {...register("confirmPassword", {
                                    required: t('headers.authorized.changePassword.please_enter_valid_password'),
                                    maxLength: 128,
                                    validate: value => value === watchPassword || t('headers.authorized.changePassword.passwords_dont_match')
                                })} />
                        </InputContainer>
                        {watchPassword && <PasswordStrengthCheckerContainer>
                            <div>
                                <span>{t('validations.more_character', { count: 8 })}</span>
                                <StatusImg status={watchPassword && watchPassword.match(FORM_PATTERNS.minEightChars.value)} />
                            </div>
                            <div>
                                <span>{t('validations.uppercase')}</span>
                                <StatusImg status={watchPassword && watchPassword.match(FORM_PATTERNS.uppercase.value)} />
                            </div>
                            <div>
                                <span>{t('validations.lowercase')}</span>
                                <StatusImg status={watchPassword && watchPassword.match(FORM_PATTERNS.lowercase.value)} />
                            </div>
                            <div>
                                <span>{t('validations.at_least_number', {count: 1})} </span>
                                <StatusImg status={watchPassword && watchPassword.match(FORM_PATTERNS.oneDigit.value)} />
                            </div>
                            <div>
                                <span>{t('validations.passwords_match')} </span>
                                <StatusImg status={watchPassword === watchConfirmPassword} />
                            </div>
                        </PasswordStrengthCheckerContainer>}
                        <LoadingButton
                            loading={isLoading}
                            type='submit'
                            sx={{ width: 400, height: 40 }}
                            variant='contained'
                            size='large'
                        >
                            {t('headers.authorized.changePassword.set_password')}
                        </LoadingButton>
                    </form>
                </ContentContainer>
            </Fragment>
        </DialogModal>
    )
};

const ToastContentContainer = styled.div`
    & > b {
        font-family: 'Aspira Demi', 'FiraGO Regular';
    }
`;

const ContentContainer = styled.div`
    padding: 10px 40px;
    color: #676767;
`;

const HeaderSectionContainer = styled.div`
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    margin-bottom: 23px;
`;

const HeaderText = styled.div`
    font-size: 18px;
    margin-bottom: 16px;
    font-weight: bold;
    font-family: 'Aspira Demi', 'FiraGO Regular';
`;

const SecondaryHeaderText = styled.div`
    color: #676767;
    font-size: 11px;
`;

const InputContainer = styled.div`
    width: 400px;
    margin-bottom: 25px;
    &:last-child {
        margin-bottom: 30px;
    }
`;

const StyledToliaIcon = styled(ToliaIcon)`
    & path {
        fill: #339966;
    }
`;

const PasswordStrengthCheckerContainer = styled.div`
    margin-bottom: 20px;
    & span {
        margin-right: 8px;
        margin-bottom: 6px;
        display: inline-block;
        width: 130px;
    }
`;