import { useState, Fragment, useEffect } from "react";
import styled from "styled-components";
import { useQueryClient } from 'react-query';
import { useSelector } from "react-redux";
import { currentUserSelector, domainSelector } from "redux/selectors";
import { isEmpty, find } from "lodash";
import useQuery from "hooks/useQueryCustom";
import useMutationCustom from "hooks/useMutationCustom";
import { useForm, FormProvider } from "react-hook-form";
import { useToasts } from "react-toast-notifications";
import LoadingButton from '@mui/lab/LoadingButton';
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import Button from '@mui/material/Button';
import { useDimension } from "hooks/useWindowSize";
import { toDataURL, base64StringToFile } from "utils/common";
import Steps from "../../components/Steps";
import { deleteProfilePhoto, uploadProfilePhoto } from 'services';
import { useTranslation } from "react-i18next";
import {
    WelcomeStep,
    PersonalDetails,
    Success,
    Docs,
    AdditionalInfo,
    EmploymentEligibility,
    FormI9
} from "./StepsContent";

import { ReactComponent as ArrowIcon } from 'assets/svg/arrow.svg';
import { region } from "lib/Regionalize";

type TOnboardingWelcome = {
    id: number,
    fill_i9: boolean,
    first_day: {
        date?: string,
        location?: string
    } | null,
    step: number,
    updated_at: Date
};

type TPersonalDetailsArgs = {
    first_name: string,
    last_name: string,
    middle_name: string,
    preferred_name: string,
    other_last_name: string,
    birth_date: string,
    gender: string,
    marital_status: string,
    personal_number: string,
    remove_mask: boolean,
    ssn: string,
    employee_addresses: {
        country_id: number,
        address_type: string,
        address: string,
        address_details: string,
        city: string,
        region: string,
        state_id: number,
        postal_code: string
    }[],
    employee_contact_info: {
        mobile_phone: string,
        home_phone: string,
        personal_email: string,
        linkedin: string,
        facebook: string,
        twitter: string
    },
    continue?: boolean
};

type TEligibilityArgs = {
    continue: boolean,
    eligibility_type: string,
    uscis_number: string,
    expiration_date: string,
    authorization_document: string,
    i94_number: string,
    passport_number: string,
    country_id: number
};

