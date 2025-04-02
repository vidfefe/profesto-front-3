import { useState, useEffect, PropsWithChildren } from "react";
import styled from "styled-components";
import { Controller, useFormContext } from "react-hook-form";
import { useSelector } from "react-redux";
import { currentUserSelector } from "redux/selectors";
import useQuery from "hooks/useQueryCustom";
import { StepTitle, StepDesc } from "./Welcome";
import EmployeeImage from "components/Employee/Image";
import AvatarUpload from "components/AvatarUpload";
import { employeeInitials, calculateAge } from "utils/common";
import { PatternFormat } from "react-number-format";
import isToday from 'date-fns/isToday';
import format from "date-fns/format";
import utcToZonedTime from "date-fns-tz/utcToZonedTime";
import CircularProgress from "@mui/material/CircularProgress";
import UniversalInput from "components/Input/UniversalInput";
import DatePicker from "components/DatePickers/DatePicker";
import EnumDropdown from "components/Dropdowns/EnumDropdown";
import SelectDropdown from "components/Dropdowns/SelectDropdown";
import Checkbox from "components/Checkbox";

import { FORM_PATTERNS } from "../../../constants";
import { getStateList, getCountryList, getEnum } from 'services';

import { ReactComponent as PersonIcon } from 'assets/svg/info_circle/person-circle.svg';
import { ReactComponent as HomeIcon } from 'assets/svg/info_circle/home-circle.svg';
import { ReactComponent as MobileIcon } from 'assets/svg/info_circle/mobile-circle.svg';
import { ReactComponent as PenIcon } from 'assets/svg/pen-circle.svg';
import { useTranslation } from "react-i18next";
import { region } from "lib/Regionalize";
import PersonalNumber from "components/PersonalNumber";
import { dateFormat } from "lib/DateFormat";

interface IFieldItem {
    required?: boolean,
    label: string,
    large?: boolean,
    small?: boolean
};

export const FieldItem = ({ children, required, label, large }: PropsWithChildren<IFieldItem>) => {
    return (
        <StyledFieldItem style={{ width: large ? 594 : 292 }}>
            <label>{label}{required && <sup>*</sup>}</label>
            {children}
        </StyledFieldItem>
    )
};

interface IPersonalDetails {
    fillI9: boolean,
    updatedAt: Date,
    onAvatarSelect: ({
        avatarFile,
        employeeId,
        completedCrop,
        previewImageBase64
    }: {
        avatarFile?: File,
        employeeId?: number,
        completedCrop?: any,
        previewImageBase64?: string
    }) => void,
    avatarPhoto: any,
    avatarPreview: File | any
};

