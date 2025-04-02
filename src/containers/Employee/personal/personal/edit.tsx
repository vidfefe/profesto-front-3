import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useForm, Controller } from 'react-hook-form';
import { useToasts } from "react-toast-notifications";
import { PatternFormat } from 'react-number-format';
import { calculateAge } from 'utils/common';
import UniversalInput from "components/Input/UniversalInput";
import EmpEditHeader from "../../editHeader";
import DialogModal from "components/Modal/Dialog";
import EnumDropdown from "components/Dropdowns/EnumDropdown";
import {
    createNationality,
    createLanguage,
    getCountryList,
    getLanguages,
    getNationalities,
    getEnum
} from "services";
import SelectDropdown from "components/Dropdowns/SelectDropdown";
import SelectWithAdd from "components/Dropdowns/SelectWithAdd";
import DatePicker from "components/DatePickers/DatePicker";
import { utcToZonedTime } from 'date-fns-tz';
import { FORM_PATTERNS } from "../../../../constants";
import { useTranslation } from "react-i18next";
import { region } from "lib/Regionalize";
import PersonalNumber from "components/PersonalNumber";
import { find } from "lodash";

const PersonalInformationEdit = (props: any) => {
    const { addToast } = useToasts();
    const { register, handleSubmit, watch, setValue, setError, setFocus, clearErrors, control, formState: { errors } } = useForm({});
    const watchBirthdayValue = watch("birth_date");
    const { user, jobData } = props;
    const [genderData, setGenders] = useState([]);
    const [maritalStatusData, setMaritalStatus] = useState([]);
    const { t } = useTranslation();

    useEffect(() => {
        getEnum('Enum::Gender').then(res => setGenders(res.data));
        getEnum('Enum::MaritalStatus').then(res => setMaritalStatus(res.data));
    }, [])

    const watchPersonalNumber = watch("personal_number");
    const wacthRemoveMask = watch('remove_mask');


    useEffect(() => {
        if (user) {
            setValue('first_name', user.first_name);
            setValue('last_name', user.last_name);
            setValue('middle_name', user.middle_name);
            setValue('preferred_name', user.preferred_name);
            setValue('ssn', user.ssn?.replaceAll('-', ''));
            setValue('personal_number', user?.personal_number);
            setValue('remove_mask', user?.remove_mask)
            setValue('place_of_birth', user.place_of_birth)
            setValue('birth_date', user.birth_date ? utcToZonedTime(new Date(user.birth_date), 'UTC') : '')
            setValue('gender', user?.gender?.id)
            setValue('nationality', user?.nationality)
            setValue('citizenship', user.citizenship)
            setValue('preferred_language', user?.preferred_language)
            setValue('marital_status', user?.marital_status?.id ?? '')
            setValue('employee_languages', user?.employee_languages)
        }
    }, [user, props.isOpen]);

    const onSubmit = (data: any) => {
        props.onSubmit(data);
    };

    useEffect(() => {
        if (props.editErrors) {
            props.editErrors.forEach((item: any) => setError(item.field, { type: 'string', message: item.message }));
            const findPersonalNumber = find(props.editErrors, (item: any) => { return item.field === 'personal_number'}); 
            
            if (findPersonalNumber) {
                addToast(<ToastContentContainer dangerouslySetInnerHTML={{ __html: findPersonalNumber.message }} />, {
                    appearance: 'error',
                    autoDismiss: true,
                    placement: 'top-center'
                });
            }
            
            setFocus(props.editErrors?.[0]?.field as any)
        }
    }, [props.editErrors])


    useEffect(() => {
        for (const prop of Object.getOwnPropertyNames(errors)) {
            delete errors[prop];
        }
        if (user && user.employee_languages) {
            setValue('employee_languages', user.employee_languages)
        }

    }, [props.isOpen]);

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
        if (wacthRemoveMask) {
          clearErrors();
        }
      }, [wacthRemoveMask])

    return (
        <DialogModal
            open={props.isOpen}
            title={t('myInfo.edit_personal_information')}
            onClose={() => { props.onModalClose() }}
            actionButton={handleSubmit(onSubmit, onError)}
            withButtons
            cancelButtonText={t('globaly.cancel')}
            actionButtonText={t('globaly.save')}
            actionLoading={props.loadingRequest}
            nominalHeader={
                <EmpEditHeader
                    employeeName={`${user?.first_name} ${user?.last_name}` ?? ''}
                    avatarUuid={user?.uuid ?? null}
                    employeeId={user?.id ?? null}
                    jobData={jobData}
                />
            }
            fullWidth
        >
            <Wrapper>
                <form>
                    <div className='body'>

                        <div className='top'>
                            <div className='input-item'>
                                <label>{t('employee.first_name')}<sup>*</sup></label>
                                <UniversalInput
                                    errorText={
                                        errors.first_name ? t('validations.first_name_required') : ""
                                    }
                                    {...register('first_name', { required: true })}
                                />
                            </div>

                            {region(['eng']) ? <div className='input-item'>
                                <label>{t('employee.middle_name')}</label>
                                <UniversalInput
                                    {...register("middle_name")}
                                />
                            </div> : null}

                            <div className='input-item'>
                                <label>{t('employee.last_name')}<sup>*</sup></label>
                                <UniversalInput
                                    errorText={
                                        errors.last_name ? t('validations.last_name_required') : ""
                                    }
                                    {...register("last_name", { required: true })}
                                />
                            </div>

                            <div className='input-item'>
                                <label>{t('employee.preferred_name')}</label>
                                <UniversalInput
                                    {...register("preferred_name")}
                                />
                            </div>

                            {region(['geo']) && 
                                <PersonalNumber
                                    register={{ ...register('personal_number', { required: t('validations.personal_number_required'), validate: value => value.length > 0 ? true : false }) }}
                                    control={control} 
                                    errors={errors}
                                    wacthRemoveMask={wacthRemoveMask}
                                    watchPersonalNumber={watchPersonalNumber}
                                    onClear={(removeMask: boolean) => onClearPersonalNumber(removeMask)}
                                />
                            }
                        </div>

                        <div className='input-item'>
                            <label>{t('employee.birth_date')}</label>
                            <div className='birth-date'>
                                <div style={{ width: 200 }}>
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

                                {watchBirthdayValue && <span className='age'>({t('employee.age')}: {calculateAge(watchBirthdayValue)})</span>}
                            </div>
                        </div>

                        <div className='input-item'>
                            <label>{t('employee.place_of_birth')}</label>
                            <UniversalInput
                                {...register('place_of_birth')}
                            />
                        </div>

                        <div className='input-item'>
                            <label>{t('employee.gender')}</label>
                            <Controller
                                name="gender"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <EnumDropdown
                                        placeholder={t('createPerson.select_gender')}
                                        onChange={onChange}
                                        errorText={errors.gender ? t('validations.please_choose_gender') : ''}
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
                                            type='tel'
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

                        <div className='input-item'>
                            <label>{t('employee.address.nationality_name')}</label>
                            <Controller
                                name="nationality"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <SelectWithAdd
                                        inputPlaceholder={t('createPerson.select_nationality')}
                                        name={t('employee.address.nationality_name')}
                                        inputValue={value}
                                        loadRemoteData={() => getNationalities(100, 1)}
                                        createRequest={createNationality}
                                        onChange={onChange}
                                    />
                                )}
                            />
                        </div>

                        <div className='input-item'>
                            <label>{t('employee.address.citizenship_name')}</label>
                            <Controller
                                name="citizenship"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <SelectDropdown
                                        inputPlaceholder={t('createPerson.select_citizenship')}
                                        onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => onChange(newValue)}
                                        value={value}
                                        loadRemoteData={() => getCountryList(300, 1)}
                                    />
                                )}
                            />
                        </div>

                        <div className='input-item'>
                            <label>{t('employee.preferred_language_name')}</label>
                            <Controller
                                name="preferred_language"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <SelectWithAdd
                                        inputPlaceholder={t('createPerson.select_preferred_language')}
                                        name={t('employee.preferred_language_name')}
                                        inputValue={value}
                                        loadRemoteData={() => getLanguages(200, 1)}
                                        createRequest={createLanguage}
                                        onChange={onChange}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </form>
            </Wrapper>
        </DialogModal>
    );
};

export default PersonalInformationEdit;


const ToastContentContainer = styled.div`
    & > b {
        font-family: 'Aspira Demi', 'FiraGO Regular';
    }
`;

const Wrapper = styled.div`
  .body{
    .form_control {
      width: 100%;
      border-radius: 4px;
      border: 1px solid #D6D6D6;
      padding: 11px 13px;
      
      &:focus, &:hover {
        border-color: #99CC33 !important;
      }
  }

  .error-input {
    border-color: var(--red);
  };

  .birth-date{
    display: flex;

    span.age{
      margin-top: 12px;
      margin-left: 10px;
    }
  }

  .input-item{
    max-width: 416px;
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
  };
`;