function Onboarding() {
    const { t } = useTranslation();
    const { addToast } = useToasts();
    const [buttonPressed, setButtonPressed] = useState<string>('');
    const currentUser = useSelector(currentUserSelector);
    const domain = useSelector(domainSelector);
    const [avatarIsUploading, setAvatarIsUploading] = useState<boolean>(false);
    const queryClient = useQueryClient();
    const [activeStep, setActiveStep] = useState<number>(0);
    const [avatarPhoto, setAvatarPhoto] = useState<any>(currentUser.employee?.uuid ? { avatarFile: { preview: `${process.env.REACT_APP_BASE_API_URL}employee_photo/${domain}/${currentUser.employee?.uuid}?version=small` } } : null);
    const [avatarPreview, setAvatarPreview] = useState<any>(null);
    const dimension = useDimension();

    useEffect(() => {
        if (currentUser.employee?.uuid) {
            toDataURL(`${process.env.REACT_APP_BASE_API_URL}employee_photo/${domain}/${currentUser.employee?.uuid}?version=small`).then((res) => {
                const fileObj = base64StringToFile(res, 'avatar.png');
                setAvatarPreview(Object.assign(fileObj, {
                    preview: URL.createObjectURL(fileObj)
                }));
            });
        }
    }, [currentUser.employee?.uuid, domain]);

    useQuery<any>(["get_employee_photo_info"], {
        endpoint: `employee_photo/info?employee_id=${currentUser.employee?.id}`,
        options: { method: "get" },
        onSuccess: (data) => {
            if (data.photo_base64) {
                const fileObj = base64StringToFile(data.photo_base64, 'avatar.png');
                setAvatarPhoto((prev: any) => {
                    return {
                        ...prev, avatarFile: Object.assign(fileObj, {
                            preview: URL.createObjectURL(fileObj)
                        })
                    }
                });
                if (data.employee_avatar) {
                    const crop: any = {
                        unit: "%",
                        x: data.employee_avatar.crop_x,
                        y: data.employee_avatar.crop_y,
                        width: data.employee_avatar.crop_w,
                        height: data.employee_avatar.crop_h,
                    };
                    setAvatarPhoto((prev: any) => {
                        return { ...prev, completedCrop: crop }
                    });
                }
            }
        }
    }, { refetchOnWindowFocus: false });

    const personalDetailsMethods = useForm({
        defaultValues: {
            first_name: '',
            middle_name: '',
            last_name: '',
            personal_number: '',
            remove_mask: false,
            other_last_name: '',
            preferred_name: '',
            birth_date: '' as any,
            gender: '',
            marital_status: '',
            ssn: '',
            country_home: null,
            address_home: '',
            address_details_home: '',
            city_home: null,
            state_home: null,
            region_home: '',
            postal_code_home: '',
            addresses_are_same: false,
            country_mailing: null,
            address_mailing: '',
            address_details_mailing: '',
            city_mailing: '',
            state_mailing: null,
            region_mailing: '',
            postal_code_mailing: '',
            mobile_phone: '',
            home_phone: '',
            personal_email: '',
            linkedin: '',
            facebook: '',
            twitter: '',
        }
    });

    const eligibilityMethods = useForm({
        defaultValues: {
            eligibility_type: '',
            uscis_number: '',
            expiration_date: '' as any,
            authorization_document: '',
            i94_number: '',
            passport_number: '',
            country: null
        }
    });

    const i9FormMethods = useForm({
        defaultValues: {
            signature: { signature: null, type: 'draw' },
            terms_agreed: false,
            used_preparer: 'no',
            first_name: '',
            last_name: '',
            country: null,
            address: '',
            address_details: '',
            city: '',
            state: null,
            region: '',
            postal_code: '',
            signature_preparer: { signature: null, type: 'draw' },
            terms_agreed_preparer: false,
        }
    });

    const { mutate: finishWelcomeStep, isLoading: finishWelcomeStepLoading } = useMutationCustom<string[], {}, {}>(["onboarding_finish_welcome"], {
        endpoint: 'onboarding/welcome', options: { method: "post" },
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries(['onboarding_welcome']);
        },
    });

    const { mutate: finishPersonalStep, isLoading: finishPersonalStepLoading } = useMutationCustom<string[], {}, TPersonalDetailsArgs>(["onboarding_finish_personal"], {
        endpoint: 'onboarding/personal', options: { method: "post" },
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries(['onboarding_welcome']);
            queryClient.invalidateQueries(['get_employee_photo_info']);
            addToast(t('onBoarding.personal_details_have_been_saved'), { appearance: 'success', autoDismiss: true });
        },
        onError: (err: any) => {
            setButtonPressed('');
            const findPersonalNumber = find(err?.errors, (item: any) => { return item.field === 'personal_number'});

            if (err?.errors[0].field) {
                err.errors.forEach((item: any) => {
                    personalDetailsMethods.setError(item.field, { type: 'custom', message: item.message });
                });
                personalDetailsMethods.setFocus(err.errors[0].field);
            };
            addToast(
                <ToastContentContainer dangerouslySetInnerHTML={{ __html: findPersonalNumber ? findPersonalNumber.message : t('globaly.fix_Highlighted')}}/>, {
                appearance: 'error',
                autoDismiss: true,
                placement: 'top-center'
            });
        }
    });

    const { mutate: finishAdditionInfoStep, isLoading: finishAdditionalInfoStepLoading } = useMutationCustom<string[], {}, {}>(["onboarding_finish_additional_info"], {
        endpoint: 'onboarding/additional', options: { method: "post" },
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries(['onboarding_welcome']);
        },
    });

    const { mutate: finishDocsStep, isLoading: finishDocsStepLoading } = useMutationCustom<string[], {}, {}>(["onboarding_finish_docs"], {
        endpoint: 'onboarding/documents', options: { method: "post" },
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries(['onboarding_welcome']);
        },
    });

    const { mutate: finishEligibilityStep, isLoading: finishEligibilityStepLoading } = useMutationCustom<string[], {}, TEligibilityArgs>(["onboarding_finish_eligibility"], {
        endpoint: 'onboarding/eligibility', options: { method: "post" },
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries(['onboarding_welcome']);
            addToast(t('onBoarding.employment_eligibility_saved'), { appearance: 'success', autoDismiss: true });
        },
        onError: (err: any) => {
            setButtonPressed('');
            if (err?.errors[0].field) {
                err.errors.forEach((item: any) => {
                    eligibilityMethods.setError(item.field, { type: 'custom', message: item.message });
                });
            }
            eligibilityMethods.setFocus(err.errors[0].field);
            addToast(
                <ToastContentContainer dangerouslySetInnerHTML={{ __html: t('globaly.fix_Highlighted')}}/>, {
                appearance: 'error',
                autoDismiss: true,
                placement: 'top-center'
            });
        }
    });

    const { mutate: finishI9FormStep, isLoading: finishI9FormStepLoading } = useMutationCustom<string[], {}, any>(["onboarding_finish_i9form"], {
        endpoint: 'onboarding/i9', options: { method: "post", headers: { 'Content-Type': 'multipart/form-data' }, timeout: 30000 },
    }, {
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['onboarding_welcome']);
            addToast(variables.get('continue') === 'true' ? t('onBoarding.form_has_been_signed') : t('onBoarding.your_changes_have_been_saved'), {
                appearance: 'success',
                autoDismiss: true
            });
        },
        onError: (err: any) => {
            setButtonPressed('');
            if (err?.errors[0].field) {
                err.errors.forEach((item: any) => {
                    i9FormMethods.setError(item.field, { type: 'custom', message: item.message });
                });
            }
            i9FormMethods.setFocus(err.errors[0].field);
            addToast(
                <ToastContentContainer dangerouslySetInnerHTML={{ __html: t('globaly.fix_Highlighted')}}/>, {
                appearance: 'error',
                autoDismiss: true,
                placement: 'top-center'
            });
        }
    });

    const { data, isLoading } = useQuery<string[], {}, TOnboardingWelcome>(["onboarding_welcome"], {
        endpoint: 'onboarding',
        options: { method: "get" },
        onSuccess: (data) => { setButtonPressed(''); setActiveStep(data.step); }
    }, { refetchOnWindowFocus: false });

    const onSubmitPersonalDetails = async (data: any, nextStep: boolean) => {
        if (isEmpty(avatarPhoto) && !avatarPreview) {
            setAvatarIsUploading(true);
            await deleteProfilePhoto(currentUser.employee?.id)
            setAvatarIsUploading(false);
        };
        if (!isEmpty(avatarPhoto) && avatarPreview) {
            setAvatarIsUploading(true);
            let formData: any = new FormData();

            formData.append('employee_id', currentUser.employee?.id as unknown as string);
            formData.append('crop_x', avatarPhoto.completedCrop?.x as unknown as string);
            formData.append('crop_y', avatarPhoto.completedCrop?.y as unknown as string);
            formData.append('crop_w', avatarPhoto.completedCrop?.width as unknown as string);
            formData.append('crop_h', avatarPhoto.completedCrop?.height as unknown as string);
            formData.append('photo', avatarPhoto.avatarFile);

            try {
                await uploadProfilePhoto(formData);
                setAvatarIsUploading(false);
            } catch (err: any) {
                setButtonPressed('');
                setAvatarIsUploading(false);
                if (err?.response?.data?.errors?.[0].message) {
                    return addToast(<ToastContentContainer>
                        <b>{t('onBoarding.error_uploading_file')}</b>{err.response.data.errors[0].message}
                    </ToastContentContainer>, { appearance: 'error', autoDismiss: true });
                } else {
                    return addToast(t('onBoarding.something_went_wrong'), { appearance: 'error', autoDismiss: true });
                }
            }
        };

        let homeAddress = {
            country_id: data.country_home?.id ?? null,
            address_type: 'home_address',
            address: data.address_home,
            address_details: data.address_details_home,
            city: data.city_home,
            region: data.region_home,
            state_id: data.state_home?.id ?? null,
            postal_code: data.postal_code_home
        };

        let mailingAddress = {
            country_id: data.country_mailing?.id ?? null,
            address_type: 'mailing_address',
            address: data.address_mailing,
            address_details: data.address_details_mailing,
            city: data.city_mailing,
            region: data.region_mailing,
            state_id: data.state_mailing?.id ?? null,
            postal_code: data.postal_code_mailing,
            _destroy: !data.addresses_are_same && !data.country_mailing?.id
        };

        let employee_addresses = data.addresses_are_same ? [homeAddress, { ...homeAddress, address_type: 'mailing_address' }] : [homeAddress, mailingAddress];

        let formData = {
            first_name: data.first_name,
            last_name: data.last_name,
            personal_number: data.personal_number,
            remove_mask: data.remove_mask,
            middle_name: data.middle_name,
            preferred_name: data.preferred_name,
            other_last_name: data.other_last_name,
            birth_date: data.birth_date,
            gender: data.gender,
            marital_status: data.marital_status,
            ssn: region(['eng']) ? data.ssn.replaceAll('-', '') : '',
            employee_addresses: employee_addresses,
            employee_contact_info: {
                mobile_phone: data.mobile_phone,
                home_phone: data.home_phone,
                personal_email: data.personal_email,
                linkedin: data.linkedin,
                facebook: data.facebook,
                twitter: data.twitter
            }
        };

        finishPersonalStep({ ...formData, continue: nextStep });
    };

    const onSubmitEligibility = (data: any, nextStep: boolean) => {
        let formData = {
            eligibility_type: data.eligibility_type,
            uscis_number: data.uscis_number,
            expiration_date: data.expiration_date,
            authorization_document: data.authorization_document,
            i94_number: data.i94_number,
            passport_number: data.passport_number,
            country_id: data.country?.id ?? null
        };

        finishEligibilityStep({ ...formData, continue: nextStep });
    };

    const onSubmitI9Form = (data: any, nextStep: boolean) => {
        let formData = new FormData();

        let formI9Data = {
            terms_agreed: data.terms_agreed,
            used_preparer: data.used_preparer,
        };
        let signature = { signature: data.signature.signature, type: data.signature.type };
        let signature_preparer = { signature: data.signature_preparer?.signature, type: data.signature_preparer?.type };
        let i9_preparer_attributes = {
            first_name: data.first_name,
            last_name: data.last_name,
            country_id: data.country?.id ?? null,
            address: data.address,
            address_details: data.address_details,
            city: data.city,
            region: data.region,
            state_id: data.state?.id ?? null,
            postal_code: data.postal_code,
            terms_agreed_preparer: data.terms_agreed_preparer,
        };

        formData.append('terms_agreed', formI9Data.terms_agreed);
        formData.append('used_preparer', formI9Data.used_preparer === 'yes' ? 'true' : 'false');
        if (signature.signature?.[0] instanceof File) {
            formData.append("signature[signature]", signature.signature[0]);
        };
        if (typeof signature.signature === 'string' && signature.type !== 'upload') {
            formData.append("signature[signature]", signature.signature);
        };
        formData.append("signature[type]", signature.type);
        formData.append("i9_preparer_attributes[first_name]", i9_preparer_attributes.first_name);
        formData.append("i9_preparer_attributes[last_name]", i9_preparer_attributes.last_name);
        formData.append("i9_preparer_attributes[country_id]", i9_preparer_attributes.country_id);
        formData.append("i9_preparer_attributes[address]", i9_preparer_attributes.address);
        formData.append("i9_preparer_attributes[address_details]", i9_preparer_attributes.address_details);
        formData.append("i9_preparer_attributes[city]", i9_preparer_attributes.city);
        formData.append("i9_preparer_attributes[region]", i9_preparer_attributes.region);
        formData.append("i9_preparer_attributes[state_id]", i9_preparer_attributes.state_id);
        formData.append("i9_preparer_attributes[postal_code]", i9_preparer_attributes.postal_code);
        formData.append("i9_preparer_attributes[terms_agreed]", i9_preparer_attributes.terms_agreed_preparer);
        if (signature_preparer.signature?.[0] instanceof File) {
            formData.append("i9_preparer_attributes[signature][signature]", signature_preparer.signature?.[0]);
        };
        if (typeof signature_preparer.signature === 'string' && signature_preparer.type !== 'upload') {
            formData.append("i9_preparer_attributes[signature][signature]", signature_preparer.signature);
        };
        formData.append("i9_preparer_attributes[signature][type]", signature_preparer.type);
        formData.append("continue", nextStep ? 'true' : 'false');

        finishI9FormStep(formData);
    };

    const personalDetailsRequires = () => {
        let requiredFields: string[] = [];
        const { watch } = personalDetailsMethods;

        !watch('first_name') && requiredFields.push(t('employee.first_name'));
        !watch('last_name') && requiredFields.push(t('employee.last_name'));
        !watch('birth_date') && requiredFields.push(t('employee.birth_date'));
        
        if (!watch('remove_mask')) {
            watch('personal_number')?.length < 11 && requiredFields.push(t('employee.personal_number'));
        }

        if (watch('remove_mask')){
            !watch('personal_number') && requiredFields.push(t('employee.personal_number'));
        }
        
        if (region('eng')) {
            (!watch('ssn') || watch('ssn').length < 9) && requiredFields.push(t('employee.ssn'));
        }
        !watch('country_home') && requiredFields.push(t('employee.address.country'));
        !watch('address_home') && requiredFields.push(t('employee.address.address_line_one'));
        !watch('city_home') && requiredFields.push(t('employee.address.city'));
        (!watch('state_home') && !watch('region_home')) && requiredFields.push(t('employee.address.state_province_region'));
        !watch('postal_code_home') && requiredFields.push(t('employee.address.postal_code'));
        !watch('personal_email') && requiredFields.push(t('employee.contact.personal_email'));
        (watch('address_mailing') || watch('address_details_mailing') ||
            watch('city_mailing') || watch('state_mailing') || watch('postal_code_mailing')) && !watch('country_mailing')
            && requiredFields.push(t('employee.address.mailing_country'));

        return requiredFields;
    };

    const employmentEligibilityRequires = () => {
        let requiredFields: string[] = [];
        const { watch } = eligibilityMethods;

        !watch('eligibility_type') && requiredFields.push(t('onBoarding.employment_eligibility'));

        let eligibilityTypes: any = queryClient.getQueryData(['enum_eligibility_types']);
        let eligibleType = eligibilityTypes?.list.find((e: any) => e.id === watch('eligibility_type'))?.id_name;
        if (eligibleType === 'citizen' || eligibleType === 'noncitizen') {
            return [];
        };

        if (eligibleType === 'resident') {
            !watch('uscis_number') && requiredFields.push(t('onBoarding.uscis_registration_number'));
        };

        if (eligibleType === 'authorized') {
            !watch('expiration_date') && requiredFields.push(t('onBoarding.authorized_work_until'));
            !watch('authorization_document') && requiredFields.push(t('onBoarding.authorization_documentation'));
        };

        let authorizationTypes: any = queryClient.getQueryData(['enum_authorization_docs']);
        let authDocType = authorizationTypes?.list.find((e: any) => e.id === watch('authorization_document'))?.id;

        if (authDocType === 'uscis_number') {
            !watch('uscis_number') && requiredFields.push(t('onBoarding.uscis_registration_number'));
        };

        if (authDocType === 'i94') {
            (!watch('i94_number') || watch('i94_number').length < 11) && requiredFields.push(t('onBoarding.form_admission_number'));
        };

        if (authDocType === 'passport') {
            !watch('passport_number') && requiredFields.push(t('onBoarding.foreign_passport_number'));
            !watch('country') && requiredFields.push(t('onBoarding.country_issuance'));
        };

        return requiredFields;
    };

    const i9FormRequires = () => {
        let requiredFields: string[] = [];
        const { watch } = i9FormMethods;

        (!watch('signature')?.signature || !watch('signature')?.signature?.[0]) && requiredFields.push(t('onBoarding.your_signature'));
        !watch('terms_agreed') && requiredFields.push(t('onBoarding.your_agree'));
        if (watch('used_preparer') === 'yes') {
            !watch('first_name') && requiredFields.push(t('onBoarding.preparer_first_name'));
            !watch('last_name') && requiredFields.push(t('onBoarding.preparer_last_name'));
            !watch('country') && requiredFields.push(t('onBoarding.preparer_country'));
            !watch('address') && requiredFields.push(t('onBoarding.preparer_address'));
            !watch('city') && requiredFields.push(t('onBoarding.preparer_city'));
            (!watch('state') && !watch('region')) && requiredFields.push(t('onBoarding.preparer_state'));
            !watch('postal_code') && requiredFields.push(t('onBoarding.preparer_postal_code'));
            (!watch('signature_preparer')?.signature || !watch('signature_preparer')?.signature?.[0]) && requiredFields.push(t('onBoarding.preparer_signature'));
            !watch('terms_agreed_preparer') && requiredFields.push(t('onBoarding.prepare_agree'));
        };

        return requiredFields;
    };

    const renderTooltip = (activeStep: number) => {
        return (
            <Fragment>
                {t('onBoarding.please_fill_the_information')}
                <RequiredFieldsContainer>
                    {activeStep === 2 && personalDetailsRequires().map((item: any) => <li key={item}>{item}</li>)}
                    {activeStep === 5 && employmentEligibilityRequires().map((item: any) => <li key={item}>{item}</li>)}
                    {activeStep === 6 && i9FormRequires().map((item: any) => <li key={item}>{item}</li>)}
                </RequiredFieldsContainer>
            </Fragment>
        )
    };

    const onClickSave = () => {
        setButtonPressed('save');
        if (activeStep === 2) personalDetailsMethods.handleSubmit((data) => onSubmitPersonalDetails(data, false))();
        if (activeStep === 5) eligibilityMethods.handleSubmit((data) => onSubmitEligibility(data, false))();
        if (activeStep === 6) i9FormMethods.handleSubmit((data) => onSubmitI9Form(data, false))();
    };

    const onClickSaveContinue = () => {
        setButtonPressed('continue');
        if (activeStep === 1) finishWelcomeStep({ continue: true });
        if (activeStep === 2) personalDetailsMethods.handleSubmit((data) => onSubmitPersonalDetails(data, true))();
        if (activeStep === 3) finishAdditionInfoStep({ continue: true });
        if (activeStep === 4) finishDocsStep({ continue: true });
        if (activeStep === 5) eligibilityMethods.handleSubmit((data) => onSubmitEligibility(data, true))();
        if (activeStep === 6) i9FormMethods.handleSubmit((data) => onSubmitI9Form(data, true))();
    };

    const onAvatarSelect = (obj: {
        avatarFile?: File,
        employeeId?: number,
        completedCrop?: any,
        previewImageBase64?: string
    }) => {
        if (obj.previewImageBase64) {
            const fileObj = base64StringToFile(obj.previewImageBase64, 'avatar');
            setAvatarPreview(Object.assign(fileObj, {
                preview: URL.createObjectURL(fileObj)
            }))
        } else setAvatarPreview(null);
        setAvatarPhoto(obj);
    };

    const steps = !data?.fill_i9 ? [
        { label: t('onBoarding.welcome'), title: 1, step: 1, },
        { label: t('onBoarding.personal_details'), title: 2, step: 2, },
        { label: t('onBoarding.additional_information'), title: 3, step: 3, },
        { label: t('onBoarding.documents'), title: 4, step: 4, },
    ] : [
        { label: t('onBoarding.welcome'), title: 1, step: 1, },
        { label: t('onBoarding.personal_details'), title: 2, step: 2, },
        { label: t('onBoarding.additional_information'), title: 3, step: 3, },
        { label: t('onBoarding.documents'), title: 4, step: 4, },
        { label: t('onBoarding.employment_eligibility'), title: 5, step: 5, },
        { label: t('onBoarding.form_signature'), title: 6, step: 6, },
    ];

    const isActionButtonDisabled = (personalDetailsRequires().length > 0 && activeStep === 2)
        || (employmentEligibilityRequires().length > 0 && activeStep === 5) || (i9FormRequires().length > 0 && activeStep === 6);
    const saveButtonIsLoading = buttonPressed === 'save' && (finishPersonalStepLoading || finishEligibilityStepLoading || finishI9FormStepLoading || avatarIsUploading);
    const continueAndSaveButtonIsLoading = buttonPressed === 'continue' && (finishWelcomeStepLoading ||
        finishPersonalStepLoading ||
        finishAdditionalInfoStepLoading ||
        avatarIsUploading ||
        finishDocsStepLoading ||
        finishEligibilityStepLoading ||
        finishI9FormStepLoading);

    const saveButtonIsVisible = activeStep > 1 && activeStep !== 3 && activeStep !== 4;

    const renderSaveAndContinueButtonText = (activeStep: number) => {
        if (activeStep === 1) {
            return t('onBoarding.continue');
        };
        if (activeStep === 6) {
            return t('onBoarding.sign_document_confirm');
        };
        return t('onBoarding.save_continue')
    };

    if (isLoading) return <LoadingScreenContainer><CircularProgress thickness={4} /></LoadingScreenContainer>;

    return (
        <PageContainer>
            {activeStep > steps.length ? <Success /> :
                <Fragment>
                    <div style={{ display: 'flex', height: dimension.height - 195, overflowY: 'auto', overflowX: 'hidden' }}>
                        <StepsContainer>
                            <Steps
                                items={steps}
                                activeStep={activeStep}
                            />
                        </StepsContainer>
                        <StepsContentContainer>
                            {activeStep === 1 && <WelcomeStep
                                fillI9={data!.fill_i9}
                                firstDay={data!.first_day}
                            />}
                            {activeStep === 2 &&
                                <FormProvider {...personalDetailsMethods}>
                                    <PersonalDetails
                                        fillI9={data!.fill_i9}
                                        updatedAt={data!.updated_at}
                                        onAvatarSelect={onAvatarSelect}
                                        avatarPhoto={avatarPhoto}
                                        avatarPreview={avatarPreview}
                                    />
                                </FormProvider>
                            }
                            {activeStep === 3 && <AdditionalInfo updatedAt={data!.updated_at} onBlockSave={finishAdditionInfoStep} />}
                            {activeStep === 4 && <Docs updatedAt={data!.updated_at} />}
                            {activeStep === 5 &&
                                <FormProvider {...eligibilityMethods}>
                                    <EmploymentEligibility updatedAt={data!.updated_at} />
                                </FormProvider>
                            }
                            {activeStep === 6 &&
                                <FormProvider {...i9FormMethods}>
                                    <FormI9 updatedAt={data!.updated_at} />
                                </FormProvider>
                            }
                        </StepsContentContainer>
                    </div>
                    <BottomActionsContainer>
                        {activeStep > 1 && <Button
                            size='large'
                            sx={{ marginRight: 1, width: 150 }}
                            startIcon={<StyledArrowIcon direction="left" fill="#339966" />}
                            onClick={() => setActiveStep(e => e - 1)}
                            disabled={saveButtonIsLoading || continueAndSaveButtonIsLoading}
                        >
                            {t('onBoarding.previous_step')}
                        </Button>}
                        {saveButtonIsVisible && <Tooltip title={isActionButtonDisabled ? renderTooltip(activeStep) : ''} placement="top" arrow><div>
                            <LoadingButton
                                variant='contained'
                                size='large'
                                sx={{ marginRight: 1, width: 150 }}
                                onClick={onClickSave}
                                disabled={buttonPressed === 'continue' || isActionButtonDisabled}
                                loading={saveButtonIsLoading}
                            >
                                {t('globaly.save')}
                            </LoadingButton>
                        </div></Tooltip>}
                        <Tooltip title={isActionButtonDisabled ? renderTooltip(activeStep) : ''} placement="top" arrow><div>
                            <LoadingButton
                                variant='contained'
                                size='large'
                                sx={{ width: activeStep === 6 ? 250 : 220 }}
                                endIcon={<StyledArrowIcon direction="right" fill={isActionButtonDisabled ? "#8D8D8D" : "#FFF"} />}
                                onClick={onClickSaveContinue}
                                disabled={buttonPressed === 'save' || isActionButtonDisabled}
                                loading={continueAndSaveButtonIsLoading}
                            >
                                {renderSaveAndContinueButtonText(activeStep)}
                            </LoadingButton>
                        </div></Tooltip>
                    </BottomActionsContainer>
                </Fragment>}
        </PageContainer >
    )
};

export default Onboarding;

export const PageContainer = styled.div`
    display: flex;
    flex-flow: column;
`;

export const StepsContainer = styled.div`
    padding: 55px 90px 55px 65px;
`;

export const StepsContentContainer = styled.div`
    display: flex;
    flex: 1;
`;

export const LoadingScreenContainer = styled.div`
   display: flex;
   justify-content: center;
   align-items: center;
   flex: 1;
`;

export const BottomActionsContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #FFF;
    height: 70px;
    margin: 0 60px;
    border-top: 1px solid #F2F2F4;
`;

export const RequiredFieldsContainer = styled.ul`
    list-style-type: circle;
    padding-left: 20px;
`;

export const ToastContentContainer = styled.div`
    & > b {
        font-family: 'Aspira Demi', 'FiraGO Regular';
    }
`;

export const StyledArrowIcon = styled(ArrowIcon) <{ direction: string }>`
    transform: ${({ direction }) => direction === 'right' ? 'rotate(-90deg)' : 'rotate(90deg)'};
    & path {
        fill: ${({ fill }) => fill}
    }
`;