import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useToasts } from "react-toast-notifications";
import { Controller, useForm } from 'react-hook-form';
import UniversalInput from "components/Input/UniversalInput";
import EmpEditHeader from "../../editHeader";
import SelectDropdown from "components/Dropdowns/SelectDropdown";
import { getCountryList, getStateList } from "services";
import DialogModal from "components/Modal/Dialog";
import Checkbox from "components/Checkbox";
import { useTranslation } from "react-i18next";
import { region } from "lib/Regionalize";
const checkForValue = (items: any) => {
  let leftOvers = items.filter((item: any) => item != false && item !== undefined && item !== '' && item !== null);

  if (leftOvers.length) {
    return true;
  } else {
    return false;
  }
};

const AddressInformationEdit = (props: any) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();

  const { register, handleSubmit, watch, setValue, setError, control, formState: { errors } } = useForm();
  const watchValues = watch();
  const [addressesAreSame, setAddressesAreSame] = useState<boolean>(false);
  const { user, jobData, AddressInfoData } = props;

  let homeAddress = AddressInfoData?.find((item: any) => item.address_type.id === 'home_address')
  let mailingAddress = AddressInfoData?.find((item: any) => item.address_type.id === 'mailing_address')

  useEffect(() => {
    if (AddressInfoData) {
      if (homeAddress) {
        setValue('country_home', homeAddress.country);
        setValue('address_home', homeAddress.address);
        setValue('address_details_home', homeAddress.address_details);
        setValue('city_home', homeAddress.city);
        setValue('region_home', homeAddress.region);
        setValue('state_home', homeAddress.state);
        setValue('postal_code_home', homeAddress.postal_code);
      }

      if (mailingAddress) {
        setValue('country_mailing', mailingAddress.country);
        setValue('address_mailing', mailingAddress.address);
        setValue('address_details_mailing', mailingAddress.address_details);
        setValue('city_mailing', mailingAddress.city);
        setValue('region_mailing', mailingAddress.region);
        setValue('postal_code_mailing', mailingAddress.postal_code);
        setValue('state_mailing', mailingAddress.state);
      }
    }

  }, [AddressInfoData, props.isOpen])

  useEffect(() => {
    if (props.editErrors) {
      props.editErrors.map((item: any) => setError(item.field, { type: 'string', message: item.message }))
    }

  }, [props.editErrors])


  useEffect(() => {
    setAddressesAreSame(areAddressesSame)
    for (const prop of Object.getOwnPropertyNames(errors)) {
      delete errors[prop];
    }
  }, [props.isOpen])

  const setSameAddresses = () => {
    setAddressesAreSame(!addressesAreSame)
    if (addressesAreSame) {
      setValue('country_mailing', null);
      setValue('address_mailing', null);
      setValue('address_details_mailing', null);
      setValue('city_mailing', null);
      setValue('region_mailing', null);
      setValue('postal_code_mailing', null);
      setValue('state_mailing', null);
    }
  }

  const onSubmit = (data: any) => {

    if (addressesAreSame) {
      data.state_mailing = data.state_home;
      data.country_mailing = data.country_home;
      data.address_mailing = data.address_home;
      data.address_details_mailing = data.address_details_home;
      data.city_mailing = data.city_home;
      data.region_mailing = data.region_home;
      data.postal_code_mailing = data.postal_code_home;
    }

    props.onSubmit(data);
  };

  const areAddressesSame = () => {
    return homeAddress?.state?.id === mailingAddress?.state?.id &&
      homeAddress?.country?.id === mailingAddress?.country?.id &&
      homeAddress?.address === mailingAddress?.address &&
      homeAddress?.address_details === mailingAddress?.address_details &&
      homeAddress?.city === mailingAddress?.city &&
      homeAddress?.region === mailingAddress?.region &&
      homeAddress?.postal_code === mailingAddress?.postal_code
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
      title={t('myInfo.edit_address_information')}
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
          <div className='body'>
            <h4 className='section-header'>{t('employee.address.home_address')}</h4>
            <div>
              <div className='input-item'>
                <label>{t('employee.address.country')}{!watchValues.country_home && checkForValue([
                  watchValues.address_home,
                  watchValues.address_details_home,
                  watchValues.city_home,
                  watchValues.region_home,
                  watchValues.postal_code_home,
                ]) ? <sup>*</sup> : null}</label>
                <Controller
                  name="country_home"
                  control={control}
                  rules={{
                    required: !watchValues.country_home && checkForValue([
                      watchValues.address_home,
                      watchValues.address_details_home,
                      watchValues.city_home,
                      watchValues.region_home,
                      watchValues.postal_code_home,
                    ])
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
              <div className='input-item'>
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
              <div className='input-item'>
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
              <div className='input-item' style={{ width: 193 }}>
                <label>{t('employee.address.city')}</label>
                <UniversalInput
                  errorText={
                    errors.city_home ? t('validations.please_enter_city') : ""
                  }
                  {...register("city_home")}
                />
              </div>

              <div className='input-item' style={{ width: 193 }}>
                <label>{t('employee.address.state_province_region')}</label>
                {watchValues.country_home?.iso === 'US' ? <Controller
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

              <div className='input-item' style={{ width: 193 }}>
                <label>{t('employee.address.postal_code')}</label>
                <UniversalInput
                  errorText={
                    errors.postal_code_home ? t('validations.please_enter_zip') : ""
                  }
                  {...register("postal_code_home")}
                />

              </div>
            </div>

            <Checkbox
              checked={addressesAreSame}
              onChange={() => setSameAddresses()}
              label={t('myInfo.home_and_mailing_addresses')}
            />

            {!addressesAreSame &&
              <div className='mailing-address'>
                <h4 className='section-header'>{t('employee.address.mailing_address')}</h4>
                <div>
                  <div className='input-item'>
                    <label>{t('employee.address.country')}{!watchValues.country_mailing && checkForValue([
                      watchValues.address_mailing,
                      watchValues.address_details_mailing,
                      watchValues.city_mailing,
                      watchValues.region_mailing,
                      watchValues.postal_code_mailing,
                    ]) ? <sup>*</sup> : null}</label>
                    <Controller
                      name="country_mailing"
                      control={control}
                      rules={{
                        required: !watchValues.country_mailing && checkForValue([
                          watchValues.address_mailing,
                          watchValues.address_details_mailing,
                          watchValues.city_mailing,
                          watchValues.region_mailing,
                          watchValues.postal_code_mailing,
                        ])
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

                </div>
                <div>
                  <div className='input-item'>
                    <label>{t('employee.address.address_line_one')}</label>
                    <UniversalInput
                      placeholder={t('employee.address.street_address_example')}
                      errorText={
                        errors.address ? t('validations.please_enter_address_line_one') : ""
                      }
                      {...register("address_mailing")}
                    />

                  </div>
                </div>
                <div>
                  <div className='input-item'>
                    <label>{t('employee.address.address_line_two')}</label>
                    <UniversalInput
                      placeholder={t('employee.address.street_address_example_two')}
                      errorText={
                        errors.address_details ? t('validations.please_enter_address_line_two') : ""
                      }
                      {...register("address_details_mailing")}
                    />

                  </div>
                </div>

                <div className='state-province'>
                  <div className='input-item' style={{ width: 193 }}>
                    <label>{t('employee.address.city')}</label>
                    <UniversalInput
                      errorText={
                        errors.city ?  t('validations.please_enter_city') : ""
                      }
                      {...register("city_mailing")}
                    />

                  </div>

                  <div className='input-item' style={{ width: 193 }}>
                    <label>{t('employee.address.state_province_region')}</label>
                    {watchValues.country_mailing?.iso === 'US' ? <Controller
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

                  <div className='input-item' style={{ width: 193 }}>
                    <label>{t('employee.address.postal_code')}</label>
                    <UniversalInput
                      errorText={
                        errors.postal_code ? t('validations.please_enter_postal_code') : ""
                      }
                      {...register("postal_code_mailing")}
                    />

                  </div>
                </div>
              </div>
            }
          </div>
        </form>
      </Wrapper>
    </DialogModal >
  );
};

export default AddressInformationEdit;

const ToastContentContainer = styled.div`
    & > b {
      font-family: 'Aspira Demi', 'FiraGO Regular';
    }
`;

const Wrapper = styled.div`
  .mailing-address{
    transition: max-height 0.5s;
    padding-bottom: 30px;
    margin-top: 15px;
  }

  .body{
    h4.section-header{
      color: #5B5BB9 !important;
    }

    .input-item{
      max-width: 400px;
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

    .state-province{
      display: flex;
      
      .input-item{
        margin-right: 14px;
      }
    }
    
    h4.section-header{
      display: inline-block;
      margin-bottom: 2px;
      margin-top: 6px;
      color: #00101A;
    }

  }
`;