export default function PersonalDetails({ fillI9, updatedAt, onAvatarSelect, avatarPhoto, avatarPreview }: IPersonalDetails) {
    const { t } = useTranslation();
    const currentUser = useSelector(currentUserSelector);
    const employeeName = `${currentUser?.employee?.first_name} ${currentUser?.employee?.last_name}`;

    const [isAvatarModalOpen, setAvatarModalOpen] = useState<boolean>(false);
    const [genderData, setGenders] = useState([]);
    const [maritalStatusData, setMaritalStatusData] = useState([]);
    const [countriesList, setCountriesList] = useState([]);

    useEffect(() => {
        getEnum('Enum::Gender').then(res => setGenders(res.data));
        getEnum('Enum::MaritalStatus').then(res => setMaritalStatusData(res.data));
        getCountryList(300, 1).then(res => setCountriesList(res.data.list));
    }, []);

    const { data, isLoading } = useQuery<any>(["employee_info"], {
        endpoint: `employee/${currentUser?.employee.id}`,
        options: { method: "get" },
    }, { refetchOnWindowFocus: false });

    const { data: employeeAddressData, isLoading: addressDataLoading } = useQuery<any>(["employee_address"], {
        endpoint: `employee_address/${currentUser?.employee.id}`,
        options: { method: "get" },
    }, { refetchOnWindowFocus: false });

    const { data: employeeContactData, isLoading: contactDataLoading } = useQuery<any>(["employee_contact_info"], {
        endpoint: `employee_contact_info/${currentUser?.employee.id}`,
        options: { method: "get" },
    }, { refetchOnWindowFocus: false });

    const { control, register, unregister, setValue, watch, clearErrors, formState: { errors } } = useFormContext();

    const addressesAreSame = (homeAddress: any, mailingAddress: any) => {
        return homeAddress?.country?.id === mailingAddress?.country?.id &&
            homeAddress?.state?.id === mailingAddress?.state?.id &&
            homeAddress?.address === mailingAddress?.address &&
            homeAddress?.address_details === mailingAddress?.address_details &&
            homeAddress?.city === mailingAddress?.city &&
            homeAddress?.region === mailingAddress?.region &&
            homeAddress?.postal_code === mailingAddress?.postal_code
    };

    useEffect(() => {
        if (data) {
            setValue('first_name', data.first_name);
            setValue('last_name', data.last_name);
            setValue('personal_number', data.personal_number);
            setValue('remove_mask', data.remove_mask);
            setValue('other_last_name', data.other_last_name);
            setValue('middle_name', data.middle_name);
            setValue('preferred_name', data.preferred_name);
            setValue('birth_date', data.birth_date ? utcToZonedTime(new Date(data.birth_date), 'UTC') : '')
            setValue('gender', data.gender?.id);
            setValue('marital_status', data.marital_status?.id)
            setValue('ssn', data.ssn?.replaceAll('-', ''));
        }
        if (employeeContactData) {
            setValue('mobile_phone', employeeContactData.mobile_phone);
            setValue('home_phone', employeeContactData.home_phone);
            setValue('personal_email', employeeContactData.personal_email);
            setValue('linkedin', employeeContactData.linkedin);
            setValue('facebook', employeeContactData.facebook);
            setValue('twitter', employeeContactData.twitter);
        }
        if (employeeAddressData) {
            const homeAddress = employeeAddressData.find((e: any) => e.address_type?.id === 'home_address');
            const mailingAddress = employeeAddressData.find((e: any) => e.address_type?.id === 'mailing_address');
            const sameAddress = addressesAreSame(homeAddress, mailingAddress);
            if (sameAddress) {
                setValue('addresses_are_same', true);
                unregister(['country_mailing',
                    'address_mailing', 'address_details_mailing',
                    "city_mailing", 'postal_code_mailing', 'state_mailing'], {
                    keepValue: false
                });
            } else setValue('addresses_are_same', false);;
            if (homeAddress) {
                setValue('country_home', homeAddress.country);
                setValue('address_home', homeAddress.address);
                setValue('address_details_home', homeAddress.address_details);
                setValue('city_home', homeAddress.city);
                setValue('state_home', homeAddress.state);
                setValue('region_home', homeAddress.region);
                setValue('postal_code_home', homeAddress.postal_code);
            };
            if (mailingAddress && !sameAddress) {
                setValue('country_mailing', mailingAddress.country);
                setValue('address_mailing', mailingAddress.address);
                setValue('address_details_mailing', mailingAddress.address_details);
                setValue('city_mailing', mailingAddress.city);
                setValue('state_mailing', mailingAddress.state);
                setValue('region_mailing', mailingAddress.region);
                setValue('postal_code_mailing', mailingAddress.postal_code);
            };
        }
    }, [data, employeeAddressData, employeeContactData, setValue, unregister]);

    useEffect(() => {
        if (countriesList && employeeAddressData) {
            const homeAddressCountry = employeeAddressData.find((e: any) => e.address_type?.id === 'home_address')?.country;
            const mailingAddressCountry = employeeAddressData.find((e: any) => e.address_type?.id === 'mailing_address')?.country;
            if (!homeAddressCountry)
                setTimeout(() => {
                    setValue('country_home', countriesList[0]);
                })
            if (!homeAddressCountry && !mailingAddressCountry)
                setTimeout(() => {
                    setValue('country_mailing', countriesList[0]);
                })
        }
    }, [countriesList, employeeAddressData, setValue]);

    const watchBirthday = watch('birth_date');
    const watchCountryHome: any = watch('country_home');
    const watchAddressesAreSame = watch('addresses_are_same');
    const watchCountryMailing: any = watch('country_mailing');
    const watchAddressMailing = watch('address_mailing');
    const watchAddressDetailsMailing = watch('address_details_mailing');
    const watchCityMailing = watch('city_mailing');
    const watchStateMailing = watch('state_mailing');
    const watchPostalMailing = watch('postal_code_mailing');
    const watchPersonalNumber = watch('personal_number');
    const watchRemoveMask = watch('remove_mask');

    const valuesFilled = (items: any) => {
        const leftOvers = items.filter((item: any) => item !== false && item !== undefined && item !== '' && item !== null);

        if (leftOvers.length) {
            return true;
        } else {
            return false;
        }
    };

    const onClearPersonalNumber = (removeMask: boolean) => {
        if (!removeMask) {
            setValue('personal_number', '');
            clearErrors();
        }
    }

    useEffect(() => {
        if (watchRemoveMask) {
          clearErrors();
        }
    }, [watchRemoveMask])


    if (isLoading || contactDataLoading || addressDataLoading) return <LoadingScreenContainer><CircularProgress thickness={4} /></LoadingScreenContainer>;
    

    return (
        <ContentContainer>
            <StepTitle>{t('onBoarding.personalDetails.new_employee')}</StepTitle>
            <StepDesc style={{ whiteSpace: 'pre' }}>
                {t('onBoarding.personalDetails.profile_picture')}
                <span>{t('onBoarding.personalDetails.last_saved')} {isToday(new Date(updatedAt)) ? 'Today' : dateFormat(new Date(updatedAt), 'shortMonthAndDay')} at {dateFormat(new Date(updatedAt), 'shortTime')}</span>
            </StepDesc>
            <FieldsContainer>
                <SectionContainer>
                    <SectionTitle><PersonIcon />{t('settings.menu.personal_information')}</SectionTitle>
                    <FieldItem label={t('employee.profile_picture')}>
                        <AvatarContainer>
                            <EmployeeImage
                                initials={employeeInitials(employeeName)}
                                photoPreview={avatarPreview ?? avatarPhoto?.avatarFile}
                                fontSize={20}
                            />
                            <StyledPenIcon onClick={() => setAvatarModalOpen(true)} />
                        </AvatarContainer>
                    </FieldItem>
                    <div style={{ display: 'flex' }}>
                        <FieldItem label={t('employee.first_name')} required>
                            <UniversalInput
                                errorText={errors.first_name ? errors.first_name.message : ''}
                                {...register('first_name', { required: t('validations.first_name_required') })}
                            />
                        </FieldItem>
                        {region(['eng']) && !fillI9  ? <FieldItem label={t('employee.middle_name')}>
                            <UniversalInput {...register('middle_name')} />
                        </FieldItem> : null}
                        <FieldItem label={t('employee.last_name')} required>
                            <UniversalInput
                                errorText={errors.last_name ? errors.last_name.message : ''}
                                {...register('last_name', { required: t('validations.last_name_required') })}
                            />
                        </FieldItem>
                        {!fillI9 ? <FieldItem label={t('employee.preferred_name')}>
                            <UniversalInput {...register("preferred_name")} />
                        </FieldItem> : null}
                        {fillI9 ? <FieldItem label={t('employee.other_last_names')}>
                            <UniversalInput {...register('other_last_name')} />
                        </FieldItem> : null}
                    </div>
                    <div style={{ display: 'flex' }}>
                        {region(['eng']) && fillI9 ? <FieldItem label={t('employee.middle_name')}>
                            <UniversalInput {...register('middle_name')} />
                        </FieldItem> : null}

                        {region(['geo']) &&
                            <FieldItem label={t('employee.personal_number')} required>
                                <PersonalNumber
                                    register={{...register('personal_number', { required: t('validations.personal_number_required'), validate: value => value.length > 0 ? true : false }) }}
                                    control={control} 
                                    errors={errors}
                                    hiddeTitile
                                    wacthRemoveMask={watchRemoveMask}
                                    watchPersonalNumber={watchPersonalNumber}
                                    onClear={(removeMask: boolean) => onClearPersonalNumber(removeMask)}
                                />
                            </FieldItem>

                        }
                    {fillI9 ? <FieldItem label={t('employee.preferred_name')}>
                        <UniversalInput {...register("preferred_name")} />
                    </FieldItem> : null}
                    </div>
                    <div style={{ display: 'flex' }}>
                        <FieldItem label={t('employee.birth_date')} required>
                            <Controller
                                name="birth_date"
                                control={control}
                                rules={{ validate: value => value === null ? t('validations.valid_date') : value !== '' || t('validations.date_is_required') }}
                                render={({ field: { onChange, value, ref } }: any) => (
                                    <DatePicker
                                        ref={ref}
                                        selected={value}
                                        onChange={onChange}
                                        errorText={errors.birth_date ? errors.birth_date.message : ''}
                                    />
                                )}
                            />
                        </FieldItem>
                        {watchBirthday ? <span style={{ marginTop: 35 }}>({t('employee.age')}: {calculateAge(watchBirthday)})</span> : null}
                    </div>
                    <div style={{ display: 'flex' }}>
                        <FieldItem label={t('employee.gender')}>
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
                        </FieldItem>
                        <FieldItem label={t('employee.marital_status_name')}>
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
                        </FieldItem>
                    </div>
                    {region(['eng']) && <FieldItem label={t('employee.ssn')} required>
                        <Controller
                            name="ssn"
                            control={control}
                            rules={{
                                required: t('validations.ssn_is_required'),
                                pattern: FORM_PATTERNS.ssn
                            }}
                            render={({ field: { onChange, value, ref } }) => (
                                <StyledNumberFormatInput
                                    type='tel'
                                    format="###-##-####"
                                    mask={"_"}
                                    value={value}
                                    valueIsNumericString
                                    onValueChange={(values: any) => onChange(values.value)}
                                    $inputError={!!errors.ssn}
                                    getInputRef={ref}
                                />
                            )}
                        />
                        <SSNError>{errors.ssn ? errors.ssn.message : ''}</SSNError>
                    </FieldItem>}
                </SectionContainer>
                <SectionContainer>
                    <SectionTitle><HomeIcon /> {t('employee.address.addresses')}</SectionTitle>
                    <SectionSubTitle>{t('employee.address.home_address')}</SectionSubTitle>
                    <FieldItem label={t('employee.address.country')} required large>
                        <Controller
                            name="country_home"
                            control={control}
                            rules={{ required: t('onBoarding.personalDetails.select_country') }}
                            render={({ field: { onChange, value } }) => (
                                <SelectDropdown
                                    inputPlaceholder={t('validations.country_is_required')}
                                    onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
                                        onChange(newValue)
                                    }}
                                    value={value}
                                    options={countriesList}
                                    errorText={errors.country_home ? errors.country_home.message : ''}
                                />
                            )}
                        />
                    </FieldItem>
                    <FieldItem label={t('employee.address.address_line_one')} required large>
                        <UniversalInput
                            placeholder={t('employee.address.street_address_example')}
                            errorText={errors.address_home ? errors.address_home.message : ""}
                            {...register("address_home", { required: t('validations.address_line_one_is_required') })}
                        />
                    </FieldItem>
                    <FieldItem label={t('employee.address.address_line_two')} large>
                        <UniversalInput
                            placeholder={t('employee.address.street_address_example_two')}
                            {...register("address_details_home")}
                        />
                    </FieldItem>
                    <div style={{ display: 'flex' }}>
                        <FieldItem label={t('employee.address.city')} required>
                            <UniversalInput
                                errorText={errors.city_home ? errors.city_home.message : ""}
                                {...register("city_home", { required: t('validations.city_is_required') })}
                            />
                        </FieldItem>
                        <FieldItem label={t('employee.address.state_province_region')} required>
                            {watchCountryHome?.iso === 'US' ? <Controller
                                name="state_home"
                                control={control}
                                rules={{ required: t('validations.state_province_region_required') }}
                                render={({ field: { onChange, value } }) => (
                                    <SelectDropdown
                                        onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
                                            onChange(newValue)
                                        }}
                                        value={value}
                                        loadRemoteData={() => getStateList(200, 1)}
                                        inputPlaceholder={t('createPerson.select_state')}
                                        errorText={errors.state_home ? errors.state_home.message : ''}
                                    />
                                )}
                            /> : <UniversalInput
                                {...register('region_home', { required: t('validations.state_province_region_required') })}
                                errorText={errors.region_home ? errors.region_home.message : ''}
                            />
                            }
                        </FieldItem>
                        <FieldItem label={t('employee.address.postal_code')} required>
                            <UniversalInput
                                errorText={errors.postal_code_home ? errors.postal_code_home.message : ""}
                                {...register("postal_code_home", { required: t('validations.zip_postal_code_required') })}
                            />
                        </FieldItem>
                    </div>
                    <FieldItem label="" large>
                        <Controller
                            name="addresses_are_same"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <Checkbox
                                    checked={value}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        unregister(['country_mailing',
                                            'address_mailing', 'address_details_mailing',
                                            "city_mailing", 'postal_code_mailing', 'state_mailing'], {
                                            keepValue: false
                                        });
                                        onChange(event.target.checked);
                                    }}
                                    label={t('onBoarding.personalDetails.home_and_mailing')}
                                />
                            )}
                        />
                    </FieldItem>
                    {watchAddressesAreSame ? null : <MailingAddressContainer>
                        <SectionSubTitle>{t('employee.address.mailing_address')}</SectionSubTitle>
                        <FieldItem
                            label={t('employee.address.country')}
                            required={valuesFilled([
                                watchAddressMailing,
                                watchAddressDetailsMailing,
                                watchCityMailing,
                                watchStateMailing,
                                watchPostalMailing,
                            ])}
                            large
                        >
                            <Controller
                                name="country_mailing"
                                control={control}
                                rules={{
                                    required: valuesFilled([
                                        watchAddressMailing,
                                        watchAddressDetailsMailing,
                                        watchCityMailing,
                                        watchStateMailing,
                                        watchPostalMailing,
                                    ]) && t('validations.country_is_required')
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <SelectDropdown
                                        inputPlaceholder={t('validations.select_country')}
                                        onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
                                            onChange(newValue)
                                        }}
                                        value={value}
                                        options={countriesList}
                                        errorText={errors.country_home ? errors.country_home.message : ''}
                                    />
                                )}
                            />
                        </FieldItem>

                        <FieldItem label={t('employee.address.address_line_one')} large>
                            <UniversalInput
                                {...register("address_mailing")}
                                placeholder={t('employee.address.street_address_example')}
                            />
                        </FieldItem>
                        <FieldItem label={t('employee.address.address_line_two')} large>
                            <UniversalInput
                                {...register("address_details_mailing")}
                                placeholder={t('employee.address.street_address_example_two')}
                            />
                        </FieldItem>
                        <div style={{ display: 'flex' }}>
                            <FieldItem label={t('employee.address.city')}>
                                <UniversalInput
                                    {...register("city_mailing")}
                                />
                            </FieldItem>
                            <FieldItem label={t('employee.address.state_province_region')}>
                                {watchCountryMailing?.iso === 'US' ? <Controller
                                    name="state_mailing"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <SelectDropdown
                                            onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
                                                onChange(newValue)
                                            }}
                                            value={value}
                                            loadRemoteData={() => getStateList(200, 1)}
                                            inputPlaceholder={t('onBoarding.personalDetails.select_country')}
                                        />
                                    )}
                                /> : <UniversalInput {...register('region_mailing')} />
                                }
                            </FieldItem>
                            <FieldItem label={t('employee.address.postal_code')}>
                                <UniversalInput {...register("postal_code_mailing")} />
                            </FieldItem>
                        </div>
                    </MailingAddressContainer>}
                </SectionContainer>
                <SectionContainer style={{ border: 'none' }}>
                    <SectionTitle><MobileIcon /> {t('onBoarding.personalDetails.contacts')}</SectionTitle>
                    <SectionSubTitle>{t('employee.contact.phone')}</SectionSubTitle>
                    <FieldItem label={t('employee.contact.mobile_phone')} large>
                        <UniversalInput {...register("mobile_phone")} />
                    </FieldItem>
                    <FieldItem label={t('employee.contact.home_phone')} large>
                        <UniversalInput {...register("home_phone")} />
                    </FieldItem>
                    <SectionSubTitle>{t('employee.contact.email')}</SectionSubTitle>
                    <FieldItem label={t('employee.contact.personal_email')} large required>
                        <UniversalInput
                            errorText={errors.personal_email ? errors?.personal_email?.message : ""}
                            {...register("personal_email", {
                                required: t('validations.personal_email_is_required'),
                                pattern: FORM_PATTERNS.email,
                                maxLength: 250
                            })}
                        />
                    </FieldItem>
                    <SectionSubTitle>{t('onBoarding.personalDetails.social_links')}</SectionSubTitle>
                    <FieldItem label="LinkedIn" large>
                        <UniversalInput {...register("linkedin")} />
                    </FieldItem>
                    <FieldItem label="Facebook" large>
                        <UniversalInput {...register("facebook")} />
                    </FieldItem>
                    <FieldItem label="Twitter" large>
                        <UniversalInput {...register("twitter")} />
                    </FieldItem>
                </SectionContainer>
            </FieldsContainer>
            <AvatarUpload
                open={isAvatarModalOpen}
                employeeId={currentUser.employee.id}
                autonomous={false}
                onClose={() => setAvatarModalOpen(false)}
                onChange={onAvatarSelect}
                avatarValue={avatarPhoto}
            />
        </ContentContainer>
    )
};

