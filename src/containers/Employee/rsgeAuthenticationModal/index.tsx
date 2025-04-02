import React, { Fragment, useEffect, useState } from "react";
import styled from "styled-components";
import { Controller, useForm } from 'react-hook-form';
import DialogModal from "components/Modal/Dialog";
import UniversalInput from "components/Input/UniversalInput";
import { useToasts } from "react-toast-notifications";
import { PatternFormat } from 'react-number-format';
import { useTranslation } from "react-i18next";
import { reSedAuthCode } from "services";
import { ReactComponent as RsgeLogoMedium } from 'assets/svg/rslogo-medium.svg';
const RsgeAuthenticationModal = (props: any) => {
    const { isOpen, onModalClose, showPin, phoneNumber, title = null } = props;
    const { register, handleSubmit, control, setError, setValue, formState: { errors } } = useForm({
        defaultValues: {
            username: '',
            password: '',
            save: false,
            pin: ''
        }
    });
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(true);
    const [credentials, setCredentials] = useState<any>(null)
    const { addToast } = useToasts();


    useEffect(() => {
        if (props.formErrors) {
            props.formErrors.forEach((item: any) => {
                addToast(<div><span style={{fontFamily: "'Aspira Wide Demi', 'FiraGO Medium'"}}>{item.message}</span> {t('leftMenuCard.rsgForm.rsge_validation_text')}</div>, {
                    appearance: 'error',
                    autoDismiss: true,
                });
            })
        }
    }, [props.formErrors])

    const onSubmit = (data: any) => {
        setCredentials(data);
        props.onSubmit(data);
    };

    const reSendSms = () => {
        reSedAuthCode(credentials).then(res => {
            addToast(<div>{t('leftMenuCard.rsgForm.rsge_resend_sms_success')}</div>, {
                appearance: 'success',
                autoDismiss: true
            })
        }).catch(err => { 
            addToast(<div>{err.response.data.errors}</div>, {
                appearance: 'error',
                autoDismiss: true
            })
        });
    }

    return (
        <DialogModal
            open={isOpen}
            title={title}
            onClose={() => onModalClose()}
            actionButton={handleSubmit(onSubmit)}
            withButtons
            cancelButtonText={t('globaly.cancel')}
            actionButtonText={t('leftMenuCard.rsgForm.rsge_auth')}
            actionLoading={props.loadingRequest}
            fullWidth
            upperPosition
        >
            <form>
                <ContentHeader>
                    <RsgeLogoMedium/>
                    <span>{showPin ? t('leftMenuCard.rsgForm.rsge_pin_req_text', {phoneNumber: phoneNumber}) : t('leftMenuCard.rsgForm.authText')}</span>
                </ContentHeader>
                <ModalWrapper>
                    <InputWrapper>
                        {showPin ?
                            <Fragment>
                                <div style={{margin: '0px auto'}}>
                                    <label>{t('leftMenuCard.rsgForm.sms_pin_text')} <sup>*</sup> </label>
                                    <Controller
                                        name="pin"
                                        control={control}
                                        rules={{
                                            required: t('validations.is_required', {attribute: t('leftMenuCard.rsgForm.sms_pin_text')}),
                                            validate: value => value.length !== 4 ? false : true
                                        }}
                                        render={({ field: { onChange, value } }) => (
                                            <>
                                                <StyledPresnoalNumberInput
                                                    type='tel'
                                                    style={{height: 40}}
                                                    format="####"
                                                    mask={"_"}
                                                    valueIsNumericString
                                                    value={value}
                                                    onValueChange={(e) => onChange(e.value)}
                                                    className={`form_control ${errors.pin ? 'error-input' : ''}`}
                                                    $inputError={!!errors.pin}
                                                />
                                            </>
                                        )}
                                    />
                                    <span style={{
                                        color: 'var(--red)',
                                        marginTop: 6,
                                        fontSize: 10,
                                        display: 'inline-block'
                                    }}>{errors.pin ? errors.pin?.message  : ''} </span>
                                    <SmsButtonContainer>
                                        <ReSendSms onClick={() => reSendSms()}>{t('leftMenuCard.rsgForm.sms_send_link')}</ReSendSms>
                                    </SmsButtonContainer>
                                </div>
                            </Fragment>
                            :
                            <Fragment>
                            <div>
                                    <label>{t('leftMenuCard.rsgForm.rsge_username')} <sup>*</sup> </label>
                                    <UniversalInput
                                        errorText={errors.username ? errors.username?.message : ''}
                                        {...register("username", {
                                            required: t('validations.is_required', {attribute: t('leftMenuCard.rsgForm.rsge_username')}),
                                        })}
                                    />
                            </div>
                            <div>
                                    <label>{t('leftMenuCard.rsgForm.rsge_password')} <sup>*</sup> </label>
                                    <UniversalInput
                                        type={showPassword ? 'password' : 'text'}
                                        withEyeAdornment={true}
                                        onEyeAdornmentClick={() => setShowPassword(!showPassword)}
                                        errorText={errors.password ? errors.password?.message : ''}
                                        {...register("password", {
                                            required: t('validations.is_required', {attribute: t('leftMenuCard.rsgForm.rsge_password')}),
                                        })}
                                    />
                            </div>
                            </Fragment>
                        }
                    </InputWrapper>
                </ModalWrapper>
            </form>
        </DialogModal>
    );
};

export default RsgeAuthenticationModal;
const SmsButtonContainer = styled.div `
    display: flex;
    justify-content: flex-end;
    align-items: center;
`
const ContentHeader = styled.div `
    margin: -16px -24px 0px -24px;
    background-color: #F3F3F3;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 20px;
    & > span {
        flex: 1;
        font-size: 12px;
    }
`
const ReSendSms = styled.div `
    margin-top: 13px;
    color: #676767;
    text-decoration: underline;
    cursor: pointer;
    &:hover {
        text-decoration: underline;
    }
`
const ModalWrapper = styled.div `
    & > span {
        font-size: 14px;
    }
`
const InputWrapper = styled.div`
    max-width: 589px;
    margin-bottom: 15px;
    margin-top: 20px;
    label{
        display: inline-block;
        margin-bottom: 8px;
        margin-top: 6px;
    }
    & sup {
        color: #C54343;
    }
    &  > div {
        margin-bottom: 15px;
    }
`;
const StyledPresnoalNumberInput = styled(PatternFormat) <{ $inputError?: boolean }>`
    width: 100%;
    border-radius: 4px;
    border: ${({ $inputError }) => $inputError ? '1px solid var(--red)' : '1px solid #D6D6D6'};
    padding: 11px 13px;

    &:focus {
      border-color:  ${({ $inputError }) => $inputError ? 'var(--red)' : '#99CC33'};
    }
`;