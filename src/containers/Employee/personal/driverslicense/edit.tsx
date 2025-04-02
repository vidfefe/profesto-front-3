import { useEffect } from "react";
import styled from "styled-components";
import { Controller, useForm } from 'react-hook-form';
import { useToasts } from "react-toast-notifications";
import DialogModal from "components/Modal/Dialog";
import UniversalInput from "components/Input/UniversalInput";
import EmpEditHeader from "../../editHeader";
import { createClassification, getClassificationList } from "services";
import SelectWithAdd from "components/Dropdowns/SelectWithAdd";
import DatePicker from "components/DatePickers/DatePicker";
import { utcToZonedTime } from 'date-fns-tz';
import { useTranslation } from "react-i18next";

const DriversInformationEdit = (props: any) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();

  const { register, handleSubmit, setValue, setError, control, reset, formState: { errors } } = useForm({
    shouldFocusError: false,
    defaultValues: {
      number: null,
      classification: null,
      region: null,
      expiration_date: ''
    }
  });

  const { user, jobData, chosenLicense, editMode } = props;

  const onSubmit = (data: any) => {
    props.onSubmit(data);
  };

  useEffect(() => {
    if (chosenLicense && editMode) {
      setValue('number', chosenLicense.number ?? null);
      setValue('classification', chosenLicense.employee_driver_classifications[0]?.classification ?? null);
      setValue('region', chosenLicense.region ?? null);
      setValue('expiration_date', chosenLicense.expiration_date && utcToZonedTime(new Date(chosenLicense.expiration_date), 'UTC'));
    } else reset()
  }, [chosenLicense, editMode, props.isOpen])

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

  return (
    <DialogModal
      open={props.isOpen}
      title={`${editMode ? t('globaly.edit') :  t('globaly.lowercase_add')} ${t('myInfo.driver.driver_license')}`}
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
              <div className='input-item'>
                <label>{t('myInfo.driver.license_number')}<sup>*</sup></label>
                <UniversalInput
                  errorText={
                    errors.number ? t('validations.license_required') : ""
                  }
                  {...register("number", { required: true })}
                />
              </div>

              <div className='input-item'>
                <label>{t('myInfo.driver.classification')}<sup>*</sup></label>
                <Controller
                  name="classification"
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange } }) => (
                    <SelectWithAdd
                      name={t('myInfo.driver.classification')}
                      inputPlaceholder={t('myInfo.driver.select_classification')}
                      inputValue={value}
                      loadRemoteData={() => getClassificationList(100, 1)}
                      createRequest={createClassification}
                      onChange={onChange}
                      errorText={errors.classification ? t('validations.classification_is_required') : ""}
                    />
                  )}
                />
              </div>

              <div className='input-item'>
                <label>{t('employee.address.state_province_region')}</label>
                <UniversalInput
                  {...register("region")}
                />
              </div>

              <div className='input-item' style={{ width: 200 }}>
                <Controller
                  name="expiration_date"
                  control={control}
                  rules={{ validate: value => value !== null || t('validations.valid_date') }}
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
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
        </form>
      </Wrapper>
    </DialogModal>
  );
};

export default DriversInformationEdit;

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
