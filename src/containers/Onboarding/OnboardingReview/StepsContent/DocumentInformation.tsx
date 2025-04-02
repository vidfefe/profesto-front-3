import { PropsWithChildren, Fragment, CSSProperties } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Controller, useFormContext } from "react-hook-form";
import utcToZonedTime from "date-fns-tz/utcToZonedTime";
import useQueryCustom from "hooks/useQueryCustom";
import Divider from "@mui/material/Divider";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import RadioButton from "components/RadioButton";
import TextArea from "components/TextArea";
import UniversalInput from "components/Input/UniversalInput";
import DatePicker from "components/DatePickers/DatePicker";
import Checkbox from "components/Checkbox";
import { useTranslation } from "react-i18next";
import { StepTitle, StepDesc } from "../../StepsContent/Welcome";

interface IFieldItem {
    required?: boolean,
    label: string,
    style?: CSSProperties,
};

export const FieldItem = ({ children, required, label, style }: PropsWithChildren<IFieldItem>) => {
    return (
        <StyledFieldItem style={style}>
            {label && <label>{label}{required && <sup>*</sup>}</label>}
            {children}
        </StyledFieldItem>
    )
};

export default function DocumentInformation({ setRequiredFields }: { setRequiredFields: (e: any) => void }) {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const { control, register, watch, setValue, formState: { errors } } = useFormContext();
    const watchSEVP = watch('sevp');

    const { data } = useQueryCustom<string[], {}, {}>(["get_onboarding_fill_documents"], {
        endpoint: `onboarding/admin/fill_documents?employee_id=${id}`,
        options: { method: "get" },
        onSuccess: (data: any) => {
            //find required fields to show in tooltip
            if (data?.class_a) {
                if (data.class_a.id_name === 'us_passport') {
                    setRequiredFields(['doc_title', 'issuing_authority', 'doc_number']);
                };
                if (data.class_a.id_name === 'resident') {
                    setRequiredFields(['doc_title', 'issuing_authority', 'doc_number']);
                };
                if (data.class_a.id_name === 'foreign_passport') {
                    setValue('doc_title', 'foreign_passport');
                    setRequiredFields(['issuing_authority', 'doc_number']);
                };
                if (data.class_a.id_name === 'authorization') {
                    setValue('doc_title', 'employment_authorization');
                    setRequiredFields(['issuing_authority', 'doc_number']);
                };
                if (data.class_a.id_name === 'nonimmigrant') {
                    setValue('doc_title', 'foreign_passport_nonimmigrant');
                    setValue('secondary_doc_title', 'arrival/departure_record');
                    setRequiredFields(['issuing_authority', 'doc_number', 'sevp_doc_title', 'sevp_issuing_authority', 'sevp_doc_number', 'secondary_issuing_authority', 'secondary_doc_number']);
                };
                if (data.class_a.id_name === 'micronesia_or_marshall_islands') {
                    setValue('secondary_doc_title', 'arrival/departure_record');
                    setRequiredFields(['doc_title', 'issuing_authority', 'doc_number', 'sevp_doc_title', 'sevp_issuing_authority', 'sevp_doc_number', 'secondary_issuing_authority', 'secondary_doc_number']);
                };
            };
            if (data?.class_b) {
                if (data.class_b.id_name === 'driver_license') {
                    setRequiredFields(['doc_title', 'issuing_authority', 'doc_number']);
                };
                if (data.class_b.id_name === 'id_card') {
                    setValue('doc_title', 'photo_id_card');
                    setRequiredFields(['issuing_authority', 'doc_number']);
                };
                if (data.class_b.id_name === 'school_id') {
                    setValue('doc_title', 'school_id');
                    setRequiredFields(['issuing_authority', 'doc_number']);
                };
                if (data.class_b.id_name === 'voter_card') {
                    setValue('doc_title', 'voter_registration_card');
                    setRequiredFields(['issuing_authority', 'doc_number']);
                };
                if (data.class_b.id_name === 'military_card') {
                    setRequiredFields(['doc_title', 'issuing_authority', 'doc_number']);
                };
                if (data.class_b.id_name === 'military_department_card') {
                    setValue('doc_title', 'military_dependent_id');
                    setRequiredFields(['issuing_authority', 'doc_number']);
                };
                if (data.class_b.id_name === 'coast_guard_card') {
                    setValue('doc_title', 'us_coast_guard');
                    setRequiredFields(['issuing_authority', 'doc_number']);
                };
                if (data.class_b.id_name === 'native_american_document') {
                    setValue('doc_title', 'native_american_tribal');
                    setRequiredFields(['issuing_authority', 'doc_number']);
                };
                if (data.class_b.id_name === 'canada_driver_license') {
                    setValue('doc_title', 'driver_license_canada');
                    setRequiredFields(['issuing_authority', 'doc_number']);
                };
            };
            if (data?.underage) {
                if (data.underage.id_name === 'school_record') {
                    setValue('doc_title', 'school_record');
                    setRequiredFields(['issuing_authority', 'doc_number']);
                };
                if (data.underage.id_name === 'hospital_record') {
                    setValue('doc_title', 'hospital_record');
                    setRequiredFields(['issuing_authority', 'doc_number']);
                };
                if (data.underage.id_name === 'nursery_school_record') {
                    setRequiredFields(['doc_title', 'issuing_authority', 'doc_number']);
                };
            };
            if (data?.class_c) {
                if (data.class_c.id_name === 'us_passport') {
                    setValue('secondary_doc_title', 'social_security_card');
                    setRequiredFields((e: any) => [...e, 'secondary_issuing_authority', 'secondary_doc_number']);
                };
                if (data.class_c.id_name === 'birth_certificate') {
                    setRequiredFields((e: any) => [...e, 'secondary_doc_title', 'secondary_issuing_authority', 'secondary_doc_number']);
                };
                if (data.class_c.id_name === 'original_birth_certificate') {
                    setRequiredFields((e: any) => [...e, 'secondary_doc_title', 'secondary_issuing_authority', 'secondary_doc_number']);
                };
                if (data.class_c.id_name === 'native_american') {
                    setValue('secondary_doc_title', 'native_american_tribal');
                    setRequiredFields((e: any) => [...e, 'secondary_issuing_authority', 'secondary_doc_number']);
                };
                if (data.class_c.id_name === 'form_i-197') {
                    setValue('secondary_doc_title', 'us_citizen_id');
                    setRequiredFields((e: any) => [...e, 'secondary_issuing_authority', 'secondary_doc_number']);
                };
                if (data.class_c.id_name === 'form_i-179') {
                    setValue('secondary_doc_title', 'resident_citizen_id');
                    setRequiredFields((e: any) => [...e, 'secondary_issuing_authority', 'secondary_doc_number']);
                };
                if (data.class_c.id_name === 'employment_authorization_document') {
                    setValue('secondary_doc_title', 'employment_authorization');
                    setRequiredFields((e: any) => [...e, 'secondary_issuing_authority', 'secondary_doc_number']);
                };
            };
            if (data?.filled_documents) {
                setValue('doc_title', data.filled_documents.doc_title);
                setValue('issuing_authority', data.filled_documents.issuing_authority ?? '');
                setValue('doc_number', data.filled_documents.doc_number);
                setValue('expiration_date', data.filled_documents.expiration_date ? utcToZonedTime(new Date(data.filled_documents.expiration_date), 'UTC') : '');
                setValue('sevp', data.filled_documents.sevp);
                setValue('sevp_doc_title', data.filled_documents.sevp_doc_title);
                setValue('sevp_issuing_authority', data.filled_documents.sevp_issuing_authority ?? '');
                setValue('sevp_doc_number', data.filled_documents.sevp_doc_number);
                setValue('sevp_expiration_date', data.filled_documents.sevp_expiration_date ? utcToZonedTime(new Date(data.filled_documents.sevp_expiration_date), 'UTC') : '');
                setValue('secondary_doc_title', data.filled_documents.secondary_doc_title);
                setValue('secondary_issuing_authority', data.filled_documents.secondary_issuing_authority ?? '');
                setValue('secondary_doc_number', data.filled_documents.secondary_doc_number);
                setValue('secondary_expiration_date', data.filled_documents.secondary_expiration_date ? utcToZonedTime(new Date(data.filled_documents.secondary_expiration_date), 'UTC') : '');
            };
        },
    }, { refetchOnWindowFocus: false });

    const renderPlainDocumentFields = (type: string, radioButtons: { value: string, label: string }[] = []) => {
        return (
            <Fragment>
                {radioButtons.length ? <FieldItem label={t('onBoarding.onboardingReview.document_title')} required>
                    <Controller
                        control={control}
                        rules={{ required: t('validations.document_title_required') }}
                        name={`${type ? type + '_' : ''}doc_title`}
                        render={({ field }) => (
                            <Fragment>
                                <RadioGroup {...field}>
                                    {radioButtons.map((e, i) => (
                                        <FormControlLabel
                                            key={i}
                                            value={e.value}
                                            control={<RadioButton />}
                                            label={e.label}
                                        />
                                    ))}
                                </RadioGroup>
                                <RadioButtonsError>{errors[`${type ? type + '_' : ''}doc_title`]?.message}</RadioButtonsError>
                            </Fragment>
                        )}
                    />
                </FieldItem> : null}
                <FieldItem label="">
                    <Controller
                        name={`${type ? type + '_' : ''}issuing_authority`}
                        control={control}
                        rules={{ required: t('validations.issuing_authority_required') }}
                        render={({ field: { value, onChange } }) => (
                            <TextArea
                                value={value}
                                onChange={onChange}
                                label={t('onBoarding.onboardingReview.issuing_authority')}
                                required
                                maxRows={1}
                                maxLength={550}
                                errorText={errors[`${type ? type + '_' : ''}issuing_authority`]?.message as string}
                            />
                        )}
                    />
                </FieldItem>
                <FieldItem label={t('onBoarding.onboardingReview.document_number')} required>
                    <UniversalInput
                        {...register(`${type ? type + '_' : ''}doc_number`, { required: t('validations.document_number_is_required'), maxLength: 50 })}
                        errorText={errors[`${type ? type + '_' : ''}doc_number`]?.message}
                        inputProps={{ maxLength: 50 }}
                    />
                </FieldItem>
                <FieldItem label="">
                    <Controller
                        name={`${type ? type + '_' : ''}expiration_date`}
                        control={control}
                        rules={{ validate: value => value !== null || t('validations.valid_date') }}
                        render={({ field: { onChange, value } }) => (
                            <DatePicker
                                selected={value}
                                onChange={onChange}
                                label='Expiration Date (if any)'
                                errorText={errors[`${type ? type + '_' : ''}expiration_date`]?.message}
                            />
                        )}
                    />
                </FieldItem>
            </Fragment>
        )
    };

    const renderDocumentFields = (
        type: string,
        docTitle: string,
        radioButtons: { value: string, label: string }[] = [],
        divider: boolean = true,
        sevp?: { value: string, label: string }[]
    ) => {
        return (
            <Fragment>
                <SingleListContainer>
                    <ListTitleContainer>{docTitle}</ListTitleContainer>
                    {renderPlainDocumentFields(type, radioButtons)}
                    {sevp && <Fragment>
                        <FieldItem label="">
                            <Controller
                                name="sevp"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <Checkbox
                                        checked={value}
                                        onChange={onChange}
                                        label={t('onBoarding.documentInformation.documentInformation')}
                                    />
                                )}
                            />
                        </FieldItem>
                        {watchSEVP && renderPlainDocumentFields('sevp', sevp)}
                    </Fragment>}
                </SingleListContainer>
                {divider ? <Divider orientation="vertical" flexItem sx={{ marginInline: 3 }} /> : null}
            </Fragment>
        )
    };

    const fieldsClassAConstructor = (data: any) => {
        if (data?.class_a) {
            if (data.class_a.id_name === 'us_passport') {
                return renderDocumentFields(
                    '',
                    t('onBoarding.documentInformation.us_passport_passport_card'),
                    [{ value: 'passport', label: 'US Passport' }, { value: 'passport_card', label: t('onBoarding.documentInformation.us_passport_card')}],
                    false
                );
            };
            if (data.class_a.id_name === 'resident') {
                return renderDocumentFields(
                    '',
                    t('onBoarding.documentInformation.permanent_resident_card'),
                    [{ value: 'permanent', label: 'Permanent Resident Card' }, { value: 'alien', label: t('onBoarding.documentInformation.alien_registration_receipt_card') }],
                    false
                );
            };
            if (data.class_a.id_name === 'foreign_passport') {
                return renderDocumentFields('', t('onBoarding.documentInformation.foreign_passport_with_temporary'), [], false);
            };
            if (data.class_a.id_name === 'authorization') {
                return renderDocumentFields('', t('onBoarding.documentInformation.employment_authorization'), [], false);
            };
            if (data.class_a.id_name === 'nonimmigrant') {
                return (
                    <Fragment>
                        {renderDocumentFields(
                            '',
                            t('onBoarding.documentInformation.foreign_passport'),
                            [],
                            true,
                            [{ value: 'student', label:  t('onBoarding.documentInformation.certificate_eligibility_nonimmigrant') },
                            { value: 'visitor', label: t('onBoarding.documentInformation.certificate_eligibility_exchange') }]
                        )}
                        {renderDocumentFields(
                            t('onBoarding.documentInformation.secondary'),
                            t('onBoarding.documentInformation.arrival_departure'),
                            [],
                            false,
                        )}
                    </Fragment>
                )
            };
            if (data.class_a.id_name === 'micronesia_or_marshall_islands') {
                return (
                    <Fragment>
                        {renderDocumentFields(
                            '',
                            t('onBoarding.documentInformation.passport_from_federal'),
                            [{ value: 'micronesia', label: t('onBoarding.documentInformation.federal_states_micronesia_passport') },
                            { value: 'marshal', label: t('onBoarding.documentInformation.republic_marshall_islands_passport') }],
                            true,
                            [{ value: 'student', label: t('onBoarding.documentInformation.certificate_eligibility_nonimmigrant') },
                            { value: 'visitor', label: t('onBoarding.documentInformation.certificate_eligibility_exchange') }]
                        )}
                        {renderDocumentFields(
                            t('onBoarding.documentInformation.secondary'),
                            t('onBoarding.documentInformation.arrival_departure'),
                            [],
                            false,
                        )}
                    </Fragment>
                )
            };
        };
    };

    const fieldsClassBConstructor = (data: any) => {
        if (data?.class_b) {
            if (data.class_b.id_name === 'driver_license') {
                return renderDocumentFields(
                    '',
                    t('onBoarding.documentInformation.drivers_license_state_issued_card'),
                    [{ value: 'driver', label: t('onBoarding.documentInformation.drivers_license')}, { value: 'id', label: t('onBoarding.documentInformation.state_id_card')}],
                )
            };
            if (data.class_b.id_name === 'id_card') {
                return renderDocumentFields('', t('onBoarding.documentInformation.photo_id_card_issued_agency'));
            };
            if (data.class_b.id_name === 'school_id') {
                return renderDocumentFields('', t('onBoarding.documentInformation.school_id'));
            };
            if (data.class_b.id_name === 'voter_card') {
                return renderDocumentFields('', t('onBoarding.documentInformation.voters_registration_card'))
            };
            if (data.class_b.id_name === 'military_card') {
                return renderDocumentFields(
                    '',
                    t('onBoarding.documentInformation.us_military_card_draft_record'),
                    [{ value: 'card', label: t('onBoarding.documentInformation.us_military_card') }, { value: 'draft', label: t('onBoarding.documentInformation.us_military_draft_record') }]
                )
            };
            if (data.class_b.id_name === 'military_department_card') {
                return renderDocumentFields('', t('onBoarding.documentInformation.military_dependents_id_card'));
            };
            if (data.class_b.id_name === 'coast_guard_card') {
                return renderDocumentFields('',  t('onBoarding.documentInformation.us_coast_guard_merchant_card'))
            };
            if (data.class_b.id_name === 'native_american_document') {
                return renderDocumentFields('', t('onBoarding.documentInformation.native_american_tribal_document'))
            };
            if (data.class_b.id_name === 'canada_driver_license') {
                return renderDocumentFields('', t('onBoarding.documentInformation.drivers_license_issued_government'))
            };
        };
        if (data?.underage) {
            if (data.underage.id_name === 'school_record') {
                return renderDocumentFields('', t('onBoarding.documentInformation.school_record_report'))
            };
            if (data.underage.id_name === 'hospital_record') {
                return renderDocumentFields('', t('onBoarding.documentInformation.clinic_doctor_hospital'));
            };
            if (data.underage.id_name === 'nursery_school_record') {
                return renderDocumentFields(
                    '',
                    t('onBoarding.documentInformation.daycare_nursery'),
                    [{ value: 'day_care', label: t('onBoarding.documentInformation.day_care_record') }, { value: 'nursery', label: t('onBoarding.documentInformation.nursery_school_record') }]
                )
            };
        };
    };

    const fieldsClassCConstructor = (data: any) => {
        if (data?.class_c) {
            if (data.class_c.id_name === 'us_passport') {
                return renderDocumentFields('secondary', t('onBoarding.documentInformation.social_security_card'), [], false);
            };
            if (data.class_c.id_name === 'birth_certificate') {
                return renderDocumentFields(
                    'secondary',
                    t('onBoarding.documentInformation.certification_report'),
                    [{ value: 'birth_cert', label: t('onBoarding.documentInformation.birth_certificate') },
                    { value: 'abroad_cert', label: t('onBoarding.documentInformation.birth_abroad_certification')},
                    { value: 'consular_report', label: t('onBoarding.documentInformation.consular_report_birth_abroad') }],
                    false
                );
            };
            if (data.class_c.id_name === 'original_birth_certificate') {
                return renderDocumentFields(
                    'secondary',
                    t('onBoarding.documentInformation.original_certified_birth'),
                    [{ value: 'state_birth_cert', label: t('onBoarding.documentInformation.state_birth_certificate') },
                    { value: 'country_birth_cert', label: t('onBoarding.documentInformation.county_birth_certificate')  },
                    { value: 'municipal_birth_cert', label: t('onBoarding.documentInformation.municipal_authority_birth_certificate')  },
                    { value: 'territory_birth_cert', label: t('onBoarding.documentInformation.territory_birth_certificate') }],
                    false
                );
            };
            if (data.class_c.id_name === 'native_american') {
                return renderDocumentFields('secondary', t('onBoarding.documentInformation.native_american_tribal_document'), [], false);
            };
            if (data.class_c.id_name === 'form_i-197') {
                return renderDocumentFields('secondary', t('onBoarding.documentInformation.us_citizen_id_card'), [], false);
            };
            if (data.class_c.id_name === 'form_i-179') {
                return renderDocumentFields('secondary', t('onBoarding.documentInformation.resident_citizen_id_card'), [], false);
            };
            if (data.class_c.id_name === 'employment_authorization_document') {
                return renderDocumentFields('secondary', t('onBoarding.documentInformation.authorization_issued_department_homeland_security'), [], false);
            };
        };
    };

    return (
        <ContentContainer>
            <StepTitle>{t('onBoarding.documentInformation.enter_document_information')}</StepTitle>
            <StepDesc>
                {t('onBoarding.documentInformation.enter_information_employee')}
            </StepDesc>
            <ListsContainer>
                {fieldsClassAConstructor(data)}
                {fieldsClassBConstructor(data)}
                {fieldsClassCConstructor(data)}
            </ListsContainer>
        </ContentContainer>
    )
};

const ContentContainer = styled.div`
    overflow-y: auto;
    flex: 1;
    padding-top: 60px;
`;

const ListsContainer = styled.div`
    display: flex;
    flex: 1;
    padding-block: 50px;
    margin-right: 60px;
    margin-bottom: 20px;
`;

const SingleListContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-inline: 5px;
    flex: 0 1 33.3%;
`;

const StyledFieldItem = styled.div`
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

const ListTitleContainer = styled.div`
    font-size: 13px;
    color: #339966;
    font-family: 'Aspira Wide Demi', 'FiraGO Medium';
    text-align: left;
    margin-bottom: 25px;
`;

const RadioButtonsError = styled.span`
    color: var(--red);
    margin-top: 6px;
    font-size: 10px;
    display: inline-block;
`;