import React, { useState, useEffect, SyntheticEvent } from 'react';
import { useHistory } from 'react-router-dom';
import { useForm, Controller, useWatch } from 'react-hook-form';
import styled from 'styled-components';
import { useToasts } from 'react-toast-notifications';
import { PatternFormat } from 'react-number-format';
import isEqual from 'date-fns/isEqual'
import utcToZonedTime from 'date-fns-tz/utcToZonedTime';
import Wrapper from './FormWrapper';
import { FORM_PATTERNS } from '../../constants';
import { calculateAge } from 'utils/common';
import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import UniversalInput from 'components/Input/UniversalInput';
import DatePicker from "components/DatePickers/DatePicker";
import EnumDropdown from "components/Dropdowns/EnumDropdown";
import SelectDropdown from "components/Dropdowns/SelectDropdown";
import Checkbox from "components/Checkbox";
import SelectWithAdd from "components/Dropdowns/SelectWithAdd";
import SelectWithLocationAdd from "components/Dropdowns/SelectWithLocationAdd";
import InputWithSelect from "components/Dropdowns/InputWithSelect";
import {
  createDepartment,
  createDivision,
  createJobTitle,
  createLocation, createPaymentSchedule,
  getCountryList,
  getCurrencies,
  getDepartments,
  getDivisions,
  getEmploymentStatus, getEnum,
  getJobTitles,
  getLocations,
  getManagerList,
  getPaymentPeriod,
  getPaymentSchedule,
  getPaymentTypes,
  getStateList,
  getUserRoleList
} from "services";
import { useTranslation } from "react-i18next";
import { ReactComponent as PersonIcon } from 'assets/svg/info_circle/person-circle.svg';
import { ReactComponent as HomeIcon } from 'assets/svg/info_circle/home-circle.svg';
import { ReactComponent as MobileIcon } from 'assets/svg/info_circle/mobile-circle.svg';
import { ReactComponent as SuitCaseIcon } from 'assets/svg/info_circle/suitcase-circle.svg';
import { ReactComponent as WalletIcon } from 'assets/svg/info_circle/wallet-circle.svg';
import { ReactComponent as PadlockIcon } from 'assets/svg/info_circle/padlock-circle.svg';
import { region } from "lib/Regionalize";
import { isEmpty, find, sortBy } from 'lodash';
import PersonalNumber from 'components/PersonalNumber';
import { PaymentType, PaymentTypeCategory, PaymentTypeClass } from 'types';
import { EmploymentStatusModal } from 'containers/Settings/Dictionaries/Dictionary/EmploymentStatusModal';
interface HeadingComponentProps {
  text: string,
  icon: string
};

const INFO_CIRCLES: any = {
  personal: <PersonIcon />,
  address: <HomeIcon />,
  mobile: <MobileIcon />,
  job: <SuitCaseIcon />,
  compensation: <WalletIcon />,
  access: <PadlockIcon />
};

const HeadingComponent = ({ text, icon }: HeadingComponentProps) => {
  return <div className='heading'>
    {INFO_CIRCLES[icon]} <span>{text}</span>
  </div>
};

const valuesFilled = (items: any) => {
  const leftOvers = items.filter((item: any) => item !== false && item !== undefined && item !== '' && item !== null);

  if (leftOvers.length) {
    return true;
  } else {
    return false;
  }
};

