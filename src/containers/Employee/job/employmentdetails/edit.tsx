import { useEffect } from "react";
import styled from "styled-components";
import { Controller, useForm } from 'react-hook-form';
import { useToasts } from "react-toast-notifications";
import DialogModal from "components/Modal/Dialog";
import UniversalInput from "components/Input/UniversalInput";
import EmpEditHeader from "../../editHeader";
import DatePicker from "components/DatePickers/DatePicker";
import { utcToZonedTime } from 'date-fns-tz';
import { useTranslation } from "react-i18next";
import SelectDropdown from "components/Dropdowns/SelectDropdown";
import { getTimeOffRecipuentList } from "services";
import { useParams } from "react-router-dom";
const EmploymentDetailsEdit = (props: any) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();
  const { id: paramsId } = useParams<{ id: string }>();

  const { handleSubmit, watch, setValue, control, formState: { errors } } = useForm({
    shouldFocusError: false,
    defaultValues: {
      hire_date: '',
      probation_end_date: '',
      contract_end_date: '',
      time_off_recipient: null
    } as any
  });
  const { user, jobData } = props;
  const watchValues = watch();

  const onSubmit = (data: any) => {
    props.onSubmit(data);
  };

  useEffect(() => {
    for (const prop of Object.getOwnPropertyNames(errors)) {
      delete errors[prop];
    }
  }, [props.isOpen])

  useEffect(() => {
    if (user) {
      setValue('hire_date', user.employee_employment_detail?.hire_date ?
        utcToZonedTime(new Date(user.employee_employment_detail.hire_date), 'UTC') : '')
      setValue('probation_end_date', user.employee_employment_detail?.probation_end_date ?
        utcToZonedTime(new Date(user.employee_employment_detail.probation_end_date), 'UTC') : '')
      setValue('contract_end_date', user.employee_employment_detail?.contract_end_date ?
        utcToZonedTime(new Date(user.employee_employment_detail.contract_end_date), 'UTC') : '')
      setValue('time_off_recipient', user.employee_employment_detail?.time_off_recipient);
    }
  }, [user, props.isOpen])

  const contractErrors = () => {
    if (watchValues.hire_date && watchValues.contract_end_date && watchValues.hire_date >= watchValues.contract_end_date) {
      return t('employee.job.contract_hire_date')
    } else if (watchValues.probation_end_date && watchValues.contract_end_date && watchValues.probation_end_date >= watchValues.contract_end_date) {
      return t('employee.job.contract_probation_end_date')
    } else {
      return ''
    }
  };

  const probationErrors = () => {
    if (watchValues.hire_date && watchValues.probation_end_date && watchValues.hire_date >= watchValues.probation_end_date) {
      return t('employee.job.probation_hire_date')
    } else {
      return ''
    }
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
      title={t('employee.edit_employment_details')}
      onClose={() => props.onModalClose()}
      actionButton={handleSubmit(onSubmit, onError)}
      withButtons
      cancelButtonText={t('globaly.cancel')}
      actionButtonText={t('globaly.save')}
      actionLoading={props.loadingRequest}
      fullWidth
      nominalHeader={
        <EmpEditHeader
          employeeName={`${user.first_name} ${user.last_name}`}
          avatarUuid={user.uuid}
          employeeId={user.id}
          jobData={jobData}
        />
      }
    >
      <Wrapper>
        <form >
          <div className='body'>
            <div className='contact-section'>
              <div className='input-item'>
                <label>{t('employee.employee_id')}</label>
                <UniversalInput
                  value={user.id}
                  disabled
                />
              </div>

              <div className='input-item' style={{ width: 200 }}>
                <Controller
                  name="hire_date"
                  control={control}
                  rules={{ validate: value => value !== null || t('validations.valid_date') }}
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      selected={value}
                      onChange={onChange}
                      label={t('employee.job.hire_date')}
                      errorText={errors.hire_date ? errors.hire_date.message : ''}
                    />
                  )}
                />
              </div>

              <div className='input-item' style={{ width: 200 }}>
                <Controller
                  name="probation_end_date"
                  control={control}
                  rules={{
                    validate: (value: any) => value === null ? t('validations.valid_date') : (!watchValues.hire_date || !value) || watchValues.hire_date as any < value
                      || probationErrors(),
                  }}
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      selected={value}
                      onChange={onChange}
                      label={t('employee.job.probation_end_date')}
                      errorText={errors.probation_end_date ? errors.probation_end_date.message : ''}
                    />
                  )}
                />
              </div>

              <div className='input-item' style={{ width: 200 }}>
                <Controller
                  name="contract_end_date"
                  control={control}
                  rules={{
                    validate: (value: any) => value === null ? t('validations.valid_date') :
                      ((!watchValues.hire_date || !value) || watchValues.hire_date as any < value) &&
                      ((!watchValues.probation_end_date || !value) || watchValues.probation_end_date as any < value)
                      || contractErrors()
                  }}
                  render={({ field: { onChange, value } }) => (

                    <DatePicker
                      selected={value}
                      onChange={onChange}
                      label={t('employee.job.contract_end_date')}
                      errorText={errors.contract_end_date ? errors.contract_end_date.message : ''}
                    />
                  )}
                />
              </div>

              <div className='input-item'>
                  <label>{t('employee.job.time_off_alert_recipient')}</label>
                  <Controller
                    name="time_off_recipient"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <SelectDropdown
                        inputPlaceholder={`${t('leftMenuCard.updateJobInformation.select')} ${t('employee.job.time_off_alert_recipient')}`}
                        onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
                          onChange(newValue)
                        }}
                        value={value}
                        loadRemoteData={() => getTimeOffRecipuentList(100, 1, paramsId ? paramsId : user.id)}
                        withPic
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

export default EmploymentDetailsEdit;

const ToastContentContainer = styled.div`
    & > b {
      font-family: 'Aspira Demi', 'FiraGO Regular';
    }
`;

const Wrapper = styled.div`
  .body{
    .input-item{
      max-width: 200px;
      margin-bottom: 15px;
      
      & > label{
        margin-bottom: 6px;
        margin-top: 6px;
        display: inline-block;
      }
    }
  }
`;