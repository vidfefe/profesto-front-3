import { useEffect } from "react";
import styled from "styled-components";
import { Controller, useForm } from 'react-hook-form';
import { useToasts } from "react-toast-notifications";
import { FORM_PATTERNS } from '../../../../constants';
import UniversalInput from "components/Input/UniversalInput";
import EmpEditHeader from "../../editHeader";
import DialogModal from "components/Modal/Dialog";
import { getEducationDegree, createEducationDegree } from "services";
import SelectWithAdd from "components/Dropdowns/SelectWithAdd";
import DatePicker from "components/DatePickers/DatePicker";
import { utcToZonedTime } from 'date-fns-tz';
import { useTranslation } from "react-i18next";

const EducationInformationEdit = (props: any) => {
  const { addToast } = useToasts();
  const { t } = useTranslation();
  const { register, handleSubmit, watch, setValue, setError, control, reset, formState: { errors } } = useForm({
    shouldFocusError: false,
    defaultValues: {
      institution: null,
      specialization: null,
      education_degree: null,
      gpa: null,
      start_date: '',
      end_date: ''
    }
  });
  const watchValues = watch();
  const { user, jobData, editMode, chosenEducation } = props;

  const onSubmit = (data: any) => {
    props.onSubmit(data);
  };

  useEffect(() => {

    if (chosenEducation && editMode) {
      setValue('institution', chosenEducation.institution ?? null);
      setValue('specialization', chosenEducation.specialization ?? null);
      setValue('education_degree', chosenEducation.education_degree ?? null);
      setValue('gpa', chosenEducation.gpa ?? null);
      setValue('start_date', chosenEducation.start_date && utcToZonedTime(new Date(chosenEducation.start_date), 'UTC'));
      setValue('end_date', chosenEducation.end_date && utcToZonedTime(new Date(chosenEducation.end_date), 'UTC'));
    } else reset();
  }, [chosenEducation, editMode, props.isOpen])

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
      title={`${editMode ? t('globaly.edit') :  t('globaly.lowercase_add')} ${t('myInfo.eduction.education_information')}`}
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
            <div>
              <div className='input-item'>
                <label>{t('myInfo.eduction.college_institution')}{!watchValues.education_degree && !watchValues.specialization ? <sup>*</sup> : null}</label>
                <UniversalInput
                  errorText={
                    errors.institution ? t('validations.one_filled') : ""
                  }
                  {...register('institution',
                    { required: !watchValues.education_degree && !watchValues.specialization }
                  )}
                />
              </div>

              <div className='input-item'>
                <label>{t('myInfo.eduction.degree')}{!watchValues.specialization && !watchValues.institution ? <sup>*</sup> : null}</label>
                <Controller
                  name="education_degree"
                  control={control}
                  rules={{ required: !watchValues.specialization && !watchValues.institution }}
                  render={({ field: { value, onChange } }) => (
                    <SelectWithAdd
                      name={t('myInfo.eduction.degree')}
                      inputPlaceholder={t('myInfo.eduction.select_degree')}
                      inputValue={value}
                      loadRemoteData={() => getEducationDegree(100, 1)}
                      createRequest={createEducationDegree}
                      onChange={onChange}
                      errorText={errors.education_degree ? t('validations.one_filled') : ""}
                    />
                  )}
                />
              </div>

              <div className='input-item'>
                <label>{t('myInfo.eduction.major_specialization')}{!watchValues.institution && !watchValues.education_degree ? <sup>*</sup> : null}</label>
                <UniversalInput
                  errorText={errors.specialization ? t('validations.one_filled') : ""}
                  {...register('specialization', { required: !watchValues.institution && !watchValues.education_degree })}
                />

              </div>

              <div className='input-item'>
                <label>{t('myInfo.eduction.gpa')}</label>
                <UniversalInput
                  errorText={
                    errors.gpa ? t('validations.gpa_validation') : ""
                  }
                  {...register('gpa', {
                    validate: (value: any) =>
                      !value || (value <= 4 && value >= 0)
                  })}
                />

              </div>

              <div className='input-item d-flex justify-content-between' style={{gap: 10}}>

                <div style={{ flex: 1 }}>
                  <Controller
                    name="start_date"
                    control={control}
                    rules={{ validate: value => value !== null || t('validations.valid_date') }}
                    render={({ field: { onChange, value } }) => (
                      <DatePicker
                        selected={value}
                        onChange={onChange}
                        label={t('myInfo.eduction.start_date')}
                        errorText={errors.start_date ? errors.start_date.message : ''}
                      />
                    )}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <Controller
                    name="end_date"
                    control={control}
                    rules={{
                      validate: (value: any) => value === null ? t('validations.valid_date') :
                        (!watchValues.start_date || !value) || watchValues.start_date as any < value
                        || t('validations.date_greater')
                    }}
                    render={({ field: { onChange, value } }) => (
                      <DatePicker
                        selected={value}
                        onChange={onChange}
                        label={t('myInfo.eduction.end_date')}
                        errorText={errors.end_date ? errors.end_date.message : ''}
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

export default EducationInformationEdit;

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