const CreatePersonForm = ({
  onFormSubmit,
  propErrors,
  loadingEmployeeCreation,
  formType,
  employeeData
}: any) => {
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    setFocus,
    control,
    clearErrors,
    trigger,
    getValues,
    formState: { errors }
  } = useForm({
    mode: 'onSubmit',
    defaultValues: {
      first_name: null,
      last_name: null,
      middle_name: null,
      preferred_name: null,
      personal_number: null,
      remove_mask: false,
      ssn: '',
      birth_date: '',
      gender: '',
      marital_status: '',
      country_home: null,
      address_home: null,
      address_details_home: null,
      city_home: null,
      region_home: null,
      state_home: null,
      postal_code_home: null,
      addresses_are_same: false,
      country_mailing: null,
      address_mailing: null,
      address_details_mailing: null,
      city_mailing: null,
      region_mailing: null,
      postal_code_mailing: null,
      state_mailing: null,
      work_phone: null,
      work_phone_ext: null,
      mobile_phone: null,
      home_phone: null,
      work_email: null,
      personal_email: null,
      hire_date: '',
      effective_date: '',
      employment_status: null,
      work_type: null,
      job_title: null,
      department: null,
      division: null,
      location: null,
      manager: null,
      effective_date_compensation: '',
      pay_amount: { inputValue: '', selectValue: '' },
      payment_period: null,
      payment_type: null,
      payment_schedule: null,
      additional_payment_types: [],
      role: null,
      user_email: null,
      invite: true,
      onboarding: true,
      i9_form: region(['eng']) ? true : false,
      job_date_different: false,
      comp_date_different: false,
      pension_status: null,
      bank_account: ''
    } as any
  });
  const { t } = useTranslation();

  useEffect(() => {
    if (employeeData?.onboarding && employeeData?.userInfo && employeeData?.jobDetails && employeeData?.compensationData) {
      setValue('role', employeeData.onboarding.role);
      setValue('user_email', employeeData.onboarding.email);
      setValue('i9_form', employeeData.onboarding.fill_i9);

      setValue('first_name', employeeData.userInfo.first_name);
      setValue('middle_name', employeeData.userInfo.middle_name);
      setValue('last_name', employeeData.userInfo.last_name);
      setValue('personal_number', employeeData.userInfo.personal_number);
      setValue('remove_mask', employeeData.userInfo.remove_mask);

      setValue('work_phone', employeeData.contact?.work_phone);
      setValue('work_phone_ext', employeeData.contact?.work_phone_ext);
      setValue('work_email', employeeData.contact?.work_email);
      setValue('personal_email', employeeData.contact?.personal_email);


      setValue('effective_date', employeeData.jobDetails?.effective_date && utcToZonedTime(new Date(employeeData.jobDetails?.effective_date), 'UTC'));
      setValue('hire_date', employeeData.jobDetails?.hire_date && utcToZonedTime(new Date(employeeData.jobDetails?.hire_date), 'UTC'));
      if (!isEqual(new Date(employeeData.jobDetails?.effective_date), new Date(employeeData.jobDetails?.hire_date))) {
        setValue('job_date_different', true);
      };
      setValue('employment_status', employeeData.jobDetails?.employment_status);
      setValue('work_type', employeeData.jobDetails?.work_type);
      setValue('job_title', employeeData.jobDetails?.job_title);
      setValue('manager', employeeData.jobDetails?.manager);
      setValue('department', employeeData.jobDetails?.department);
      setValue('division', employeeData.jobDetails?.division);
      setValue('location', employeeData.jobDetails?.location);

      setValue('effective_date_compensation', employeeData.compensationData?.effective_date && utcToZonedTime(new Date(employeeData.compensationData?.effective_date), 'UTC'));
      if (!isEqual(new Date(employeeData.jobDetails?.effective_date), new Date(employeeData.compensationData?.effective_date))) {
        setValue('comp_date_different', true);
      };
      setValue('pay_amount', { inputValue: (+employeeData?.compensationData?.pay_amount).toFixed(2), selectValue: employeeData?.compensationData?.currency });
      setValue('payment_period', employeeData.compensationData?.payment_period);
      setValue('payment_type', employeeData.compensationData?.payment_type);
      setValue('payment_schedule', employeeData.compensationData?.payment_schedule);
      setValue('additional_payment_types', employeeData.compensationData?.additional_payment_types
        ? employeeData.compensationData.additional_payment_types.map((item: PaymentType) => item.id)
        : []
      );

      setValue('bank_account', employeeData.compensationData?.bank_account);
      setValue('pension_status', employeeData.compensationData?.pension_status?.id ?? '');
    };
  }, [employeeData?.onboarding?.email, employeeData?.userInfo?.first_name, employeeData?.contact?.work_phone, employeeData?.jobDetails?.effective_date, employeeData?.compensationData?.effective_date]);


  const { addToast } = useToasts();
  const history = useHistory();
  const [overtimePaymentTypes, setOvertimePaymentTypes] = useState<PaymentType[]>([]);
  const [genderData, setGenders] = useState([]);
  const [maritalStatusData, setMaritalStatusData] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [exceptStatus, setExceptStatus] = useState<any>(null);
  const [workTypes, setWorkTypes] = useState([]);
  const [pensionStatus, setPensionStatus] = useState<any>([]);
  const [employmentStatusModal, setEmploymentStatusModal] = useState(false);

  const watchFields_invite = watch('invite');
  const watchFields_onboarding = useWatch({ control, name: 'onboarding' })
  const watchFields_i9_form = useWatch({ control, name: 'i9_form' })
  const watchFields_first_name = watch('first_name');
  const watchFields_last_name = watch('last_name');
  const watchFields_personal_number = watch('personal_number');
  const watchFields_remove_mask = watch('remove_mask');
  const watchFields_birth_date = useWatch({ control, name: 'birth_date' })
  const watchFields_country_home = watch('country_home');
  const watchFields_address_home = watch('address_home');
  const watchFields_address_details_home = watch('address_details_home');
  const watchFields_city_home = watch('city_home');
  const watchFields_region_home = watch('region_home');
  const watchFields_postal_code_home = watch('postal_code_home');
  const watchFields_addresses_are_same = watch('addresses_are_same');
  const watchFields_country_mailing = watch('country_mailing');
  const watchFields_address_mailing = watch('address_mailing');
  const watchFields_address_details_mailing = watch('address_details_mailing');
  const watchFields_city_mailing = watch('city_mailing');
  const watchFields_region_mailing = watch('region_mailing');
  const watchFields_postal_code_mailing = watch('postal_code_mailing');
  const watchFields_work_email = useWatch({ control, name: 'work_email' })
  const watchFields_personal_email = useWatch({ control, name: 'personal_email' })
  const watchFields_role = watch('role');
  const watchFields_user_email = watch('user_email')
  const watchFields_hire_date = watch('hire_date');
  const watchFields_effective_date = watch('effective_date');
  const watchFields_job_date_different = useWatch({ control, name: 'job_date_different' })
  const watchFields_department = useWatch({ control, name: 'department' })
  const watchFields_employment_status = watch('employment_status');
  const wacthFields_work_type = watch('work_type');
  const watchFields_job_title = watch('job_title');
  const watchFields_division = useWatch({ control, name: 'division' })
  const watchFields_location = useWatch({ control, name: 'location' })
  const watchFields_manager = useWatch({ control, name: 'manager' })
  const watchFields_effective_date_compensation = watch('effective_date_compensation');
  const watchFields_comp_date_different = useWatch({ control, name: 'comp_date_different' })
  const watchFields_pay_amount = watch('pay_amount');
  const watchFields_payment_type = watch('payment_type');
  const watchFields_payment_period = watch('payment_period');
  const watchFields_payment_schedule = useWatch({ control, name: 'payment_schedule' })

  useEffect(() => {
    if (watchFields_work_email || watchFields_personal_email) {
      trigger("work_email");
      trigger("personal_email");
    }
  }, [watchFields_work_email, trigger, watchFields_personal_email]);

  useEffect(() => {
    if (propErrors) {
      addToast(<ToastContentContainer dangerouslySetInnerHTML={{ __html: t('globaly.fix_Highlighted') }} />, {
        appearance: 'error',
        autoDismiss: true,
        placement: 'top-center'
      });

      propErrors.forEach((item: any) => setError(field_name(item.field) as any, { type: 'string', message: item.message }));
      const findPersonalNumber = find(propErrors, (item: any) => { return item.field === 'personal_number'});
      !isEmpty(findPersonalNumber) ? setFocus(field_name('personal_number') as any) : setFocus(field_name(propErrors?.[0]?.field) as any);
    }
  }, [addToast, propErrors, setError, setFocus]);

  const field_name = (error_field: any) => {
    return String(error_field).split('.').pop()
  };

  useEffect(() => {
    if (watchFields_payment_type) {
      getPaymentPeriod(25, 1, false, watchFields_payment_type.class.id).then((res) =>
        setValue('payment_period', res.data.list[0])
      );
      if (!watchFields_pay_amount.selectValue) {
        setValue('pay_amount', {
          inputValue: watchFields_pay_amount.inputValue,
          selectValue: currencies?.[0] || watchFields_pay_amount.selectValue,
        });
      }
      if (![PaymentTypeClass.HOURLY, PaymentTypeClass.SALARY].includes(watchFields_payment_type.class.id)) {
        setValue('pay_amount', { inputValue: null, selectValue: null });
        setValue('payment_period', null);
        setValue('additional_payment_types', []);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchFields_payment_type?.class.id]); 

  useEffect(() => {
    getPaymentTypes(25, 1, false, PaymentTypeCategory.ADDITIONAL).then((res) =>
      setOvertimePaymentTypes(sortBy(res.data.list, ['id']))
    );
    getEnum('Enum::Gender').then(res => setGenders(res.data));
    getEnum('Enum::MaritalStatus').then(res => setMaritalStatusData(res.data));
    getEnum('Enum::WorkType').then(res => setWorkTypes(res.data));
    getEnum('Enum::PensionStatus').then(res => setPensionStatus(res.data));
    getCurrencies(55, 1).then(res => setCurrencies(res.data.list));
    getEmploymentStatus(100, 1).then(res => { setExceptStatus(res.data.list.find((item: any) => item.id_name === 'terminated')?.id) })
  }, []);

  useEffect(() => {
    setValue('country_mailing', null);
    setValue('address_mailing', null);
    setValue('address_details_mailing', null);
    setValue('city_mailing', null);
    setValue('region_mailing', null);
    setValue('postal_code_mailing', null);
    setValue('state_mailing', null);
  }, [watchFields_addresses_are_same])

  useEffect(() => {
    if (currencies && !employeeData) {
      setValue('pay_amount', {
        inputValue: '',
        selectValue: currencies[0] ?? null
      });
    }
  }, [currencies]);

  const onSubmit = (data: any) => {
    if (!data.job_date_different) {
      data.hire_date = data.effective_date
    }
    if (!data.comp_date_different) {
      data.effective_date_compensation = data.effective_date
    }

    onFormSubmit(data);
  };

  const inviteOnChange = (value: boolean) => {
    setValue('invite', value);
    if (!value) {
      setValue('onboarding', false)
      setValue('i9_form', false)
    }
  };

  const onboardingOnChange = (value: boolean) => {
    setValue('onboarding', value);
    if (!value) {
      setValue('i9_form', false)
    }
  };

  const jobInfoRequired = () => {
    return valuesFilled([
      watchFields_effective_date,
      watchFields_hire_date,
      watchFields_department,
      wacthFields_work_type,
      watchFields_employment_status,
      watchFields_job_title,
      watchFields_division,
      watchFields_location,
      watchFields_manager
    ]) || watchFields_onboarding
  };

  const compensationRequired = () => {
    return valuesFilled([
      watchFields_effective_date_compensation,
      watchFields_pay_amount?.inputValue,
      watchFields_payment_type,
      watchFields_payment_period,
      watchFields_payment_schedule,
    ]) || watchFields_onboarding
  };

  const showCompensationPayRate =
    (!watchFields_payment_type || [PaymentTypeClass.HOURLY, PaymentTypeClass.SALARY].includes(watchFields_payment_type.class.id));

  const tooltipText = () => {
    const errorList = []

    //Access
    watchFields_invite && !watchFields_role && errorList.push(t('createPerson.access_level'))
    watchFields_invite && !watchFields_user_email && errorList.push(t('createPerson.sign_in_email'))

    // Personal
    !watchFields_first_name && errorList.push(t('employee.first_name'))
    !watchFields_last_name && errorList.push(t('employee.last_name'))
    if (!watchFields_remove_mask) {
      if (isEmpty(watchFields_personal_number)) {
        errorList.push(t('employee.personal_number'))
      }
      else {
        watchFields_personal_number?.length < 11 && errorList.push(t('employee.personal_number'))
      }
    }
    else {
      !watchFields_personal_number && errorList.push(t('employee.personal_number'))
    }
    // Address
    !watchFields_country_home && !watchFields_onboarding && valuesFilled([
      watchFields_address_home,
      watchFields_address_details_home,
      watchFields_city_home,
      watchFields_region_home,
      watchFields_postal_code_home]) && errorList.push(t('employee.home_country'))

    !watchFields_addresses_are_same && !watchFields_onboarding && !watchFields_country_mailing && valuesFilled([
      watchFields_address_mailing,
      watchFields_address_details_mailing,
      watchFields_city_mailing,
      watchFields_region_mailing,
      watchFields_postal_code_mailing,]) && errorList.push(t('employee.mailing_country'))

    //Job
    !watchFields_hire_date && jobInfoRequired() && watchFields_job_date_different && errorList.push(t('employee.job.original_hire_date'))
    !watchFields_effective_date && jobInfoRequired() && errorList.push(t('employee.job.job_effective_date'))
    !watchFields_employment_status && jobInfoRequired() && errorList.push(t('employee.employment_status'))
    !wacthFields_work_type && jobInfoRequired() && errorList.push(t('employee.job.work_type'))
    !watchFields_job_title && jobInfoRequired() && errorList.push(t('employee.job.job_title'))

    //Compensation
    !watchFields_effective_date_compensation && compensationRequired() && watchFields_comp_date_different && errorList.push(t('employee.job.compensation_effective_date'))
    !watchFields_payment_type && compensationRequired() && errorList.push(t('employee.job.payment_type'));
    if (showCompensationPayRate) {
      !watchFields_pay_amount.inputValue && compensationRequired() && errorList.push(t('employee.job.payment_rate'));
      !watchFields_payment_period && compensationRequired() && errorList.push(t('employee.job.pay_period'));
    }

    return errorList
  };

  const getSubmitState = () => {
    return tooltipText().length > 0
  };

  const renderTooltip = () => {
    return <div>
      {t('createPerson.please_fill_the_information')}
      <ul className='error-overlay-list'>
        {tooltipText().map((item: any) => { return <li key={item}>{item}</li> })}
      </ul>
    </div>
  };

  const onError = (err: any) => {
    if (err) {
      addToast(<ToastContentContainer dangerouslySetInnerHTML={{ __html: t('globaly.fix_Highlighted') }} />, {
        appearance: 'error',
        autoDismiss: true,
        placement: 'top-center'
      });
    }
  };

  const onClearPersonalNumber = (removeMask: boolean) => {
    if (!removeMask) {
      setValue('personal_number', '');
      clearErrors();
    }
  }

  useEffect(() => {
    if (watchFields_remove_mask) {
      clearErrors();
    }
  }, [watchFields_remove_mask])

  return (
    <Wrapper>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        {/* System access */}
        <div className='system-access'>
          <HeadingComponent text={t('createPerson.system_access')} icon='access' />

          <div className='d-flex' style={{ marginBottom: 22 }}>
            <div
              className={`radio-item ${watchFields_invite ? "selected" : ''}`}
              tabIndex={0}
              onClick={() => formType === 'onboarding_update' ? null : inviteOnChange(!watchFields_invite)}
            >
              <Controller
                name="invite"
                control={control}
                render={({ field: { value } }) => (
                  <Checkbox
                    checked={value}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => inviteOnChange(event.target.checked)}
                    disabled={formType === 'onboarding_update'}
                  />
                )}
              />

              <div style={{ marginLeft: 15 }}>
                <p className='title'><span>{t('createPerson.allow_access_to')}</span></p>
                <p className='subtitle'>{t('createPerson.this_employee_will')}</p>
              </div>
            </div>
          </div>

          <div className='d-flex'>
            {watchFields_invite && <div className='input-item' style={{ paddingBottom: 10 }}>
              <label>{t('createPerson.access_level')}{watchFields_invite ? <sup>*</sup> : null}</label>
              <Controller
                name="role"
                control={control}
                rules={{ required: watchFields_invite && t('validations.access_level_required') }}
                render={({ field: { onChange, value } }) => (
                  <SelectDropdown
                    inputPlaceholder={t('createPerson.select_access_level')}
                    onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
                      onChange(newValue)
                    }}
                    value={value}
                    loadRemoteData={() => getUserRoleList(50, 1, 0, true, t)}
                    errorText={errors.role ? errors.role.message : ''}
                  />
                )}
              />
            </div>}

            {watchFields_invite && <div className='input-item'>
              <label>{t('createPerson.sign_in_email')}{watchFields_invite ? <sup>*</sup> : null}</label>
              <UniversalInput
                inputProps={{ maxLength: 250 }}
                errorText={
                  errors.user_email ? errors?.user_email?.message : "" as any
                }
                {...register("user_email", {
                  required: watchFields_invite ? true : false,
                  pattern: FORM_PATTERNS.email,
                  maxLength: 250
                })}
              />
            </div>}
          </div>

          {watchFields_invite && <div className='d-flex' style={{ marginBottom: 20 }}>
            <div
              className={`radio-item ${watchFields_onboarding ? "selected" : ''}`}
              tabIndex={0}
              onClick={() => formType === 'onboarding_update' ? null : onboardingOnChange(!watchFields_onboarding)}
            >
              <Controller
                name="onboarding"
                control={control}
                render={({ field: { value } }) => (
                  <Checkbox
                    checked={value}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => onboardingOnChange(event.target.checked)}
                    disabled={formType === 'onboarding_update'}
                  />
                )}
              />

              <div style={{ marginLeft: 15 }}>
                <p className='title'><span>{t('createPerson.invite_the_employee')}</span></p>
                <p className='subtitle'>{t('createPerson.invite_the_employee_process')}</p>
              </div>
            </div>
          </div>}

          {region(['eng']) && watchFields_invite && watchFields_onboarding && <div className='d-flex' style={{ marginBottom: 20 }}>
            <div className={`radio-item ${watchFields_i9_form ? "selected" : ''}`} tabIndex={0} onClick={() => setValue('i9_form', !watchFields_i9_form)}>
              <Controller
                name="i9_form"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Checkbox
                    checked={value}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.checked)}
                  />
                )}
              />
              <div style={{ marginLeft: 15 }}>
                <p className='title'><span>{t('createPerson.employment_eligibility')}</span></p>
                <p className='subtitle'>{t('createPerson.during_onboarding')}</p>
              </div>
            </div>
          </div>}
        </div>

        <hr />

        {/********* PERSONAL INFO ***********/}
        <div style={{ marginBottom: 62, marginTop: 22 }}>
          <div className='personal-info'>
            <HeadingComponent text={t('settings.menu.personal_information')} icon='personal' />
            <div className='top' style={{ marginBottom: errors.last_name || errors.first_name ? 10 : 0 }}>

              <div className='input-item'>
                <label>{t('employee.first_name')}<sup>*</sup></label>
                <UniversalInput
                  errorText={errors.first_name ? errors.first_name.message : '' as any}
                  {...register('first_name', { required: t('validations.first_name_required') })}
                />
              </div>

              {region(['eng']) && <div className='input-item'>
                <label>{t('employee.middle_name')}</label>
                <UniversalInput
                  {...register('middle_name')}
                />
              </div>}

              <div className='input-item'>
                <label>{t('employee.last_name')}<sup>*</sup></label>
                <UniversalInput
                  errorText={errors.last_name ? errors.last_name.message : '' as any}
                  {...register("last_name", { required: t('validations.last_name_required') })}
                />
              </div>


              {!watchFields_onboarding && <div className='input-item'>
                <label>{t('employee.preferred_name')}</label>
                <UniversalInput
                  {...register("preferred_name")}
                />
              </div>}

            </div>

            <div>
              {region(['geo']) &&
                <div style={{ marginBottom: 15 }}>
                  <div className="input-item" style={{ marginBottom: 5 }}>
                    <PersonalNumber
                      register={{ ...register('personal_number', { required: t('validations.personal_number_required'), validate: value => value.length > 0 ? true : false }) }}
                      control={control}
                      errors={errors}
                      wacthRemoveMask={watchFields_remove_mask}
                      watchPersonalNumber={watchFields_personal_number}
                      onClear={(removeMask: boolean) => onClearPersonalNumber(removeMask)}
                    />
                  </div>
                </div>
              }
            </div>

            {!watchFields_onboarding && <div>
              <div className='input-item' style={{ width: 500 }}>
                <label>{t('employee.birth_date')}</label>
                <div className='birth-date'>
                  <div style={{ width: 292 }}>
                    <Controller
                      name="birth_date"
                      control={control}
                      rules={{ validate: value => value !== null || t('validations.valid_date') }}
                      render={({ field: { onChange, value, ref } }) => (
                        <DatePicker
                          ref={ref}
                          selected={value}
                          onChange={onChange}
                          errorText={errors.birth_date ? errors.birth_date.message : ''}
                        />
                      )}
                    />
                  </div>

                  {watchFields_birth_date && <span className='age'>({t('employee.age')}: {calculateAge(watchFields_birth_date)})</span>}
                </div>
              </div>

              <div className='d-flex'>
                <div className='input-item'>
                  <label>{t('employee.gender')}</label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <EnumDropdown
                        placeholder={t('createPerson.select_gender')}
                        onChange={onChange}
                        value={value}
                        options={genderData}
                      />
                    )}
                  />
                </div>

                <div className='input-item'>
                  <label>{t('employee.marital_status_name')}</label>
                  <Controller
                    name="marital_status"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <EnumDropdown
                        placeholder={t('createPerson.select_marital_status')}
                        onChange={onChange}
                        errorText={errors.marital_status ? t('validations.please_choose_marital_status') : ''}
                        value={value}
                        options={maritalStatusData}
                      />
                    )}
                  />
                </div>
              </div>

              {region(['eng']) && <div>
                <div className='input-item'>
                  <label>{t('employee.ssn')}</label>
                  <Controller
                    name="ssn"
                    control={control}
                    rules={{
                      pattern: FORM_PATTERNS.ssn
                    }}
                    render={({ field: { onChange, value } }) => (
                      <PatternFormat
                        format="###-##-####"
                        mask={"_"}
                        valueIsNumericString
                        value={value}
                        onValueChange={(e) => onChange(e.value)}
                        className={`form_control ${errors.ssn ? 'error-input' : ''}`}
                      />
                    )}
                  />
                  <span style={{
                    color: 'var(--red)',
                    marginTop: 6,
                    fontSize: 10,
                    display: 'inline-block'
                  }}>{errors.ssn ? errors.ssn.message : ''} </span>
                </div>
              </div>}
            </div>}
          </div>
          <hr />

          {/****** Adresses *******/}
          {!watchFields_onboarding && <div>
            <div className='addresses-section'>
              <HeadingComponent text={t('employee.address.addresses')} icon='address' />
              <h4 className='section-header'>{t('employee.address.home_address')}</h4>
              <div>
                <div className='input-item-large'>
                  <label>{t('employee.address.country')}{
                    !watchFields_country_home && valuesFilled([
                      watchFields_address_home,
                      watchFields_address_details_home,
                      watchFields_city_home,
                      watchFields_region_home,
                      watchFields_postal_code_home,
                    ]) ?
                      <sup>*</sup> : null}</label>
                  <Controller
                    name="country_home"
                    control={control}
                    rules={{
                      required: !watchFields_country_home && valuesFilled([
                        watchFields_address_home,
                        watchFields_address_details_home,
                        watchFields_city_home,
                        watchFields_region_home,
                        watchFields_postal_code_home,
                      ]) && !watchFields_onboarding
                    }}
                    render={({ field: { onChange, value } }) => (
                      <SelectDropdown
                        inputPlaceholder={t('createPerson.select_country')}
                        onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
                          onChange(newValue)
                        }}
                        value={value}
                        loadRemoteData={() => getCountryList(300, 1)}
                        errorText={errors.country_home ? t('validations.country_is_required') : ''}
                      />
                    )}
                  />
                </div>
              </div>

              <div>
                <div className='input-item-large'>
                  <label>{t('employee.address.address_line_one')}</label>
                  <UniversalInput
                    placeholder={t('employee.address.street_address_example')}
                    errorText={
                      errors.address_home ? t('validations.please_enter_address_line_one') : ""
                    }
                    {...register("address_home")}
                  />
                </div>
              </div>

              <div>
                <div className='input-item-large'>
                  <label>{t('employee.address.address_line_two')}</label>
                  <UniversalInput
                    placeholder={t('employee.address.street_address_example_two')}
                    errorText={
                      errors.address_details_home ? t('validations.please_enter_address_line_two') : ""
                    }
                    {...register("address_details_home")}
                  />
                </div>
              </div>

              <div className='state-province'>
                <div className='input-item'>
                  <label>{t('employee.address.city')}</label>
                  <UniversalInput
                    errorText={
                      errors.city_home ? t('validations.please_enter_city') : ""
                    }
                    {...register("city_home")}
                  />
                </div>

                <div className='input-item'>
                  <label>{t('employee.address.state_province_region')}</label>
                  {watchFields_country_home?.iso === 'US' ? <Controller
                    name="state_home"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <SelectDropdown
                        onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
                          onChange(newValue)
                        }}
                        value={value}
                        loadRemoteData={() => getStateList(200, 1)}
                        inputPlaceholder={t('createPerson.select_state')}
                      />
                    )}
                  /> : <UniversalInput
                    errorText={
                      errors.region_home ? t('validations.please_enter_state_info') : ""
                    }
                    {...register("region_home")}
                  />
                  }
                </div>

                <div className='input-item'>
                  <label>{t('employee.address.postal_code')}</label>
                  <UniversalInput
                    errorText={
                      errors.postal_code_home ? t('validations.please_enter_zip') : ""
                    }
                    {...register("postal_code_home")}
                  />
                </div>
              </div>

              <Controller
                name="addresses_are_same"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Checkbox
                    checked={value}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.checked)}
                    label={t('myInfo.home_and_mailing_addresses')}
                  />
                )}
              />

              <div className='mailing-address' style={{ maxHeight: watchFields_addresses_are_same ? '0' : '1000px', marginTop: 20 }}>
                <h4 className='section-header'>{t('employee.address.mailing_address')}</h4>
                <div className='input-item-large'>
                  <label>{t('employee.address.country')}{
                    !watchFields_country_mailing && valuesFilled([
                      watchFields_address_mailing,
                      watchFields_address_details_mailing,
                      watchFields_city_mailing,
                      watchFields_region_mailing,
                      watchFields_postal_code_mailing,
                    ]) ?
                      <sup>*</sup> : null}</label>
                  <Controller
                    name="country_mailing"
                    control={control}
                    rules={{
                      required: !watchFields_country_mailing && valuesFilled([
                        watchFields_address_mailing,
                        watchFields_address_details_mailing,
                        watchFields_city_mailing,
                        watchFields_region_mailing,
                        watchFields_postal_code_mailing,
                      ]) && !watchFields_onboarding
                    }}
                    render={({ field: { onChange, value } }) => (
                      <SelectDropdown
                        onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
                          onChange(newValue)
                        }}
                        value={value}
                        loadRemoteData={() => getCountryList(300, 1)}
                        inputPlaceholder={t('createPerson.select_country')}
                        errorText={errors.country_mailing ? t('validations.country_is_required') : ''}
                      />
                    )}
                  />
                </div>

                <div>
                  <div className='input-item-large'>
                    <label>{t('employee.address.address_line_one')}</label>
                    <UniversalInput
                      placeholder={t('employee.address.street_address_example')}
                      errorText={
                        errors.address_mailing ? t('validations.please_enter_address_line_one') : ""
                      }
                      {...register("address_mailing")}
                    />
                  </div>
                </div>

                <div>
                  <div className='input-item-large'>
                    <label>{t('employee.address.address_line_two')}</label>
                    <UniversalInput
                      placeholder={t('employee.address.street_address_example_two')}
                      errorText={
                        errors.address_details_mailing ? t('validations.please_enter_address_line_two') : ""
                      }
                      {...register("address_details_mailing")}
                    />

                  </div>
                </div>

                <div className='state-province'>
                  <div className='input-item'>
                    <label>{t('employee.address.city')}</label>
                    <UniversalInput
                      errorText={
                        errors.city_mailing ? t('validations.please_enter_city') : ""
                      }
                      {...register("city_mailing")}
                    />
                  </div>

                  <div className='input-item'>
                    <label>{t('employee.address.state_province_region')}</label>
                    {watchFields_country_mailing?.iso === 'US' ? <Controller
                      name="state_mailing"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <SelectDropdown
                          onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
                            onChange(newValue)
                          }}
                          value={value}
                          loadRemoteData={() => getStateList(200, 1)}
                          inputPlaceholder={t('createPerson.select_state')}
                        />
                      )}
                    /> : <UniversalInput
                      errorText={
                        errors.region_mailing ? t('validations.please_enter_state_info') : ""
                      }
                      {...register("region_mailing")}
                    />
                    }
                  </div>

                  <div className='input-item'>
                    <label>{t('employee.address.postal_code')}</label>
                    <UniversalInput
                      errorText={
                        errors.postal_code_mailing ? t('validations.please_enter_zip') : ""
                      }
                      {...register("postal_code_mailing")}
                    />

                  </div>
                </div>
              </div>
            </div>
            <hr />
          </div>}

          {/****** Contact *******/}
          <div className='contact-section'>
            <HeadingComponent text={t('createPerson.contacts')} icon='mobile' />
            <h4 className='section-header'>{t('employee.contact.phone')}</h4>

            <div className='input-item-large work-phone'>
              <span>
                <label style={{ marginBottom: 6, display: 'inline-block' }}>{t('employee.contact.work_phone')}</label>
                <UniversalInput
                  className='work-phone-input form_control'
                  {...register("work_phone")}
                />
              </span>

              <span className='ext'>
                <label style={{ marginBottom: 6, display: 'inline-block' }}>{t('globaly.ext')}</label>
                <div >
                  <UniversalInput
                    {...register("work_phone_ext")}
                  />
                </div>
              </span>
            </div>

            {!watchFields_onboarding && <div className='input-item-large'>
              <label>{t('employee.contact.mobile_phone')}</label>
              <UniversalInput
                {...register("mobile_phone")}
              />
            </div>}

            {!watchFields_onboarding && <div className='input-item-large'>
              <label>{t('employee.contact.home_phone')}</label>
              <UniversalInput
                {...register("home_phone")}
              />
            </div>}

            <h4 className='section-header'>{t('employee.contact.email')}</h4>

            <div className='input-item-large'>
              <label>{t('createPerson.work')}</label>
              <UniversalInput
                inputProps={{ maxLength: 250 }}
                errorText={errors.work_email ? errors.work_email?.message : '' as any}
                {...register("work_email", {
                  validate: async (value: any) => {
                    if (value && watchFields_personal_email && value === watchFields_personal_email) {
                      return t('createPerson.personal_and_work_mails')
                    } else {
                      return true
                    }
                  },
                  pattern: FORM_PATTERNS.email,
                  maxLength: 250
                })}
              />
            </div>

            <div className='input-item-large'>
              <label>{t('createPerson.personal')}</label>
              <UniversalInput
                inputProps={{ maxLength: 250 }}
                errorText={
                  errors.personal_email ? errors?.personal_email?.message : "" as any
                }
                {...register("personal_email", {
                  validate: (value: any) => {
                    if (value && watchFields_work_email && value === watchFields_work_email) {
                      return t('createPerson.personal_and_work_mails')
                    } else {
                      return true
                    }
                  },
                  pattern: FORM_PATTERNS.email,
                  maxLength: 250
                })}
              />
            </div>
          </div>

          <hr />

          {/****** Job Info *******/}
          <div className='job-section'>
            <HeadingComponent text={t('employee.job.job_information')} icon='job' />

            <div className='input-item'>
              <Controller
                name="effective_date"
                control={control}
                rules={{
                  validate: value => value === null ? t('validations.valid_date') :
                    (value !== '' || !jobInfoRequired()) || t('validations.date_is_required')
                }}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    required={jobInfoRequired()}
                    selected={value}
                    onChange={onChange}
                    label={t('employee.job.effective_date')}
                    errorText={errors.effective_date ? errors.effective_date.message : ''}
                  />
                )}
              />
            </div>


            <div className='input-item-large'>
              <Controller
                name="job_date_different"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Checkbox
                    checked={value}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.checked)}
                    label={t('createPerson.original_hire_date_different')}
                  />
                )}
              />
            </div>


            {watchFields_job_date_different && <div>
              <div className='input-item' style={{ marginBottom: 0 }}>
                <Controller
                  name="hire_date"
                  control={control}
                  rules={{
                    validate: value => value === null ? t('validations.valid_date') :
                      (value !== '' || !jobInfoRequired()) || t('validations.original_hire_date_required')
                  }}
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      required={jobInfoRequired() && watchFields_job_date_different}
                      selected={value}
                      onChange={onChange}
                      label={t('employee.job.original_hire_date')}
                      errorText={errors.hire_date ? errors?.hire_date?.message : ''}
                    />
                  )}
                />
              </div>
              <span className='disclaimer'>{t('createPerson.the_date_company_the_first_time')}</span>
            </div>}
            <div style={{display: 'flex', gap: 2.5, width: 594}}>
              <div style={{flex: 1}}>
                <div className='input-item-large'>
                  <label>{t('employee.employment_status')}{
                    jobInfoRequired() ? <sup>*</sup> : null}</label>
                  <Controller
                    name="employment_status"
                    control={control}
                    rules={{
                      required: jobInfoRequired() && t('validations.employment_status_required')
                    }}
                    render={({ field: { value, onChange } }) => (
                      <>
                        <SelectDropdown
                          inputPlaceholder={t('createPerson.select_employment_status')}
                          onChange={(_, value) => onChange(value)}
                          onAddItem={() => setEmploymentStatusModal(true)}
                          value={value}
                          loadRemoteData={() => getEmploymentStatus(100, 1, false, exceptStatus)}
                          errorText={errors.employment_status?.message}
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
                <div className='input-item-large'>
                  <label>{t('employee.job.work_type')}{jobInfoRequired() ? <sup>*</sup> : null}</label>
                  <Controller
                    name="work_type"
                    control={control}
                    rules={{
                      required: jobInfoRequired() && t('validations.is_required', {attribute: t('employee.job.work_type')})
                    }}
                    render={({ field: { value, onChange } }) => (
                      <EnumDropdown
                        placeholder={`${t('leftMenuCard.updateJobInformation.select')} ${t('employee.job.work_type')}`}
                        onChange={onChange}
                        errorText={errors.work_type ? errors.work_type.message : '' as any}
                        value={value}
                        options={workTypes}
                      />
                    )}
                  />
                </div>
                <div className='input-item-large'>
                  <label>{t('employee.job.job_title')}{
                    jobInfoRequired() ? <sup>*</sup> : null}</label>
                  <Controller
                    name="job_title"
                    control={control}
                    rules={{
                      required: jobInfoRequired() && t('validations.job_title_required')
                    }}
                    render={({ field: { value, onChange } }) => (
                      <SelectWithAdd
                        name={'job_title'}
                        inputPlaceholder={t('createPerson.select_job_title')}
                        inputValue={value}
                        loadRemoteData={() => getJobTitles(100, 1)}
                        createRequest={createJobTitle}
                        errorText={errors.job_title ? errors?.job_title?.message : ''}
                        onChange={onChange}
                      />
                    )}
                  />
                </div>
                <div className='input-item-large'>
                  <label>{t('employee.job.manager_t')}</label>
                  <Controller
                    name="manager"
                    control={control}
                    render={({ field: { onChange, value } }) => (

                      <SelectDropdown
                        inputPlaceholder={t('createPerson.select_manager')}
                        onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
                          onChange(newValue)
                        }}
                        value={value}
                        loadRemoteData={() => getManagerList(100, 1)}
                        withPic
                      />
                    )}
                  />
                </div>
              </div>
              <div style={{flex: 1}}>
                <div className='input-item-large'>
                  <label>{t('employee.job.department')}</label>
                  <Controller
                    name="department"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <SelectWithAdd
                        name='department'
                        inputPlaceholder={t('createPerson.select_department')}
                        inputValue={value}
                        loadRemoteData={() => getDepartments(100, 1)}
                        createRequest={createDepartment}
                        onChange={onChange}
                      />
                    )}
                  />
                </div>
                <div className='input-item-large'>
                  <label>{t('employee.job.division')}</label>
                  <Controller
                    name="division"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <SelectWithAdd
                        name='division'
                        inputPlaceholder={t('createPerson.select_division')}
                        inputValue={value}
                        loadRemoteData={() => getDivisions(100, 1)}
                        createRequest={createDivision}
                        onChange={onChange}
                      />
                    )}
                  />
                </div>
                <div className='input-item-large'>
                  <label>{t('employee.address.location')}</label>
                  <Controller
                    name="location"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <SelectWithLocationAdd
                        name='location'
                        inputPlaceholder={t('createPerson.select_location')}
                        inputValue={value}
                        loadRemoteData={() => getLocations(100, 1)}
                        createRequest={createLocation}
                        onChange={onChange}
                      />
                    )}
                  />
                </div>

              </div>
            </div>




          </div>

          <hr />

          {/****** Compensation Info *******/}
          <div className='compensation-section'>
            <HeadingComponent text={t('employee.job.compensation')} icon='compensation' />

            <div className='input-item-large'>
              <Controller
                name="comp_date_different"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Checkbox
                    checked={value}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.checked)}
                    label={t('createPerson.different_compensation_effective_date')}
                  />
                )}
              />
            </div>

            {watchFields_comp_date_different && <div className='input-item'>
              <Controller
                name="effective_date_compensation"
                control={control}
                rules={{
                  validate: value => value === null ? t('validations.valid_date') :
                    (value !== '' || !compensationRequired()) || t('validations.compensation_effective_date_required')
                }}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    required={compensationRequired() && watchFields_comp_date_different}
                    selected={value}
                    onChange={onChange}
                    label={t('employee.job.compensation_effective_date')}
                    errorText={errors.effective_date_compensation ? errors.effective_date_compensation.message : ''}
                  />
                )}
              />
            </div>}

            <div className='input-item-large'>
              <label>{t('employee.job.payment_type')}{compensationRequired() && <sup>*</sup>}</label>
              <Controller
                name="payment_type"
                control={control}
                rules={{
                  required: compensationRequired()
                    ? t('validations.is_required', {
                        attribute: t('employee.job.payment_type'),
                      })
                    : ''
                }}
                render={({ field: { value, onChange } }) => (
                  <SelectDropdown
                    inputPlaceholder={t('createPerson.select_pay_type')}
                    value={value}
                    loadRemoteData={() => getPaymentTypes(25, 1)}
                    onChange={(_event: SyntheticEvent<Element, Event>, newValue: any) => {
                      onChange(newValue)
                    }}
                    errorText={errors.payment_type?.message}
                  />
                )}
              />
            </div>

            {showCompensationPayRate &&
              <>
                <div className='input-item pay-rate' style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <label>{t('employee.job.payment_rate')}{compensationRequired() ? <sup>*</sup> : null}</label>
                  <div style={{ display: 'flex', flexDirection: 'row', width: 594 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <Controller
                        name="pay_amount"
                        rules={{
                          required: compensationRequired() ? t('validations.pay_rate_required') : ''
                        }}
                        control={control}
                        render={({ field: { onChange, value } }) => {
                          return <InputWithSelect
                            errorText={errors.pay_amount ? errors.pay_amount.message : ''}
                            validateToDecimal
                            onChange={onChange}
                            value={value}
                            selectProps={{
                              loadRemoteData: () => getCurrencies(55, 1),
                            }}
                          />
                        }}
                      />
                    </div>

                    <span className='per'>{t('globaly.per')}{compensationRequired() ? <sup style={{ position: 'absolute' }}>*</sup> : null}</span>
                    <Controller
                      name="payment_period"
                      control={control}
                      rules={{
                        required: compensationRequired() && t('validations.pay_period_required')
                      }}
                      render={({ field: { onChange, value } }) => (
                        <SelectDropdown
                          inputPlaceholder={t('createPerson.select_period')}
                          fullWidth={false}
                          sx={{ width: 254 }}
                          size="small"
                          onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => onChange(newValue)}
                          errorText={errors.payment_period ? errors?.payment_period?.message : ''}
                          value={value}
                          loadRemoteData={() => getPaymentPeriod(25, 1, false, watchFields_payment_type?.class.id)}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className='input-item' style={{ padding: '6px 0 8px' }}>
                  <label>{t('employee.job.additional_payment_types')}</label>
                  <Controller
                    control={control}
                    name={'additional_payment_types'}
                    render={({ field: { value } }) => (
                      <CheckboxContainer>
                        {overtimePaymentTypes.map((paymentType) => (
                          <Checkbox
                            key={paymentType.id}
                            checked={value.includes(paymentType.id)}
                            onChange={(event) => {
                              const values = getValues('additional_payment_types');
                              if (event.target.checked) {
                                setValue('additional_payment_types', [...values, paymentType.id]);
                              } else {
                                const newValues = values.filter((item: number) => paymentType.id !== item);                        
                                setValue('additional_payment_types', [...newValues]);
                              }
                            }}
                            label={paymentType.name}
                          />
                        ))}
                      </CheckboxContainer>
                    )}
                  />
                </div>
              </>
            }

            <div className='input-item-large'>
              <label>{t('employee.job.payment_schedule')}</label>
              <Controller
                name="payment_schedule"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <SelectWithAdd
                    name={t('employee.job.payment_schedule')}
                    inputPlaceholder={t('createPerson.select_pay_schedule')}
                    inputValue={value}
                    loadRemoteData={() => getPaymentSchedule(25, 1)}
                    createRequest={createPaymentSchedule}
                    onChange={onChange}
                  />
                )}
              />
            </div>

            <div className='input-item-large'>
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
            <div className='input-item-large'>
              <label>{t('jobInfo.bank_account')}</label>
              <UniversalInput
                  inputProps={{ maxLength: 150 }}
                  {...register('bank_account')}
                  placeholder={t('jobInfo.bank_account')}
              />
            </div>

          </div>

          <div className='create-account' id='create-account'>
            <Button
              disabled={loadingEmployeeCreation}
              onClick={() => history.goBack()}
              size='large'
              sx={{ marginRight: 1, width: 150 }}
            >
              {t('globaly.cancel')}
            </Button>
            <Tooltip title={getSubmitState() ? renderTooltip() : ''} placement="top" arrow>
              <div>
                <LoadingButton
                  variant='contained'
                  size='large'
                  type='submit'
                  disabled={getSubmitState()}
                  onClick={() => clearErrors()}
                  loading={loadingEmployeeCreation}
                  sx={{ width: 180 }}
                >
                  {formType === 'onboarding_update' ? t('globaly.update') : t('createPerson.create_employee')}
                </LoadingButton>
              </div>
            </Tooltip>
          </div>
        </div>
      </form>
    </Wrapper>
  );
};

export default CreatePersonForm;

const ToastContentContainer = styled.div`
    & > b {
      font-family: 'Aspira Demi', 'FiraGO Regular';
    }
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;