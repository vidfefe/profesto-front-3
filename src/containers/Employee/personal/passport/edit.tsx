import React, { useEffect } from "react";
import styled from "styled-components";
import { useToasts } from "react-toast-notifications";
import { Controller, useForm } from 'react-hook-form';
import DialogModal from "components/Modal/Dialog";
import UniversalInput from "components/Input/UniversalInput";
import EmpEditHeader from "../../editHeader";
import SelectDropdown from "components/Dropdowns/SelectDropdown";
import { getCountryList, getIdentificationDocumentTypes, createIdentificationDocumentType } from "services";
import DatePicker from "components/DatePickers/DatePicker";
import { utcToZonedTime } from 'date-fns-tz';
import { useTranslation } from "react-i18next";
import SelectWithAdd from "components/Dropdowns/SelectWithAdd";
import { region } from "lib/Regionalize";
const PassportInformationEdit = (props: any) => {
  const { t, i18n } = useTranslation();
  const { addToast } = useToasts();

  const { register, handleSubmit, watch, setValue, setError, reset, control, formState: { errors } } = useForm({
    shouldFocusError: false,
    defaultValues: {
      number: null,
      issuing_country: null,
      issue_date: '',
      expiration_date: '',
      document_types: null,
      issuing_authority: ''
    }
  });
  const { user, jobData, chosenPassport, editMode } = props;
  const watchValues = watch();

  const onSubmit = (data: any) => {
    props.onSubmit(data);
  };

  
  useEffect(() => {
    if (chosenPassport && editMode) {
      setValue('number', chosenPassport.number ?? null)
      setValue('issuing_country', chosenPassport.country)
      setValue('issue_date', chosenPassport.issue_date && utcToZonedTime(new Date(chosenPassport.issue_date), 'UTC'))
      setValue('expiration_date', chosenPassport.expiration_date && utcToZonedTime(new Date(chosenPassport.expiration_date), 'UTC'))
      setValue('document_types', chosenPassport.identification_type ?? null);
      setValue('issuing_authority', chosenPassport.issuing_authority ?? null)
    } else reset()
  }, [chosenPassport, editMode, props.isOpen])

  useEffect(() => {
    if (props.editErrors) {
      props.editErrors.map((item: any) => setError(item.field, { type: 'string', message: item.message }))
    }
  }, [props.editErrors]);

  const onError = (err: any) => {
    if (err) {
      addToast(<ToastContentContainer dangerouslySetInnerHTML={{ __html: t('globaly.fix_Highlighted')}}/>, {
        appearance: 'error',
        autoDismiss: true,
        placement: 'top-center'
      });
    }
  };

  const renderActionModalName = () => {
    if (region(['geo'])) {
      return `${editMode ? t('myInfo.passport.edit_identification_document') : t('myInfo.passport.add_identification_document')}`
    }
    else {
      return `${editMode ? t('components.modal.header_edit_action') : t('components.modal.header_add_action')} ${t('myInfo.passport.passport')}`;
    }
  }

  return (
    <DialogModal
      open={props.isOpen}
      title={renderActionModalName()}
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
        />
      }
      fullWidth
    >
      <Wrapper>
        <form>
          <div className='body'>
            <div className='contact-section'>
              {region(['geo']) && 
                <div className='input-item'>
                  <label>{t('myInfo.passport.document_type')}<sup>*</sup></label>
                  <Controller
                    name="document_types"
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                      <SelectWithAdd
                        name={t('myInfo.passport.document_type')}
                        inputPlaceholder={t('myInfo.passport.select_document_type')}
                        inputValue={value}
                        loadRemoteData={() => getIdentificationDocumentTypes(100, 1)}
                        createRequest={createIdentificationDocumentType}
                        onChange={onChange}
                        errorText={errors.document_types ? t('validations.document_type_required') : ''}
                      />
                    )}
                  />
                </div>
              }
              <div className='input-item'>
                <label>{region(['geo']) ? t('myInfo.passport.document_number') : t('myInfo.passport.passport_number')}<sup>*</sup></label>
                <UniversalInput
                  errorText={errors.number ? t('validations.passport_number_required') : ""}
                  {...register('number', { required: true })}
                />
              </div>

              <div className='input-item'>
                <label>{t('myInfo.visa.issuing_country')}<sup>*</sup></label>
                <Controller
                  name="issuing_country"
                  rules={{ required: true }}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <SelectDropdown
                      onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => onChange(newValue)}
                      value={value}
                      inputPlaceholder={t('myInfo.visa.select_issuing_country')}
                      loadRemoteData={() => getCountryList(300, 1)}
                      errorText={errors.issuing_country ? t('validations.issuing_country_required') : ''}
                    />
                  )}
                />
              </div>

              {region(['geo']) && 
                <>
                <div className='input-item'>
                  <label>{t('onBoarding.documentInformation.issuing_authority')}</label>
                  <UniversalInput
                    {...register('issuing_authority', { required: false })}
                  />
              </div>
                </>
              }

              <div className='input-item'>
                <div style={{ width: 200 }}>
                  <Controller
                    name="issue_date"
                    control={control}
                    rules={{ validate: (value: any) => value === null ? t('validations.valid_date') : value !== '' || t('validations.issue_date_required') }}
                    render={({ field: { onChange, value } }) => (
                      <DatePicker
                        required
                        selected={value}
                        onChange={onChange}
                        label={t('myInfo.visa.issue')}
                        errorText={errors.issue_date ? errors.issue_date.message : ''}
                      />
                    )}
                  />
                </div>

                <br />
                <div style={{ width: 200 }}>
                  <Controller
                    name="expiration_date"
                    control={control}
                    rules={{
                      required: t('validations.expiration_date_required'),
                      validate: (value: any) => value === null ? t('validations.valid_date') : value === '' ?
                      t('validations.expiration_date_required') : (!watchValues.issue_date || !value) || watchValues.issue_date as any < value
                        || t('validations.expiration_must_greater_than_issued')
                    }}
                    render={({ field: { onChange, value } }) => (
                      <DatePicker
                        required
                        selected={value}
                        onChange={onChange}
                        label={t('myInfo.visa.expiration')}
                        errorText={errors.expiration_date ? errors.expiration_date.message : ''}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </Wrapper>
    </DialogModal >
  );
};

export default PassportInformationEdit;

const ToastContentContainer = styled.div`
    & > b {
      font-family: 'Aspira Demi', 'FiraGO Regular';
    }
`;

const Wrapper = styled.div`
  .body{
     .input-item{
         max-width: 416px;
         margin-bottom: 21px;
         
         & > label{
           display: inline-block;
           margin-bottom: 6px;
           & > sup {
            color: #C54343;
          }
         }
     }
}
`;