const ContentContainer = styled.div`
    overflow-y: auto;
    flex: 1;
    padding-top: 60px;
`;

const FieldsContainer = styled.div`
    display: flex;
    margin-top: 50px;
    flex-direction: column;
`;

export const SectionContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-block: 10px;
    border-bottom: 1px solid #F2F3F3;
    margin-right: 60px;
    flex: 1;
`;

export const SectionTitle = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    color: #339966;
    font-size: 13px;
    font-family: 'Aspira Wide Demi', 'FiraGO Medium';
    & svg {
        margin-right: 6px;
    }
`;

const SectionSubTitle = styled.div`
    font-weight: bold;
    font-size: 12px;
    color: #000;
    margin-bottom: 15px;
`;

const StyledFieldItem = styled.div`
    width: 292px;
    margin-right: 10px;
    margin-bottom: 20px;
    & sup {
        color: #C54343;
    }
    & > label {
        display: inline-block;
        margin-bottom: 6px;
    }
`;

const MailingAddressContainer = styled.div``;

const AvatarContainer = styled.div`
  width: 92px;
  height: 92px;
  cursor: pointer;
  border: 1px solid #E6E6E6;
  border-radius: 50%;
  box-sizing: content-box;
  padding: 3px;
  & img {
    width: 92px;
    height: 92px;
  }
`;

const StyledPenIcon = styled(PenIcon)`
    width: 23px;
    height: 23px;
    position: relative;
    bottom: 24px;
    left: 60px;
    & circle {
        fill: #E2E2E2;
    }
    &:hover {
        circle {
            fill: #CDE6DA;
        }
        path {
            fill: #396;
        }
    }
`;

const StyledNumberFormatInput = styled(PatternFormat) <{ $inputError: boolean }>`
    width: 100%;
    border-radius: 4px;
    border: ${({ $inputError }) => $inputError ? '1px solid var(--red)' : '1px solid #D6D6D6'};
    padding: 11px 13px;

    &:focus {
      border-color:  ${({ $inputError }) => $inputError ? 'var(--red)' : '#99CC33'};
    }
`;

const SSNError = styled.span`
    color: var(--red);
    margin-top: 6px;
    font-size: 10px;
    display: inline-block;
`;

const LoadingScreenContainer = styled.div`
   display: flex;
   justify-content: center;
   align-items: center;
   flex: 1;
`;