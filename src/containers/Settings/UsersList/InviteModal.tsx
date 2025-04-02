import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Controller, useForm } from 'react-hook-form';
import DialogModal from "components/Modal/Dialog";
import UniversalInput from "components/Input/UniversalInput";
import { getUserRoleInfo, getUserRoleList } from "services";
import { FORM_PATTERNS } from "../../../constants";
import SelectDropdown from "components/Dropdowns/SelectDropdown";
import EmpEditHeader from "../../Employee/editHeader";
import { useToasts } from "react-toast-notifications";
import Box from "@mui/material/Box";

import { ReactComponent as FillPersonalIcon } from "../../../assets/svg/fill-from-persona.svg";
import { ReactComponent as FillWorkIcon } from 'assets/svg/fill-from-work.svg';
import { useTranslation } from "react-i18next";


const InviteModal = (props: any) => {
    const { isOpen, onModalClose, employeeId, reInvite = false, roleChange = false, chosenRoleId = null, title = null } = props;
    const { register, handleSubmit, control, setError, setValue, formState: { errors } } = useForm({
        shouldFocusError: true,
        defaultValues: {
            role: chosenRoleId,
            user_email: null
        }
    });
    const { t } = useTranslation();
    const [employeeUser, setEmployeeUser] = useState<any>();
    const { addToast } = useToasts();

    const setCurrentUser = (employeeId: number) => {
        getUserRoleInfo(employeeId).then(res => 
            setEmployeeUser({
                ...res.data,
                role: {
                    ...res.data.role,
                    name: t(`enums.roles.${res.data.role.name}`)
                }
            })
        )
    }

    useEffect(() => {
        setCurrentUser(employeeId)
    }, [employeeId])

    useEffect(() => {
        setValue('role', chosenRoleId ?? employeeUser?.role)
        setValue('user_email', employeeUser?.user_email)
    }, [employeeUser])

    useEffect(() => {
        if (props.formErrors) {
            props.formErrors.forEach((item: any) => {
                if (item.field !== 'base') {
                    setError(item.field, { type: 'string', message: item.message })
                } else {
                    addToast(item.message, {
                        appearance: 'error',
                        autoDismiss: true,
                    });
                }
            })
        }
    }, [props.formErrors])

    const onSubmit = (data: any) => {
        props.onSubmit(data);
    };

    const fillWithWorkEmail = () => {
        setValue('user_email', employeeUser?.work_email)
    };

    const fillWithPersonalEmail = () => {
        setValue('user_email', employeeUser?.personal_email)
    };

    const onError = (err: any) => {
        if (err) {
            addToast(<ToastContentContainer dangerouslySetInnerHTML={{ __html: t('globaly.fix_Highlighted')}}/>, {
                appearance: 'error',
                autoDismiss: true,
                placement: 'top-center'
            });
        }
    };

    return (
        <DialogModal
            open={isOpen}
            title={title ?? (reInvite ? t('leftMenuCard.inviteModal.resend_invitation') : (employeeUser?.role ? t('leftMenuCard.inviteModal.change_role') : t('leftMenuCard.inviteModal.invite_user')))}
            onClose={() => onModalClose()}
            actionButton={handleSubmit(onSubmit, onError)}
            withButtons
            cancelButtonText={t('globaly.cancel')}
            actionButtonText={t('globaly.save')}
            actionLoading={props.loadingRequest}
            nominalHeader={
                employeeUser && <EmpEditHeader
                    employeeName={`${employeeUser.first_name} ${employeeUser.last_name}`}
                    avatarUuid={employeeUser.uuid}
                    employeeId={employeeUser.id}
                    jobData={employeeUser?.active_job_detail}
                />
            }
            fullWidth
            upperPosition
        >
            <form>
                <InfoWrapper>
                    {/*Change Role*/}
                    {employeeUser && roleChange &&
                        <div>
                            <p style={{ marginBottom: 10 }}>{t('leftMenuCard.inviteModal.click_change_role')}</p>
                        </div>
                    }

                    {/*Invite*/}
                    {employeeUser && !chosenRoleId && !reInvite && !roleChange &&
                        <div>
                            <p style={{ marginBottom: 10 }}>{t('leftMenuCard.inviteModal.email_invitation')}</p>
                            <p>{t('leftMenuCard.inviteModal.the_organization')}</p>
                        </div>
                    }

                    {/*Re Invite*/}
                    {employeeUser && reInvite &&
                        <div>
                            <p style={{ marginBottom: 10 }}>{t('leftMenuCard.inviteModal.gets_email_invitation')}</p>
                            <p>{t('leftMenuCard.inviteModal.the_organization')}</p>
                        </div>
                    }

                    {/*Chosen Role*/}
                    {employeeUser && chosenRoleId &&
                        <div>
                            <p style={{ marginBottom: 10 }}>{t('leftMenuCard.inviteModal.to_enable_sign_email')}</p>
                            <p>{t('leftMenuCard.inviteModal.click_save')}</p>
                        </div>
                    }
                </InfoWrapper>

                {!chosenRoleId && <InputWrapper>
                    <label>{t('leftMenuCard.inviteModal.user_role')}<sup>*</sup></label>
                    <Controller
                        name="role"
                        control={control}
                        rules={{ required: t('leftMenuCard.inviteModal.role_is_required') }}
                        render={({ field: { onChange, value } }) => (
                            <SelectDropdown
                                inputPlaceholder={t('leftMenuCard.inviteModal.select_user_role')}
                                renderOption={(props: any, option: any) => (
                                    <Box component="li" {...props}
                                        style={{
                                            paddingLeft: 13,
                                            borderTop: option.addLine ? '1px solid #D6D6D6' : 'none'
                                        }}
                                        key={option.id ?? props.key}
                                    >
                                        {`${option.name} (${option.user_count})`}
                                    </Box>
                                )}
                                onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
                                    onChange(newValue)
                                }}
                                value={value}
                                loadRemoteData={() => getUserRoleList(50, 1, 0, true, t)}
                                errorText={errors.role ? errors.role.message : ''}
                            />
                        )}
                    />
                </InputWrapper>}

                {!roleChange && <InputWrapper>
                    <SignInEmailFillWrapper>
                        <label>{t('leftMenuCard.inviteModal.sign_in_email')}<sup>*</sup></label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                            <span style={{ color: '#9C9C9C' }}>{t('leftMenuCard.inviteModal.copy_from')} </span>
                            <FillEmailWrapper onClick={() => fillWithWorkEmail()}>
                                <FillEmailCircleWrapper><FillWorkIcon /></FillEmailCircleWrapper>
                                <span>{t('leftMenuCard.inviteModal.work_email')}</span>
                            </FillEmailWrapper>

                            <FillEmailWrapper onClick={() => fillWithPersonalEmail()}>
                                <FillEmailCircleWrapper><FillPersonalIcon /></FillEmailCircleWrapper>
                                <span>{t('leftMenuCard.inviteModal.personal_email')}</span>
                            </FillEmailWrapper>
                        </div>
                    </SignInEmailFillWrapper>
                    <UniversalInput
                        errorText={errors.user_email ? errors.user_email?.message : ''}
                        {...register("user_email", {
                            required: t('leftMenuCard.inviteModal.sign_in_email_required'),
                            pattern: FORM_PATTERNS.email
                        })}
                    />
                </InputWrapper>}
            </form>
        </DialogModal>
    );
};

export default InviteModal;

const ToastContentContainer = styled.div`
    & > b {
        font-family: 'Aspira Demi', 'FiraGO Regular';
    }
`;

const InfoWrapper = styled.div`
    margin-bottom: 20px;
`;

const InputWrapper = styled.div`
    max-width: 589px;
    margin-bottom: 15px;
    
    label{
        display: inline-block;
        margin-bottom: 8px;
        margin-top: 6px;
    }
    & sup {
        color: #C54343;
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
`;

const SignInEmailFillWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

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
`;
