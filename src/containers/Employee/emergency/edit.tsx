import React, { useEffect } from "react";
import styled from "styled-components";
import { Controller, useForm } from 'react-hook-form';
import { useToasts } from "react-toast-notifications";
import DialogModal from "components/Modal/Dialog";
import UniversalInput from "components/Input/UniversalInput";
import EmpEditHeader from "../editHeader";
import Checkbox from "components/Checkbox";
import SelectWithAdd from "components/Dropdowns/SelectWithAdd";
import {
  createRelationship,
  getCountryList,
  getRelationshipList,
  getStateList
} from "services";
import { useTranslation } from "react-i18next";
import SelectDropdown from "components/Dropdowns/SelectDropdown";
import { isEmpty } from "lodash";

const EmergencyInformationEdit = (props: any) => {
  const { addToast } = useToasts();
  const { t } = useTranslation();
  const { register, handleSubmit, watch, setValue, setError, control, clearErrors, formState: { errors } } = useForm({
    shouldFocusError: false,
    defaultValues: {
      name: null,
      contact_relationship: null,
      primary: false,
      work_phone: null,
      work_phone_ext: null,
      mobile_phone: null,
      home_phone: null,
      email: null,
      country: null,
      city: null,
      state: null,
      region: null,
      address: null,
      address_details: null,
      postal_code: null
    } as any
  });
  const watchValues = watch();
  const { user, jobData, chosenItem, editMode } = props;

  useEffect(() => {
    if (editMode && chosenItem) {
      setValue('name', chosenItem.name);
      setValue('contact_relationship', chosenItem.contact_relationship)
      setValue('primary', chosenItem.primary);
      setValue('work_phone', chosenItem.work_phone)
      setValue('work_phone_ext', chosenItem.work_phone_ext)
      setValue('mobile_phone', chosenItem.mobile_phone)
      setValue('home_phone', chosenItem.home_phone)
      setValue('email', chosenItem.email)
      setValue('country', chosenItem.country)
      setValue('city', chosenItem.city)
      setValue('state', chosenItem.state)
      setValue('region', chosenItem.region)
      setValue('address', chosenItem.address)
      setValue('address_details', chosenItem.address_details)
      setValue('postal_code', chosenItem.postal_code)
    }
  }, [chosenItem, editMode, props.isOpen])

  const onSubmit = (data: any) => {
    props.onSubmit(data);
  };

  useEffect(() => {
    clearErrors()
  }, [props.isOpen]);

  useEffect(() => {
    if (props.editErrors) {
      props.editErrors.map((item: any) => setError(item.field, { type: 'string', message: item.message }))
    }
  }, [props.editErrors]);

  const isPhoneFieldRequired = (field: string) => {
    if (!watchValues.work_phone && !watchValues.mobile_phone && !watchValues.home_phone) {
      return true;
    };
    if (field === 'work_phone') {
      if (watchValues.mobile_phone || watchValues.home_phone) return false;
      return true;
    }
    if (field === 'mobile_phone') {
      if (watchValues.work_phone || watchValues.home_phone) return false;
      return true;
    }
    if (field === 'home_phone') {
      if (watchValues.mobile_phone || watchValues.work_phone) return false;
      return true;
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
      title={`${editMode ? t('globaly.edit') : t('globaly.lowercase_add')} ${t('emergency.emergency_contact')}`}
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
      maxWidth={'md'}
    >
      <Wrapper>
        <form>
          <div className="name-block">
            <label>{t('emergency.name')}<sup>*</sup></label>
            <div>
              <div style={{ width: 414, marginRight: 10 }}>
                <UniversalInput
                  errorText={errors.name ? t('validations.name_is_required') : ""}
                  {...register('name', { required: true })}
                />
              </div>
              <div style={{ marginTop: 8 }}>
                <Controller
                  name="primary"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Checkbox
                      checked={value}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.checked)}
                      label={t('emergency.primary_contact')}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className='input-item'>
            <label>{t('emergency.relationship')}<sup>*</sup></label>
            <Controller
              name="contact_relationship"
              control={control}
              rules={{ required: t('validations.relationship_is_required') }}
              render={({ field: { value, onChange } }) => (
                <SelectWithAdd
                  inputPlaceholder={t('emergency.select_relationship')}
                  name={t('emergency.relationship')}
                  inputValue={value}
                  loadRemoteData={() => getRelationshipList(100, 1)}
                  createRequest={createRelationship}
                  errorText={errors.contact_relationship?.message ?? ''}
                  onChange={onChange}
                />
              )}
            />
          </div>

          <SubTopic>{t('employee.contact.phone')}</SubTopic>
          <div className='input-item work-phone'>
            <span>
              <label>{t('employee.contact.work_phone')}
                {isPhoneFieldRequired('work_phone') ?
                  <sup style={{ color: '#C54343' }}>*</sup> : null}
              </label>
              <UniversalInput
                {...register('work_phone', {
                  required: isPhoneFieldRequired('work_phone') && t('validations.one_phone_is_required')
                })}
                errorText={errors.work_phone?.message ?? '' as any}
              />
            </span>
            <span>
              <label>{t('globaly.ext')}</label>
              <UniversalInput
                {...register('work_phone_ext')}
                errorText={errors.work_phone_ext?.message ?? '' as any}
              />
            </span>
          </div>

          <div className='input-item'>
            <label>{t('employee.contact.mobile_phone')}{isPhoneFieldRequired('mobile_phone') ? <sup>*</sup> : null}</label>
            <UniversalInput
              {...register("mobile_phone", {
                required: isPhoneFieldRequired('mobile_phone') && t('validations.one_phone_is_required')
              })}
              errorText={errors.mobile_phone?.message ?? '' as any}
            />
          </div>

          <div className='input-item'>
            <label>{t('employee.contact.home_phone')}{isPhoneFieldRequired('home_phone') ? <sup>*</sup> : null}</label>
            <UniversalInput
              {...register("home_phone", {
                required: isPhoneFieldRequired('home_phone') && t('validations.one_phone_is_required')
              })}
              errorText={errors.home_phone?.message ?? '' as any}
            />
          </div>

          <div className='input-item'>
            <label>{t('employee.contact.email')}</label>
            <UniversalInput
              {...register('email')}
              errorText={errors.email?.message ?? '' as any}
            />
          </div>

          <SubTopic>{t('employee.address.address')}</SubTopic>

          <div className='input-item'>
            <label>{t('employee.address.country')}{isEmpty(watchValues.country) && (
              !isEmpty(watchValues.address) ||
              !isEmpty(watchValues.address_details) ||
              !isEmpty(watchValues.city) ||
              !isEmpty(watchValues.region) ||
              !isEmpty(watchValues.state) ||
              !isEmpty(watchValues.postal_code)) ? <sup>*</sup> : null}</label>
            <Controller
              name="country"
              control={control}
              rules={{
                required: isEmpty(watchValues.country) && (
                  !isEmpty(watchValues.address) ||
                  !isEmpty(watchValues.address_details) ||
                  !isEmpty(watchValues.city) ||
                  !isEmpty(watchValues.region) ||
                  !isEmpty(watchValues.state) ||
                  !isEmpty(watchValues.postal_code)) && t('validations.country_is_required')
              }}
              render={({ field: { onChange, value } }) => (
                <SelectDropdown
                  onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
                    onChange(newValue)
                  }}
                  value={value}
                  loadRemoteData={() => getCountryList(300, 1)}
                  inputPlaceholder={t('createPerson.select_country')}
                  errorText={errors.country?.message ?? ''}
                />
              )}
            />
          </div>

          <div>
            <div className='input-item'>
              <label>{t('employee.address.address_line_one')}</label>
              <UniversalInput
                placeholder={t('employee.address.street_address_example')}
                {...register("address")}
                errorText={errors.address?.message ?? '' as any}
              />
            </div>
          </div>

          <div>
            <div className='input-item'>
              <label>{t('employee.address.address_line_two')}</label>
              <UniversalInput
                placeholder={t('employee.address.street_address_example_two')}
                {...register("address_details")}
                errorText={errors.address_details?.message ?? '' as any}
              />
            </div>
          </div>

          <div className='state-province'>
            <div className='input-item' style={{ width: 201 }}>
              <label>{t('employee.address.city')}</label>
              <UniversalInput
                {...register("city")}
                errorText={errors.city?.message ?? '' as any}
              />
            </div>

            <div className='input-item' style={{ width: 201 }}>
              <label>{t('employee.address.state_province_region')}</label>
              {watchValues.country?.iso === 'US' ? <Controller
                name="state"
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
                {...register("region")}
              />
              }
            </div>

            <div className='input-item' style={{ width: 201, marginRight: 0 }}>
              <label>{t('employee.address.postal_code')}</label>
              <UniversalInput
                {...register("postal_code")}
                errorText={errors.postal_code?.message ?? '' as any}
              />
            </div>
          </div>
        </form>
      </Wrapper>
    </DialogModal>
  );
};

export default EmergencyInformationEdit;

const ToastContentContainer = styled.div`
    & > b {
      font-family: 'Aspira Demi', 'FiraGO Regular';
    }
`;

const Wrapper = styled.div`
    .input-item {
    margin-bottom: 15px;
    width: 416px;
    & > label {
    margin-bottom: 6px;
    margin-top: 6px;
    display: inline-block;
    & > sup {
      color: #C54343;
    }
  }
  }
  .work-phone {
    display: flex;
    width: auto;
    span:first-child {
      width: 414px;
      margin-right: 10px;
    }
    & label {
      margin-bottom: 6px;
      margin-top: 6px;
      display: inline-block;
    }
  }

  .name-block {
    margin-bottom: 15px;
    & > label {
    margin-bottom: 6px;
    display: inline-block;
    & > sup {
      color: #C54343;
      }
    }
    & > div {
      display: flex;
    }
  }

  .state-province {
    display: flex;
    
    .input-item{
      margin-right: 14px;
    }
  }
`;

const SubTopic = styled.div`
  font-weight: bold;
  padding-bottom: 8px;
  padding-top: 10px;
`;
