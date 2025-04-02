import React, { useEffect } from "react";
import styled from "styled-components";
import { useToasts } from "react-toast-notifications";
import { Controller, useForm } from 'react-hook-form';
import DialogModal from "components/Modal/Dialog";
import EmpEditHeader from "../../editHeader";
import SelectDropdown from "components/Dropdowns/SelectDropdown";
import { getVisaList, getCountryList, createVisa } from "services";
import SelectWithAdd from "components/Dropdowns/SelectWithAdd";
import TextArea from "components/TextArea";
import DatePicker from "components/DatePickers/DatePicker";
import { utcToZonedTime } from 'date-fns-tz';
import { useTranslation } from "react-i18next";
const VisaInformationEdit = (props: any) => {
  const { addToast } = useToasts();
  const { t } = useTranslation();
  const { handleSubmit, watch, setValue, setError, control, reset, formState: { errors } } = useForm({
    shouldFocusError: false,
    defaultValues: {
      visa: null,
      issuing_country: null,
      issue_date: '',
      expiration_date: '',
      note: ''
    }
  });
  const watchValues = watch();
  const { user, jobData, chosenVisa, editMode } = props;

  useEffect(() => {
    if (chosenVisa && editMode) {
      setValue('visa', chosenVisa.visa ?? null);
      setValue('issuing_country', chosenVisa.issuing_country ?? null);
      setValue('issue_date', chosenVisa.issue_date && utcToZonedTime(new Date(chosenVisa.issue_date), 'UTC'));
      setValue('expiration_date', chosenVisa.expiration_date && utcToZonedTime(new Date(chosenVisa.expiration_date), 'UTC'));
      setValue('note', chosenVisa.note ?? '');
    } else reset();
  }, [chosenVisa, editMode, props.isOpen])

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
      title={`${editMode ? t('globaly.edit') :  t('globaly.lowercase_add')} ${t('myInfo.visa.visa_information')}`}
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
        <form>
          <div className='body'>
            <div className='contact-section'>
              <div className='input-item'>
                <label>{t('myInfo.visa.visa')}<sup>*</sup></label>
                <Controller
                  name="visa"
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <SelectWithAdd
                      name={t('myInfo.visa.visa')}
                      inputPlaceholder={t('myInfo.visa.select_visa')}
                      inputValue={value}
                      loadRemoteData={() => getVisaList(100, 1)}
                      createRequest={createVisa}
                      onChange={onChange}
                      errorText={errors.visa ? t('validations.visa_is_required') : ""}
                    />
                  )}
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
                      required
                      inputPlaceholder={t('myInfo.visa.select_issuing_country')}
                      onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => onChange(newValue)}
                      value={value}
                      loadRemoteData={() => getCountryList(300, 1)}
                      errorText={errors.issuing_country ? t('validations.issuing_country_required') : ''}
                    />
                  )}
                />
              </div>

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

              <div className='input-item'>
                <label>{t('myInfo.visa.note')}
                  <br />
                </label>
                <Controller
                  name="note"
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
        </form>
      </Wrapper>
    </DialogModal >
  );
};

export default VisaInformationEdit;

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
           margin-bottom: 6px;
           display: inline-block;
           & > sup {
              color: #C54343;
            }
         }
     }
  }
`;