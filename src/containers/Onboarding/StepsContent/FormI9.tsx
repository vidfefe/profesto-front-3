import { useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import styled from "styled-components";
import isToday from "date-fns/isToday";
import useQuery from "hooks/useQueryCustom";
import Checkbox from "components/Checkbox";
import RadioButton from "components/RadioButton";
import UniversalInput from "components/Input/UniversalInput";
import SelectDropdown from "components/Dropdowns/SelectDropdown";
import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import { getStateList } from "services";
import { useSelector } from "react-redux";
import { currentUserSelector } from "redux/selectors";

import { StepTitle, StepDesc } from "./Welcome";
import { FieldItem, SectionTitle, SectionContainer } from './PersonalDetails';
import SignatureTypes from '../SignatureComponent';
import i9Example from 'assets/img/i-9_example.png';
import { ReactComponent as PreparatorIcon } from 'assets/svg/info_circle/document-circle.svg';
import { useTranslation } from "react-i18next";
import { dateFormat } from "lib/DateFormat";

interface IFormI9 {
    updatedAt: Date
};

export default function FormI9({ updatedAt }: IFormI9) {
    const { t } = useTranslation();
    const { employee, company } = useSelector(currentUserSelector);
    const { control, register, unregister, setValue, watch, formState: { errors } } = useFormContext();
    const watchUsedPreparer = watch('used_preparer');

    const { data: { list: countriesList = [] } = [] } = useQuery<any>(["dictionary_countries_list"], {
        endpoint: "/country?page_limit=300&page=1",
        options: { method: "get" },
        onSuccess: (data) => setValue('country', data?.list[0]),
    }, { refetchOnWindowFocus: false });

    const { refetch: getI9Preview, isFetching: previewI9Loading } = useQuery<any>(["get_i9_preview"], {
        endpoint: `/onboarding/i9_preview?employee_id=${employee.id}`,
        options: { method: "get", responseType: 'arraybuffer' },
        onSuccess: (data) => {
            let blob = new Blob([data], { type: 'application/pdf' });
            let url = URL.createObjectURL(blob);
            window.open(url);
        },
    }, { enabled: false });

    useEffect(() => {
        if (watchUsedPreparer === 'no') {
            unregister(['first_name', 'last_name',
                'country', 'address', 'address_details',
                'city', 'state', 'region', 'postal_code',
                'email', 'signature_preparer', 'terms_agreed_preparer'], { keepDefaultValue: true });
        };
    }, [unregister, watchUsedPreparer]);

    const { data: formI9Data, isLoading } = useQuery<any>(["get_formI9_step"], {
        endpoint: `document/i9?employee_id=${employee.id}`,
        options: { method: "get" },
    }, { refetchOnWindowFocus: false });

    const signature_img = formI9Data?.signature.uuid ? `${process.env.REACT_APP_BASE_API_URL}document/signature/${company.id}/${formI9Data?.signature.uuid}` : null;
    const signature_preparer_img = formI9Data?.i9_preparer?.signature.uuid ? `${process.env.REACT_APP_BASE_API_URL}document/preparer_signature/${company.id}/${formI9Data?.i9_preparer.signature.uuid}` : null;

    useEffect(() => {
        if (formI9Data) {
            if (formI9Data.signature.type === 'text') {
                setValue('signature', { signature: formI9Data.signature.signature, type: formI9Data.signature.type });
            };
            setValue('terms_agreed', formI9Data.terms_agreed);
            setValue('used_preparer', formI9Data.used_preparer ? 'yes' : 'no');
            setValue('first_name', formI9Data.i9_preparer?.first_name);
            setValue('last_name', formI9Data.i9_preparer?.last_name);
            if (formI9Data.i9_preparer?.country) {
                setValue('country', formI9Data.i9_preparer?.country);
            };
            setValue('address', formI9Data.i9_preparer?.address);
            setValue('address_details', formI9Data.i9_preparer?.address_details);
            setValue('city', formI9Data.i9_preparer?.city);
            setValue('state', formI9Data.i9_preparer?.state);
            setValue('state', formI9Data.i9_preparer?.state);
            setValue('region', formI9Data.i9_preparer?.region);
            setValue('postal_code', formI9Data.i9_preparer?.postal_code);
            if (formI9Data.i9_preparer?.signature.type === 'text') {
                setValue('signature_preparer', {
                    signature: formI9Data.i9_preparer.signature.signature,
                    type: formI9Data.i9_preparer.signature.type
                });
            };
            setValue('terms_agreed_preparer', formI9Data.i9_preparer?.terms_agreed);
        };
    }, [formI9Data, setValue]);

    const toDataURL = (url: any) => fetch(url)
        .then(response => response.blob())
        .then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(blob)
        }));

    useEffect(() => {
        if (signature_img && formI9Data.signature.type === 'draw') {
            toDataURL(signature_img).then(dataUrl => {
                setValue('signature', { signature: dataUrl, type: formI9Data.signature.type, })
            });
        };
        if (signature_preparer_img && formI9Data.i9_preparer.signature.type === 'draw') {
            toDataURL(signature_preparer_img).then(dataUrl => {
                setValue('signature_preparer', { signature: dataUrl, type: formI9Data.i9_preparer.signature.type, })
            });
        };
        if (signature_img && formI9Data.signature.type === 'upload') {
            setValue('signature', { signature: signature_img, type: formI9Data.signature.type, })
        };
        if (signature_preparer_img && formI9Data.i9_preparer.signature.type === 'upload') {
            setValue('signature_preparer', { signature: signature_preparer_img, type: formI9Data.i9_preparer.signature.type, })
        };
        return () => {
            setValue('signature', { signature: null, type: 'draw' });
            setValue('signature_preparer', { signature: null, type: 'draw' });
        };
    }, [formI9Data?.i9_preparer?.signature.type, formI9Data?.signature.type, setValue, signature_img, signature_preparer_img]);

    if (isLoading) return <LoadingScreenContainer><CircularProgress thickness={4} /></LoadingScreenContainer>;

    return (
        <ContentContainer>
            <StepTitle>{t('onBoarding.formI9.form_i_9_signature')}</StepTitle>
            <StepDesc>
            {t('onBoarding.formI9.form_i_9_records')}<br />{t('onBoarding.formI9.please_review_information')}
                <span>Last Saved {isToday(new Date(updatedAt)) ? 'Today' : dateFormat(new Date(updatedAt), 'shortMonthAndDay')} at {dateFormat(new Date(updatedAt), 'shortTime')}</span>
            </StepDesc>
            <FormI9ContentContainer>
                <I9ExampleContainer onClick={() => getI9Preview()}>
                    <img src={i9Example} alt="i-9 example" />
                    <p>{t('onBoarding.formI9.review_document')}</p>
                    {previewI9Loading ? <LinearProgress /> : null}
                </I9ExampleContainer>
                <FormI9FieldsContainer>
                    <SectionContainer style={{ borderWidth: watchUsedPreparer === 'yes' ? '1px' : 0 }}>
                        <div style={{ marginBottom: 15 }}>
                            <Controller
                                control={control}
                                rules={{ validate: value => !!value.signature || t('validations.signature_required') }}
                                name="signature"
                                render={({ field: { onChange, value } }) => (
                                    <SignatureTypes
                                        label={t('onBoarding.signature')}
                                        required
                                        activeTab={value.type}
                                        onChange={onChange}
                                        value={value}
                                        helperText={errors.signature ? errors.signature.message : '' as any}
                                        isErrorText
                                    />
                                )}
                            />
                        </div>
                        <FieldItem label="" large>
                            <Controller
                                control={control}
                                rules={{ required: t('validations.agreement_required') }}
                                name="terms_agreed"
                                render={({ field: { onChange, value } }) => (
                                    <Checkbox
                                        checked={value}
                                        onChange={onChange}
                                        label={t('onBoarding.formI9.agree_electronicall')}
                                        errorText={errors.terms_agreed ? errors.terms_agreed.message : ''}
                                    />
                                )}
                            />
                        </FieldItem>
                        <FieldItem label={t('onBoarding.formI9.did_you_use_translator')} required large>
                            <FormControl>
                                <Controller
                                    control={control}
                                    rules={{ required: true }}
                                    name="used_preparer"
                                    render={({ field }) => (
                                        <RadioGroup row {...field}>
                                            <FormControlLabel value={'no'} control={<RadioButton />} label={t('onBoarding.formI9.completed_myself')} />
                                            <FormControlLabel value={'yes'} control={<RadioButton />} label={t('onBoarding.formI9.translator')} />
                                        </RadioGroup>
                                    )}
                                />
                            </FormControl>
                        </FieldItem>
                    </SectionContainer>

                    {watchUsedPreparer === 'yes' &&
                        <SectionContainer style={{ border: 'none', marginTop: 15 }}>
                            <SectionTitle><PreparatorIcon /> {t('onBoarding.formI9.certification')}</SectionTitle>
                            <div style={{ display: 'flex' }}>
                                <FieldItem label={t('employee.first_name')} required>
                                    <UniversalInput
                                        errorText={errors.first_name ? errors.first_name.message : ''}
                                        {...register('first_name', { required: t('validations.preparer_first_name_required') })}
                                    />
                                </FieldItem>
                                <FieldItem label={t('employee.last_name')} required>
                                    <UniversalInput
                                        errorText={errors.last_name ? errors.last_name.message : ''}
                                        {...register('last_name', { required: t('validations.preparer_last_name_required') })}
                                    />
                                </FieldItem>
                            </div>
                            <FieldItem label={t('employee.address.country')} required large>
                                <Controller
                                    name="country"
                                    control={control}
                                    rules={{ required: t('validations.preparer_country_required') }}
                                    render={({ field: { onChange, value } }) => (
                                        <SelectDropdown
                                            inputPlaceholder={t('createPerson.select_country')}
                                            onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
                                                onChange(newValue)
                                            }}
                                            value={value}
                                            options={countriesList}
                                            errorText={errors.country ? errors.country.message : ''}
                                        />
                                    )}
                                />
                            </FieldItem>
                            <FieldItem label={t('employee.address.address_line_one')} required large>
                                <UniversalInput
                                    placeholder={t('employee.address.street_address_example')}
                                    errorText={errors.address ? errors.address.message : ""}
                                    {...register("address", { required: t('validations.preparer_address_required') })}
                                />
                            </FieldItem>
                            <FieldItem label={t('employee.address.address_line_two')} large>
                                <UniversalInput
                                    placeholder={t('employee.address.street_address_example_two')}
                                    {...register("address_details")}
                                />
                            </FieldItem>
                            <div style={{ display: 'flex' }}>
                                <FieldItem label={t('employee.address.city')} required>
                                    <UniversalInput
                                        errorText={errors.city ? errors.city.message : ""}
                                        {...register("city", { required: t('validations.preparer_city_required') })}
                                    />
                                </FieldItem>
                                <FieldItem label={t('employee.address.state_province_region')} required>
                                    {watch('country')?.iso === 'US' ? <Controller
                                        name="state"
                                        control={control}
                                        rules={{ required: t('validations.preparer_state_required') }}
                                        render={({ field: { onChange, value } }) => (
                                            <SelectDropdown
                                                onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
                                                    onChange(newValue)
                                                }}
                                                value={value}
                                                loadRemoteData={() => getStateList(200, 1)}
                                                inputPlaceholder={t('createPerson.select_state')}
                                                errorText={errors.state ? errors.state.message : ''}
                                            />
                                        )}
                                    /> : <UniversalInput
                                        {...register('region', { required: t('validations.preparer_state_required') })}
                                        errorText={errors.region ? errors.region.message : ''}
                                    />
                                    }
                                </FieldItem>
                                <FieldItem label={t('employee.address.postal_code')} required>
                                    <UniversalInput
                                        errorText={errors.postal_code ? errors.postal_code.message : ""}
                                        {...register("postal_code", { required: t('validations.preparer_zip_required') })}
                                    />
                                </FieldItem>
                            </div>
                            <div style={{ marginBottom: 15 }}>
                                <Controller
                                    control={control}
                                    rules={{ validate: value => !!value.signature || t('validations.preparer_signature_required') }}
                                    name="signature_preparer"
                                    render={({ field: { onChange, value } }) => (
                                        <SignatureTypes
                                            label={t('onBoarding.signature')}
                                            required
                                            activeTab={value.type}
                                            onChange={onChange}
                                            value={value}
                                            helperText={errors.signature_preparer ? errors.signature_preparer.message : '' as any}
                                            isErrorText
                                        />
                                    )}
                                />
                            </div>
                            <FieldItem label="" large>
                                <Controller
                                    control={control}
                                    rules={{ required: t('validations.preparer_agreement_required') }}
                                    name="terms_agreed_preparer"
                                    render={({ field: { onChange, value } }) => (
                                        <Checkbox
                                            checked={value}
                                            onChange={onChange}
                                            label={t('onBoarding.formI9.agree_electronicall_attest')}
                                            errorText={errors.terms_agreed_preparer ? errors.terms_agreed_preparer.message : ''}
                                        />
                                    )}
                                />
                            </FieldItem>
                        </SectionContainer>}
                </FormI9FieldsContainer>
            </FormI9ContentContainer>
        </ContentContainer>
    )
};

const ContentContainer = styled.div`
    flex: 1;
    padding-top: 60px;
    overflow-y: auto;
`;

export const FormI9ContentContainer = styled.div`
    display: flex;
    flex-direction: row;
    margin-top: 40px;
`;

export const FormI9FieldsContainer = styled.div`
    flex: 1;
    flex-direction: column;
`;

export const I9ExampleContainer = styled.div`
    cursor: pointer;
    margin-right: 30px;
    margin-top: 10px;
    & > img {
        display: block;
        max-height: auto;
        width: 266px;
        border: 1px solid #D6D6D6;
    };
    & > p {
        font-size: 12px;
        color: #00101A;
        margin-top: 14px;
        text-align: center;
        text-decoration: underline;
        cursor: pointer;
    };
`;

const LoadingScreenContainer = styled.div`
   display: flex;
   justify-content: center;
   align-items: center;
   flex: 1;
`;