import { Fragment, useEffect } from "react";
import styled from "styled-components";
import { Controller, useFormContext } from "react-hook-form";
import isToday from 'date-fns/isToday';
import utcToZonedTime from "date-fns-tz/utcToZonedTime";
import useQuery from "hooks/useQueryCustom";
import { getCountryList } from "services";
import { useSelector } from "react-redux";
import { currentUserSelector } from "redux/selectors";
import EnumDropdown from "components/Dropdowns/EnumDropdown";
import UniversalInput from "components/Input/UniversalInput";
import DatePicker from "components/DatePickers/DatePicker";
import SelectDropdown from "components/Dropdowns/SelectDropdown";
import CircularProgress from "@mui/material/CircularProgress";
import { PatternFormat } from "react-number-format";

import { StepTitle, StepDesc } from "./Welcome";
import { FieldItem } from './PersonalDetails';
import { useTranslation } from "react-i18next";
import { dateFormat } from "lib/DateFormat";

interface IEmploymentEligibility {
    updatedAt: Date
};

export default function EmploymentEligibility({ updatedAt }: IEmploymentEligibility) {
    const { t } = useTranslation();
    const currentUser = useSelector(currentUserSelector);
    const { control, register, setValue, unregister, watch, formState: { errors } } = useFormContext();

    const { data: { list: eligibilityTypes = [] } = [] } = useQuery<any>(["enum_eligibility_types"], {
        endpoint: "/enum/list?&model_name=Enum::EligibilityType",
        options: { method: "get" },
    }, { refetchOnWindowFocus: false });

    const { data: { list: authorizationDocs = [] } = [] } = useQuery<any>(["enum_authorization_docs"], {
        endpoint: "/enum/list?&model_name=Enum::AuthorizationDocument",
        options: { method: "get" },
    }, { refetchOnWindowFocus: false });

    const { data: eligibilityData, isLoading } = useQuery<any>(["get_eligibility_step"], {
        endpoint: `eligibility?employee_id=${currentUser?.employee.id}`,
        options: { method: "get" },
    }, { refetchOnWindowFocus: false });

    useEffect(() => {
        if (eligibilityData) {
            setValue('eligibility_type', eligibilityData.eligibility_type?.id);
            setValue('uscis_number', eligibilityData.uscis_number);
            setValue('expiration_date', eligibilityData?.expiration_date ? utcToZonedTime(new Date(eligibilityData.expiration_date), 'UTC') : '');
            setValue('authorization_document', eligibilityData.authorization_document?.id);
            setValue('i94_number', eligibilityData.i94_number);
            setValue('passport_number', eligibilityData.passport_number);
            setValue('country', eligibilityData.country);
        };
    }, [eligibilityData, setValue]);

    const watchIam = watch('eligibility_type');
    const watchAuthDoc = watch('authorization_document');

    const getEligibilityTypeName = (id: number) => {
        return eligibilityTypes.find((e: any) => e.id === id)?.id_name;
    };

    const getAuthorizationDocName = (id: number) => {
        return authorizationDocs.find((e: any) => e.id === id)?.id_name;
    };

    const renderRelevantDesc = (id: number) => {
        const item = getEligibilityTypeName(id);
        if (item === 'citizen') return t('onBoarding.employmentEligibility.citizen');
        if (item === 'noncitizen') return t('onBoarding.employmentEligibility.noncitizen');
        if (item === 'resident') return t('onBoarding.employmentEligibility.resident');
        if (item === 'authorized') return t('onBoarding.employmentEligibility.authorized');
    };

    const uscisNumberField = () => {
        return (
            <FieldItem label={t('onBoarding.employmentEligibility.uscis_alien_registration_number')} required large>
                <UniversalInput
                    inputProps={{ maxLength: 10, minLength: 7 }}
                    {...register('uscis_number', {
                        required: t('validations.uscis_alien_registration_number_is_required'),
                        pattern: {
                            value: /([A]{1})+([0-9]{7}|[0-9]{8}|[0-9]{9})*$/,
                            message: t('validations.document_number_is_invalid')
                        },
                        maxLength: {
                            value: 10,
                            message: t('validations.document_number_is_invalid')
                        },
                        minLength: {
                            value: 7,
                            message: t('validations.document_number_is_invalid')
                        }
                    })}
                    errorText={errors.uscis_number ? errors.uscis_number.message : ''}
                />
                <FieldDescription>
                    {t('onBoarding.employmentEligibility.fill_digit_number')}
                </FieldDescription>
            </FieldItem>
        )
    };

    const eligibilityTypeOnChange = (e: any) => {
        let id: number = e.target.value;
        if (getEligibilityTypeName(id) === 'citizen' || getEligibilityTypeName(id) === 'noncitizen') {
            unregister(['uscis_number', 'expiration_date', 'authorization_document', 'i94_number', 'passport_number', 'country']);
        };
    };

    if (isLoading) return <LoadingScreenContainer><CircularProgress thickness={4} /></LoadingScreenContainer>;

    return (
        <ContentContainer>
            <StepTitle>{t('onBoarding.employmentEligibility.employment_eligibility')}</StepTitle>
            <StepDesc>
                {t('onBoarding.employmentEligibility.your_eligibility')}<br />{t('onBoarding.employmentEligibility.legally_allowed')}
                <span>{t('onBoarding.personalDetails.last_saved')} {isToday(new Date(updatedAt)) ? t('onBoarding.personalDetails.today') : dateFormat(new Date(updatedAt), 'shortMonthAndDay')} at {dateFormat(new Date(updatedAt), 'shortTime')}</span>
            </StepDesc>
            <FieldsContainer>
                <FieldItem label={t('onBoarding.employmentEligibility.iam')} required large>
                    <Controller
                        name="eligibility_type"
                        rules={{ required: t('validations.employment_eligibility_is_required') }}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <EnumDropdown
                                placeholder={t('onBoarding.employmentEligibility.select_employment_eligibility')}
                                onChange={(e) => { onChange(e); eligibilityTypeOnChange(e); }}
                                value={value}
                                options={eligibilityTypes}
                                errorText={errors.eligibility_type ? errors.eligibility_type.message : '' as any}
                            />
                        )}
                    />
                    {watchIam ? <FieldDescription>{renderRelevantDesc(watchIam)}</FieldDescription> : null}
                </FieldItem>
                {getEligibilityTypeName(watchIam) === 'resident' && uscisNumberField()}
                {getEligibilityTypeName(watchIam) === 'authorized' && <Fragment>
                    <FieldItem label={t('onBoarding.employmentEligibility.authorized_until')} required>
                        <Controller
                            name="expiration_date"
                            control={control}
                            rules={{ validate: value => value === null ? t('validations.valid_date') : value !== '' || t('validations.authorized_to_work_required') }}
                            render={({ field: { onChange, value } }: any) => (
                                <DatePicker
                                    selected={value}
                                    onChange={onChange}
                                    errorText={errors.expiration_date ? errors.expiration_date.message : ''}
                                />
                            )}
                        />
                    </FieldItem>
                    <FieldItem label={t('onBoarding.employmentEligibility.authorization_documentation')} required large>
                        <Controller
                            name="authorization_document"
                            rules={{ required: t('validations.authorization_documentation_required') }}
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <EnumDropdown
                                    placeholder={t('onBoarding.employmentEligibility.select_authorization_documentation')}
                                    onChange={onChange}
                                    value={value}
                                    options={authorizationDocs}
                                    errorText={errors.authorization_document ? errors.authorization_document.message : '' as any}
                                />
                            )}
                        />
                    </FieldItem>
                    {getAuthorizationDocName(watchAuthDoc) === 'uscis_number' && uscisNumberField()}
                    {getAuthorizationDocName(watchAuthDoc) === 'i94' &&
                        <FieldItem label={t('onBoarding.employmentEligibility.form_i_94_admission')} required large>
                            <Controller
                                name="i94_number"
                                control={control}
                                rules={{
                                    required: t('validations.form_admission_required'),
                                    maxLength: {
                                        value: 11,
                                        message: t('validations.form_admission_invalid')
                                    },
                                    minLength: {
                                        value: 11,
                                        message: t('validations.form_admission_invalid')
                                    }
                                }}
                                render={({ field: { onChange, value, ref } }) => (
                                    <StyledNumberFormatInput
                                        type='tel'
                                        format="#########-##"
                                        mask={"_"}
                                        valueIsNumericString
                                        value={value}
                                        onValueChange={(values: any) => onChange(values.value)}
                                        $inputError={!!errors.i94_number}
                                        getInputRef={ref}
                                    />
                                )}
                            />
                            <FieldDescription>{t('onBoarding.employmentEligibility.fill_admission_number')}</FieldDescription>
                            <SSNError>{errors.i94_number ? errors.i94_number.message : ''}</SSNError>
                        </FieldItem>}
                    {getAuthorizationDocName(watchAuthDoc) === 'passport' &&
                        <Fragment>
                            <FieldItem label={t('onBoarding.employmentEligibility.foreign_passport_number')} required large>
                                <UniversalInput
                                    inputProps={{ maxLength: 50 }}
                                    {...register('passport_number', {
                                        required: t('validations.foreign_passport_required'),
                                        maxLength: {
                                            value: 50,
                                            message: t('validations.maximum_length_symbol')
                                        }
                                    })}
                                    errorText={errors.passport_number ? errors.passport_number.message : ''}
                                />
                            </FieldItem>
                            <FieldItem label={t('onBoarding.employmentEligibility.country_issuance')} required large>
                                <Controller
                                    name="country"
                                    control={control}
                                    rules={{ required: t('validations.country_issuance_required') }}
                                    render={({ field: { onChange, value } }) => (
                                        <SelectDropdown
                                            inputPlaceholder={t('onBoarding.employmentEligibility.select_country_issuance')}
                                            onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
                                                onChange(newValue)
                                            }}
                                            value={value}
                                            loadRemoteData={() => getCountryList(300, 1)}
                                            errorText={errors.country ? errors.country.message : ''}
                                        />
                                    )}
                                />
                            </FieldItem>
                        </Fragment>}
                </Fragment>}
            </FieldsContainer>
        </ContentContainer>
    )
};

const ContentContainer = styled.div`
    flex: 1;
    padding-top: 60px;
    overflow-y: auto;
`;

const FieldsContainer = styled.div`
    margin-top: 20px;
    margin-right: 60px;
`;

const FieldDescription = styled.p`
    font-size: 9px;
    color: #636D73;
    margin-top: 5px;
`;

const StyledNumberFormatInput = styled(PatternFormat) <{ $inputError: boolean }>`
    width: 100%;
    border-radius: 4px;
    border: ${({ $inputError }) => $inputError ? '1px solid var(--red)' : '1px solid #D6D6D6'};
    padding: 10px 13px;

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