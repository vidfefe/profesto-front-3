import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useForm, Controller } from 'react-hook-form';
import { useParams } from "react-router-dom";
import EmpEditHeader from "../../editHeader";
import DialogModal from "components/Modal/Dialog";
import {
  getEmploymentStatus,
  getJobTitles,
  createJobTitle,
  getJobTerminationReason,
  createTerminationReason,
  getJobTerminationType,
  createTerminationType,
  getEnum,
  getDepartments,
  createDepartment,
  getDivisions,
  createDivision,
  getLocations,
  createLocation,
  getManagerList,
  getJobChangeReason,
  createJobChangeReason
} from "services";
import SelectWithAdd from "components/Dropdowns/SelectWithAdd";
import SelectWithLocationAdd from "components/Dropdowns/SelectWithLocationAdd";
import EnumDropdown from "components/Dropdowns/EnumDropdown";
import SelectDropdown from "components/Dropdowns/SelectDropdown";
import TextArea from "components/TextArea";
import { useToasts } from "react-toast-notifications";
import DatePicker from "components/DatePickers/DatePicker";
import { utcToZonedTime } from 'date-fns-tz';
import { useTranslation } from "react-i18next";
import { EmploymentStatusModal } from "containers/Settings/Dictionaries/Dictionary/EmploymentStatusModal";

