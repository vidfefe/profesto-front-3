import { useEffect } from "react";
import styled from "styled-components";
import { Controller, useForm } from 'react-hook-form';
import { useToasts } from "react-toast-notifications";
import DialogModal from "components/Modal/Dialog";
import EmpEditHeader from "../../editHeader";
import SelectWithAdd from "components/Dropdowns/SelectWithAdd";
import { getShirtSizeList, createShirtSize } from "services";
import TextArea from "components/TextArea";
import { useTranslation } from "react-i18next";

const AdditionalInformationEdit = (props: any) => {
  const { addToast } = useToasts();
  const { t } = useTranslation();

  const { handleSubmit, setValue, setError, control } = useForm({ shouldUnregister: true });
  const { user, jobData, additionalInfo } = props;

  useEffect(() => {
    if (additionalInfo) {
      setValue('shirt_size', additionalInfo?.shirt_size)
      setValue('allergies', additionalInfo.allergies);
      setValue('dietary_restrictions', additionalInfo.dietary_restrictions);
      setValue('comment', additionalInfo.comment)
    }
  }, [additionalInfo, props.isOpen])

  useEffect(() => {
    if (props.editErrors) {
      props.editErrors.map((item: any) => setError(item.field, { type: 'string', message: item.message }))
    }
  }, [props.editErrors])

  const onSubmit = (data: any) => {
    props.onSubmit(data);
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
      open={props.isOpen}
      title={t('myInfo.additional_information.edit_additional_information')}
      onClose={() => { props.onModalClose() }}
      actionButton={handleSubmit(onSubmit, onError)}
      withButtons
      cancelButtonText={t('globaly.cancel')}
      actionButtonText={t('globaly.save')}
      actionLoading={props.loadingRequest}
      nominalHeader={
        <EmpEditHeader
          employeeName={`${user.first_name} ${user.last_name}`}
          avatarUuid={user.uuid}
          employeeId={user.id}
          jobData={jobData}
        />}
      fullWidth
    >
      <Wrapper>
        <div className='body'>
          <div className='contact-section'>
            <div className='input-item'>
              <label>{t('myInfo.additional_information.shirt_size')}</label>
              <Controller
                name="shirt_size"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <SelectWithAdd
                    name={t('myInfo.additional_information.shirt_size')}
                    inputPlaceholder={t('myInfo.additional_information.select_shirt_size')}
                    inputValue={value}
                    loadRemoteData={() => getShirtSizeList(100, 1)}
                    createRequest={createShirtSize}
                    onChange={onChange}
                  />
                )}
              />
            </div>

            <div className='input-item'>
              <label>{t('myInfo.additional_information.allergies')}</label>
              <Controller
                name="allergies"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextArea
                    onChange={(event: any) => { onChange(event.target.value) }}
                    maxRows={5}
                    defaultValue={value}
                  />
                )}
              />
            </div>

            <div className='input-item'>
              <label>{t('myInfo.additional_information.dietary_restrictions')}</label>
              <Controller
                name="dietary_restrictions"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextArea
                    onChange={(event: any) => { onChange(event.target.value) }}
                    maxRows={5}
                    defaultValue={value}
                  />
                )}
              />
            </div>

           <div className='input-item'>
              <label>{t('globaly.comment')}</label>
              <Controller
                name="comment"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextArea
                    onChange={(event: any) => { onChange(event.target.value) }}
                    maxRows={5}
                    defaultValue={value}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </Wrapper>
    </DialogModal>
  );
};

export default AdditionalInformationEdit;

const ToastContentContainer = styled.div`
    & > b {
      font-family: 'Aspira Demi', 'FiraGO Regular';
    }
`;

const Wrapper = styled.div`
  .body{
     .input-item{
         max-width: 416px;
         margin-bottom: 15px;

         & > label{
           display: inline-block;
           margin-bottom: 6px;
           margin-top: 6px;
         }
     }
  }  
`;
