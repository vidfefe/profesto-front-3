import { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useForm } from "react-hook-form";
import useMutationCustom from 'hooks/useMutationCustom';
import DialogModal from 'components/Modal/Dialog';
import UniversalInput from 'components/Input/UniversalInput';
import LoadingButton from '@mui/lab/LoadingButton';
import { useToasts } from "react-toast-notifications";
import EmployeeInfoHeader from 'containers/Employee/editHeader';
import { FORM_PATTERNS } from '../../../constants';
import { getCurrentUser, getContactEmails } from "services";
import { setCurrentUser } from "redux/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { currentUserSelector } from "redux/selectors";
import { ReactComponent as FillWorkIcon } from "assets/svg/fill-from-work.svg";
import { ReactComponent as FillPersonalIcon } from "assets/svg/fill-from-persona.svg";
import { useTranslation } from "react-i18next";

interface IChangeEmailProps {
    isOpen: boolean,
    closeModal: () => void,
    employeeName: string,
    employeePic: string,
    employeeInfo: any, 
};

type TChangeEmailInputs = {
    email: string,
    password: string,
};
type TMutationData = { errors?: [{ field?: string, message: string }] };
type TMutationArgs = { email: string, password: string };

export default function ChangeSignInEmail({ isOpen, closeModal, employeeName, employeePic, employeeInfo }: IChangeEmailProps) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const currentUser = useSelector(currentUserSelector)
    const { mutate: changeSignInEmail, isLoading } = useMutationCustom<string[], TMutationData, TMutationArgs>(["change_sing-in_email"], {
        endpoint: 'umg/username', options: { method: "post" },
    }, {
        onSuccess: () => {
            getCurrentUser().then(res => {
                dispatch(setCurrentUser(res.data));
            })
            closeModal();
            addToast(t('headers.authorized.changeEmail.email_has_been_changed'), {
                appearance: 'success',
                autoDismiss: true
            });
        },
        onError: (e) => e.errors?.forEach((item: any) => setError(item.field, { type: 'string', message: item.message }))
    });

    const { addToast } = useToasts();
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const { register, handleSubmit, watch, setValue, reset, formState: { errors }, setError } = useForm<TChangeEmailInputs>({
        defaultValues: {
            email: '',
            password: '',
        }
    });
    const email = watch('email');
    const password = watch("password");
    const [employeeEmails, setEmployeeEmails] = useState<any>();

    useEffect(() => {
        if (isOpen) {
            getContactEmails(currentUser?.employee?.id).then(res => setEmployeeEmails(res.data));
        }
        return () => reset()
    }, [reset, isOpen, currentUser?.employee?.id]);

    const onSubmit = ({ email, password }: TChangeEmailInputs) => {
        changeSignInEmail({
            email: email,
            password: password,
        })
    };

    const fillWithWorkEmail = () => {
        setValue('email', employeeEmails?.work_email)
    };

    const fillWithPersonalEmail = () => {
        setValue('email', employeeEmails?.personal_email)
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
            title={t('headers.authorized.changeEmail.email_change')}
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
                        <HeaderText>{t('headers.authorized.changeEmail.please_enter_current_password')}</HeaderText>
                        <SecondaryHeaderText>{t('headers.authorized.changeEmail.you_have_access')}</SecondaryHeaderText>
                    </HeaderSectionContainer>
                    <form onSubmit={handleSubmit(onSubmit, onError)}>
                        <SignInEmailFillWrapper>
                            <div>
                                <span style={{ color: '#9C9C9C' }}>{t('headers.authorized.changeEmail.copy_from')} </span>
                                <FillEmailWrapper onClick={() => fillWithWorkEmail()}>
                                    <FillEmailCircleWrapper><FillWorkIcon /></FillEmailCircleWrapper>
                                    <span>{t('headers.authorized.changeEmail.work_email')}</span>
                                </FillEmailWrapper>

                                <FillEmailWrapper onClick={() => fillWithPersonalEmail()}>
                                    <FillEmailCircleWrapper><FillPersonalIcon /></FillEmailCircleWrapper>
                                    <span>{t('headers.authorized.changeEmail.personal_email')}</span>
                                </FillEmailWrapper>
                            </div>
                        </SignInEmailFillWrapper>
                        <InputContainer>
                            <UniversalInput
                                size='small'
                                maxLength='250'
                                placeholder={t('headers.authorized.changeEmail.sign_in_email')}
                                visiblePlaceholder={email ? true : false}
                                errorText={errors.email ? errors.email.message || FORM_PATTERNS.email.message : ''}
                                {...register("email", { required: t('headers.authorized.changeEmail.please_enter_email'), maxLength: 250, pattern: FORM_PATTERNS.email })}
                            />
                        </InputContainer>
                        <InputContainer>
                            <UniversalInput
                                visiblePlaceholder={password ? true : false}
                                maxLength='128'
                                placeholder={t('headers.authorized.changeEmail.password')}
                                size='small'
                                withEyeAdornment={true}
                                onEyeAdornmentClick={() => setShowPassword(!showPassword)}
                                type={showPassword ? 'text' : 'password'}
                                errorText={errors.password ? errors.password.message : ''}
                                {...register("password", { maxLength: 128, required: t('headers.authorized.changeEmail.password_confirmation') })} />
                        </InputContainer>
                        <LoadingButton
                            loading={isLoading}
                            type='submit'
                            sx={{ width: 400, height: 40 }}
                            variant='contained'
                            size='large'
                        >
                            {t('headers.authorized.changeEmail.confirm')}
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
    text-align: center;
    margin-bottom: 30px;
    width: 400px;
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

const FillEmailWrapper = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--dark-gray);

  :hover {
    div{
      background-color: #339966;
    }
    span {
      color: var(--green);
    }
  }
`

const SignInEmailFillWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
  
  & > div {
    display: flex; 
    align-items: center;
    gap: 15px;
    margin-left: auto;
  }
`

const FillEmailCircleWrapper = styled.div`
  width: 23px;
  height: 23px;
  background: #b5b5b5 0% 0% no-repeat padding-box;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 2px;
  margin-right: 5px;
`