const JobInfoEdit = (props: any) => {
  const { handleSubmit, watch, setValue, control, setError, clearErrors, formState: { errors } } = useForm({
    shouldFocusError: true,
    defaultValues: {
      effective_date: new Date(),
      employment_status: null,
      work_type: null,
      job_termination_type: null,
      job_termination_reason: null,
      rehire_eligibility: '',
      job_title: null,
      department: null,
      division: null,
      location: null,
      job_change_reason: null,
      manager: null,
      comment: null
    } as any
  });
  const { person, jobData, editMode, updateMode, chosenItem, defaultStatus, exceptStatus, disabled = false } = props;
  const watchValues = watch();
  const [rehireData, setRehireData] = useState([]);
  const [workTypes, setWorkTypes] = useState([]);
  const [termination, setTermination] = useState<boolean>(false);
  const [employmentStatusModal, setEmploymentStatusModal] = useState(false);

  
  const { addToast } = useToasts();
  const { id: paramsId } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const onSubmit = (data: any) => {
    props.onSubmit(data);
  };

  useEffect(() => {
    getEnum('Enum::RehireEligibility').then(res => setRehireData(res.data));
    getEnum('Enum::WorkType').then(res => setWorkTypes(res.data));
  }, [])

  useEffect(() => {
    clearErrors()
  }, [props.isOpen])

  useEffect(() => {
    if (props.formErrors) {
      props.formErrors.forEach((item: any) => {
        if (item.field && item.field !== 'base') {
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
  
  useEffect(() => {
    setValue('effective_date', chosenItem && !updateMode ? utcToZonedTime(new Date(chosenItem.effective_date), 'UTC') : new Date());
    setValue('employment_status', defaultStatus ?? chosenItem?.employment_status)
    setValue('job_termination_type', chosenItem?.job_termination_type);
    setValue('job_termination_reason', chosenItem?.job_termination_reason);
    setValue('rehire_eligibility', chosenItem?.rehire_eligibility?.id ?? '');
    setValue('job_title', chosenItem?.job_title);
    setValue('work_type', chosenItem?.work_type?.id ?? '');
    setValue('department', chosenItem?.department);
    setValue('division', chosenItem?.division);
    setValue('location', chosenItem?.location);
    setValue('job_change_reason', updateMode ? null : chosenItem?.job_change_reason);
    setValue('manager', chosenItem?.manager);
    setValue('comment', updateMode ? '' : chosenItem?.comment);
  }, [person, editMode, chosenItem, updateMode, props.isOpen])

  useEffect(() => {
    setTermination(watchValues.employment_status?.id_name === 'terminated')
  }, [watchValues.employment_status]);

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
      title={`${editMode ? t('globaly.edit') : t('globaly.lowercase_update')} ${t('employee.job.job_information')}`}
      onClose={() => props.onModalClose()}
      actionButton={handleSubmit(onSubmit, onError)}
      hideActionButton={disabled ? true : false}
      withButtons
      cancelButtonText={t('globaly.cancel')}
      actionButtonText={t('globaly.save')}
      actionLoading={props.loadingRequest}
      fullWidth
      nominalHeader={
        <EmpEditHeader
          employeeName={`${person.first_name} ${person.last_name}`}
          avatarUuid={person.uuid}
          employeeId={person.id}
          jobData={jobData}
        />}
    >
      <Wrapper>
        <form>
          <div className='body'>
            <div className='contact-section'>
              <div className='input-item' style={{ width: 200 }}>
                <Controller
                  name="effective_date"
                  control={control}
                  rules={{ validate: value => value === null ? t('validations.valid_date') : value !== '' || t('validations.date_is_required') }}
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      required
                      selected={value}
                      onChange={onChange}
                      label={t('employee.job.effective_date')}
                      errorText={errors.effective_date ? errors.effective_date.message : ''}
                      disabled={disabled}
                    />
                  )}
                />
              </div>

              <div className='input-item'>
                <label>{t('employee.employment_status')}<sup>*</sup></label>
                <Controller
                  name="employment_status"
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { value, onChange, ref } }) => (
                    <>
                      <SelectDropdown
                        inputPlaceholder={`${t('leftMenuCard.updateJobInformation.select')} ${t('employee.employment_status')}`}
                        disabled={disabled}
                        onChange={(_, value) => onChange(value)}
                        onAddItem={() => setEmploymentStatusModal(true)}
                        value={value}
                        loadRemoteData={() => getEmploymentStatus(100, 1, false, exceptStatus)}
                        errorText={errors.employment_status ? t('validations.employment_status_required') : ''}
                        freeSolo={true}
                      />
                      {employmentStatusModal &&
                        <EmploymentStatusModal
                          afterSubmit={(value) => setValue('employment_status', value)}
                          title={t('employee.employment_status')}
                          onClose={() => setEmploymentStatusModal(false)}
                        />
                      }
                    </>
                  )}
                />
              </div>

              {!termination && <div className='input-item'>
                <label>{t('employee.job.work_type')} <sup>*</sup></label>
                <Controller
                  name="work_type"
                  rules={{ required: t('validations.is_required', {attribute: t('employee.job.work_type')}) }}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <EnumDropdown
                      placeholder={`${t('leftMenuCard.updateJobInformation.select')} ${t('employee.job.work_type')}`}
                      onChange={onChange}
                      errorText={errors.work_type ? errors.work_type.message : '' as any}
                      value={value}
                      options={workTypes}
                    />
                  )}
                />
              </div>}

              {termination && <div>
                <div className='input-item'>
                  <label>{t('employee.job.termination_type')}</label>
                  <Controller
                    name="job_termination_type"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <SelectWithAdd
                        name={t('employee.job.termination_type')}
                        inputPlaceholder={`${t('leftMenuCard.updateJobInformation.select')} ${t('employee.job.termination_type')}`}
                        inputValue={value}
                        loadRemoteData={() => getJobTerminationType(100, 1)}
                        createRequest={createTerminationType}
                        setValue={setValue}
                        onChange={onChange}
                      />
                    )}
                  />
                </div>

                <div className='input-item'>
                  <label>{t('employee.job.termination_reason')}</label>
                  <Controller
                    name="job_termination_reason"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <SelectWithAdd
                        name={t('employee.job.termination_reason')}
                        inputPlaceholder={`${t('leftMenuCard.updateJobInformation.select')} ${t('employee.job.termination_reason')}`}
                        inputValue={value}
                        loadRemoteData={() => getJobTerminationReason(100, 1)}
                        createRequest={createTerminationReason}
                        onChange={onChange}
                        disabled={disabled}
                      />
                    )}
                  />
                </div>

                <div className='input-item'>
                  <label>{t('employee.job.rehire_eligibility')} </label>
                  <Controller
                    name="rehire_eligibility"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <EnumDropdown
                        placeholder={`${t('leftMenuCard.updateJobInformation.select')} ${t('employee.job.rehire_eligibility')}`}
                        onChange={onChange}
                        value={value}
                        options={rehireData}
                        disabled={disabled}
                      />
                    )}
                  />
                </div>
              </div>
              }

              {!termination ? <div>
                <div className='input-item'>
                  <label>{t('employee.job.job_title')}<sup>*</sup></label>
                  <Controller
                    name="job_title"
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { value, onChange } }) => (
                      <SelectWithAdd
                        name={t('employee.job.job_title')}
                        inputPlaceholder={`${t('leftMenuCard.updateJobInformation.select')} ${t('employee.job.job_title')}`}
                        inputValue={value}
                        loadRemoteData={() => getJobTitles(100, 1)}
                        createRequest={createJobTitle}
                        errorText={errors.job_title ? t('validations.job_title_required') : ''}
                        onChange={onChange}
                        disabled={disabled}
                      />
                    )}
                  />
                </div>

                <div className='input-item'>
                  <label>{t('employee.job.department')}</label>
                  <Controller
                    name="department"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <SelectWithAdd
                        name={t('employee.job.department')}
                        inputPlaceholder={`${t('leftMenuCard.updateJobInformation.select')} ${t('employee.job.department')}`}
                        inputValue={value}
                        loadRemoteData={() => getDepartments(100, 1)}
                        createRequest={createDepartment}
                        onChange={onChange}
                        disabled={disabled}
                      />
                    )}
                  />
                </div>

                <div className='input-item'>
                  <label>{t('employee.job.division')}</label>
                  <Controller
                    name="division"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <SelectWithAdd
                        name={t('employee.job.division')}
                        inputPlaceholder={`${t('leftMenuCard.updateJobInformation.select')} ${t('employee.job.division')}`}
                        inputValue={value}
                        loadRemoteData={() => getDivisions(100, 1)}
                        createRequest={createDivision}
                        onChange={onChange}
                        disabled={disabled}
                      />
                    )}
                  />
                </div>

                <div className='input-item'>
                  <label>{t('employee.address.location')}</label>
                  <Controller
                    name="location"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <SelectWithLocationAdd
                        name={t('employee.address.location')}
                        inputPlaceholder={`${t('leftMenuCard.updateJobInformation.select')} ${t('employee.address.location')}`}
                        inputValue={value}
                        loadRemoteData={() => getLocations(100, 1)}
                        createRequest={createLocation}
                        onChange={onChange}
                        disabled={disabled}
                      />
                    )}
                  />
                </div>

                <div className='input-item'>
                  <label>{t('leftMenuCard.updateJobInformation.manager')}</label>
                  <Controller
                    name="manager"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <SelectDropdown
                        inputPlaceholder={`${t('leftMenuCard.updateJobInformation.select')} ${t('leftMenuCard.updateJobInformation.manager')}`}
                        onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
                          onChange(newValue)
                        }}
                        value={value}
                        loadRemoteData={() => getManagerList(100, 1, paramsId ? paramsId : person.id)}
                        withPic
                        disabled={disabled}
                      />
                    )}
                  />
                </div>

                <div className='input-item'>
                  <label>{t('leftMenuCard.updateJobInformation.change_reason')}</label>
                  <Controller
                    name="job_change_reason"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <SelectWithAdd
                        name={t('leftMenuCard.updateJobInformation.change_reason')}
                        inputPlaceholder={`${t('leftMenuCard.updateJobInformation.select')} ${t('leftMenuCard.updateJobInformation.change_reason')}`}
                        inputValue={value}
                        loadRemoteData={() => getJobChangeReason(100, 1)}
                        createRequest={createJobChangeReason}
                        onChange={onChange}
                        disabled={disabled}
                      />
                    )}
                  />
                </div>
              </div>
                : null}

              <div className='input-item' style={{ marginBottom: 0 }}>
                <label>{t('globaly.comment')}</label>
                <Controller
                  name="comment"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TextArea
                      onChange={(event: any) => { onChange(event.target.value) }}
                      maxRows={5}
                      defaultValue={value}
                      disabled={disabled}
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

export default JobInfoEdit;

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
          margin-bottom: 6px;
          margin-top: 6px;
          display: inline-block;
          & > sup {
          color: #C54343;
          }
        }
    }
  }
`;
