import styled from "styled-components";
import { useParams } from "react-router-dom";
import useQueryCustom from "hooks/useQueryCustom";
import { Controller, useFormContext } from "react-hook-form";
import { useSelector } from "react-redux";
import { currentUserSelector } from "redux/selectors";
import UniversalInput from "components/Input/UniversalInput";
import SelectWithLocationAdd from "components/Dropdowns/SelectWithLocationAdd";
import Checkbox from "components/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import SignatureTypes from "../../SignatureComponent";
import { createLocation, getLocations } from "services";
import { toDataURL } from "utils/common";

import { StepTitle } from "../../StepsContent/Welcome";
import { FormI9ContentContainer, I9ExampleContainer, FormI9FieldsContainer } from "../../StepsContent/FormI9";
import { FieldItem } from "./DocumentInformation";
import i9Example from 'assets/img/i-9_example.png';
import { useTranslation } from "react-i18next";

export default function FormI9() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const { company } = useSelector(currentUserSelector);
    const { register, control, setValue, formState: { errors } } = useFormContext();

    const { isLoading } = useQueryCustom<any>(["get_onboarding_admin_i9"], {
        endpoint: `onboarding/admin/i9?employee_id=${id}`,
        options: { method: "get" },
        onSuccess: (data) => {
            if (data.i9) {
                setValue('job_title', data.i9.job_title);
                setValue('location', data.i9.location);
                setValue('terms_agreed', data.i9.terms_agreed);
            };
            if (data.signature.type === 'text') {
                setValue('signature', { signature: data.signature.signature, type: data.signature.type });
            };

            const signature_img = data?.signature.uuid ? `${process.env.REACT_APP_BASE_API_URL}document/signature/${company.id}/${data?.signature.uuid}` : null;
            if (signature_img && data.signature.type === 'draw') {
                toDataURL(signature_img).then(dataUrl => {
                    setValue('signature', { signature: dataUrl, type: data.signature.type, })
                });
            };
            if (signature_img && data.signature.type === 'upload') {
                setValue('signature', { signature: signature_img, type: data.signature.type, })
            };
        }
    }, { refetchOnWindowFocus: false });

    const { refetch: getI9Preview, isFetching: previewI9Loading } = useQueryCustom<any>(["get_onboarding_admin_i9_preview"], {
        endpoint: `/onboarding/admin/i9_preview?employee_id=${id}`,
        options: { method: "get", responseType: 'arraybuffer', timeout: 30000 },
        onSuccess: (data) => {
            let blob = new Blob([data], { type: 'application/pdf' });
            let url = URL.createObjectURL(blob);
            window.open(url);
        },
    }, { enabled: false });

    if (isLoading) return <LoadingScreenContainer><CircularProgress thickness={4} /></LoadingScreenContainer>;

    return (
        <ContentContainer>
            <StepTitle>{t('onBoarding.formI9.sign_form_i9')}</StepTitle>
            <FormI9ContentContainer>
                <I9ExampleContainer onClick={() => getI9Preview()}>
                    <img src={i9Example} alt="i-9 example" />
                    <p>{t('onBoarding.formI9.review_document')}</p>
                    {previewI9Loading ? <LinearProgress /> : null}
                </I9ExampleContainer>
                <FormI9FieldsContainer>
                    <FieldItem label={t('onBoarding.onboardingReview.your_title')} required style={{ maxWidth: 600 }}>
                        <UniversalInput
                            {...register('job_title', { required: t('validations.your_title_required') })}
                            errorText={errors.job_title?.message}
                        />
                    </FieldItem>
                    <FieldItem label={t('onBoarding.formI9.business_organization_address')} required style={{ maxWidth: 600 }}>
                        <Controller
                            name="location"
                            control={control}
                            rules={{ required: t('validations.business_organization_required') }}
                            render={({ field: { value, onChange } }) => (
                                <SelectWithLocationAdd
                                    name='location'
                                    inputValue={value}
                                    loadRemoteData={() => getLocations(100, 1, false, false)}
                                    createRequest={createLocation}
                                    onChange={onChange}
                                    errorText={errors.location?.message}
                                />
                            )}
                        />
                    </FieldItem>
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
                                    helperText={errors.signature?.message as string}
                                    isErrorText
                                />
                            )}
                        />
                    </div>
                    <FieldItem label="" required style={{ maxWidth: 600 }}>
                        <Controller
                            control={control}
                            rules={{ required: t('validations.agreement_required') }}
                            name="terms_agreed"
                            render={({ field: { onChange, value } }) => (
                                <Checkbox
                                    checked={value}
                                    onChange={onChange}
                                    label={t('onBoarding.formI9.electronically')}
                                    errorText={errors.terms_agreed?.message}
                                />
                            )}
                        />
                    </FieldItem>
                </FormI9FieldsContainer>
            </FormI9ContentContainer>
        </ContentContainer>
    )
};

const ContentContainer = styled.div`
    overflow-y: auto;
    flex: 1;
    padding-top: 60px;
`;

const LoadingScreenContainer = styled.div`
   display: flex;
   justify-content: center;
   align-items: center;
   flex: 1;
`;