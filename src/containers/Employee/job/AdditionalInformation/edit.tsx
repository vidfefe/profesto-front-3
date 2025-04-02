
import React, { useEffect, Fragment, useState } from "react";
import styled from "styled-components";
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from "react-i18next";
import { useToasts } from "react-toast-notifications";
import DialogModal from "components/Modal/Dialog";
import EnumDropdown from "components/Dropdowns/EnumDropdown";
import EmpEditHeader from "../../editHeader";
import UniversalInput from "components/Input/UniversalInput";
import { getEnum } from "services";
import { isEmpty } from "lodash";

const AdditionalInformationEdit = (props: any) => {
    const { user, jobData, addetionalInfo } = props;
    const { t } = useTranslation();
    const { addToast } = useToasts();
    const [pensionStatus, setPensionStatus] = useState<any>([]);
    const { handleSubmit, register, setFocus, setValue, setError, control, formState: { errors } } = useForm({
        defaultValues: {
            pension_status: null,
            bank_account: ''
        }
    });

    useEffect(() => {
        if (!isEmpty(addetionalInfo)) {
            setValue('pension_status', addetionalInfo?.pension_status?.id);
            setValue('bank_account', addetionalInfo?.bank_account);
        }
    }, [addetionalInfo])

    useEffect(() => {
        getEnum('Enum::PensionStatus').then(res => setPensionStatus(res.data));
      }, []);

    useEffect(() => {
        if (props.editErrors) {
            props.editErrors.forEach((item: any) => setError(item.field, { type: 'string', message: item.message }));
            setFocus(props.editErrors?.[0]?.field as any)
        }
    }, [props.editErrors]);

    const onError = (err: any) => {
        if (err) {
            addToast(<ToastContentContainer dangerouslySetInnerHTML={{ __html: t('globaly.fix_Highlighted') }} />, {
                appearance: 'error',
                autoDismiss: true,
                placement: 'top-center'
            });
        }
    };

    const onSubmit = (data: any) => {
        props.onSubmit(data);
    };

    return (
        <DialogModal
            open={props.isOpen}
            title={t('jobInfo.edit_additional_information')}
            onClose={() => { props.onModalClose() }}
            actionButton={handleSubmit(onSubmit, onError)}
            withButtons
            cancelButtonText={t('globaly.cancel')}
            actionButtonText={t('globaly.save')}
            actionLoading={props.loadingRequest}
            nominalHeader={
                <EmpEditHeader
                    employeeName={`${user?.first_name} ${user?.last_name}` ?? ''}
                    avatarUuid={user?.uuid ?? null}
                    employeeId={user?.id ?? null}
                    jobData={jobData}
                />
            }
            fullWidth
        >
            <Wrapper>
                <form>
                    <div className='body'>
                        <div className='top'>
                            <div className='input-item'>
                                <label>{t('jobInfo.pension_status')}</label>
                                <Controller
                                    name="pension_status"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <EnumDropdown
                                            placeholder={t('jobInfo.select_pension_status')}
                                            onChange={onChange}
                                            value={value}
                                            options={pensionStatus}
                                        />
                                    )}
                                />
                            </div>
                            <div className='input-item'>
                                <label>{t('jobInfo.bank_account')}</label>
                                <UniversalInput
                                    inputProps={{ maxLength: 150 }}
                                    {...register('bank_account')}
                                    placeholder={t('jobInfo.bank_account')}
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </Wrapper>
        </DialogModal>
    )

}
const ToastContentContainer = styled.div`
    & > b {
        font-family: 'Aspira Demi', 'FiraGO Regular';
    }
`;
const Wrapper = styled.div`
  .body{
    .form_control {
      width: 100%;
      border-radius: 4px;
      border: 1px solid #D6D6D6;
      padding: 11px 13px;
      
      &:focus, &:hover {
        border-color: #99CC33 !important;
      }
  }

  .error-input {
    border-color: var(--red);
  };

  .birth-date{
    display: flex;

    span.age{
      margin-top: 12px;
      margin-left: 10px;
    }
  }

  .input-item{
    max-width: 416px;
    margin-bottom: 15px;
    
    & > label{
      display: inline-block;
      margin-bottom: 6px;
      margin-top: 6px;
      & > sup {
        color: #C54343;
      }
    }
  }
  };
`;
export default AdditionalInformationEdit;