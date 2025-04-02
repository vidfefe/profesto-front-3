import { Fragment, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { useQueryClient } from "react-query";
import useQueryCustom from "hooks/useQueryCustom";
import useMutationCustom from "hooks/useMutationCustom";
import { useToasts } from "react-toast-notifications";
import { useDispatch } from "react-redux";
import { setActiveTab } from "redux/personSlice";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import CircularProgress from "@mui/material/CircularProgress";
import { PageHeaderTitle } from "components/DesignUIComponents";
import Tooltip from "@mui/material/Tooltip";
import Steps from "../../../components/Steps";
import { useDimension } from "hooks/useWindowSize";
import { useTranslation } from "react-i18next";
import {
    LoadingScreenContainer,
    PageContainer,
    StepsContainer,
    StepsContentContainer,
    BottomActionsContainer,
    StyledArrowIcon,
    RequiredFieldsContainer
} from "..";

import { DocumentInformation, EligibilityDocuments, FormI9 } from './StepsContent';

type TOnboardingWelcome = {
    id: number,
    email: string,
    fill_i9: boolean,
    onboarding_status: {
        id: "in_progress" | "filled" | "i9_to_sign" | "finished",
        name: string
    },
    first_day: {
        date?: string,
        location?: string
    } | null,
    role: {
        id: number,
        name: string
    },
    step: number,
    updated_at: Date
};

export default function OnboardingReview() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { addToast } = useToasts();
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch();
    const history = useHistory();
    const dimension = useDimension();
    const [activeStep, setActiveStep] = useState<number>(0);
    const [docInfoRequiredFields, setDocInfoRequiredFields] = useState<string[]>([]);

    const { isLoading: onboardingDataLoading } = useQueryCustom<string[], {}, TOnboardingWelcome>(["get_onboarding_admin"], {
        endpoint: `onboarding/admin?employee_id=${id}`,
        options: { method: "get" },
    }, {
        onSuccess: (data) => data?.onboarding_status.id !== 'i9_to_sign' ? history.replace('/') : setActiveStep(data.step),
        onError: () => history.replace('/'),
        refetchOnWindowFocus: false
    });

    const { data: employeeData, isLoading: infoDataLoading } = useQueryCustom<any>(["employee_info"], {
        endpoint: `employee/${id}`,
        options: { method: "get" },
    }, { refetchOnWindowFocus: false });

    const { mutate: finishEligibilityStep, isLoading: finishEligibilityStepLoading } = useMutationCustom<string[], {}, {}>(["onboarding_admin_finish_eligibility"], {
        endpoint: 'onboarding/admin/documents', options: { method: "post" },
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries(['get_onboarding_admin']);
            addToast(t('onBoarding.onboardingReview.information_saved'), { appearance: 'success', autoDismiss: true });
        },
        onError: () => {
            addToast(t('onBoarding.onboardingReview.errors_with_your_form'), {
                appearance: 'error',
                autoDismiss: true,
                placement: 'top-center'
            });
        }
    });

    const { mutate: finishDocumentInfoStep, isLoading: finishDocumentInfoStepLoading } = useMutationCustom<string[], {}, {}>(["onboarding_admin_finish_document_info"], {
        endpoint: 'onboarding/admin/fill_documents', options: { method: "post" },
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries(['get_onboarding_admin']);
            addToast(t('onBoarding.onboardingReview.information_saved'), { appearance: 'success', autoDismiss: true });
        },
        onError: () => {
            addToast(t('onBoarding.onboardingReview.errors_with_your_form'), {
                appearance: 'error',
                autoDismiss: true,
                placement: 'top-center'
            });
        }
    });

    const { mutate: finishI9Step, isLoading: finishI9StepLoading } = useMutationCustom<string[], {}, {}>(["onboarding_admin_finish_i9"], {
        endpoint: 'onboarding/admin/i9', options: { method: "post", headers: { 'Content-Type': 'multipart/form-data' }, timeout: 30000 },
    }, {
        onSuccess: () => {
            dispatch(setActiveTab(2));
            queryClient.invalidateQueries(['get_onboarding_admin']);
            addToast(`${t('onBoarding.onboardingReview.successfully_signed', {firstName: employeeData?.first_name})}`, { appearance: 'success', autoDismiss: true });
            history.replace(`/employee/${id}`)
        },
        onError: () => {
            addToast(t('onBoarding.onboardingReview.errors_with_your_form'), {
                appearance: 'error',
                autoDismiss: true,
                placement: 'top-center'
            });
        }
    });

    const eligibilityDocFormMethods = useForm({
        defaultValues: {
            class_a: '',
            class_b: '',
            class_c: '',
        }
    });

    const docInformationFormMethods = useForm({
        defaultValues: {
            doc_title: '',
            issuing_authority: '',
            doc_number: '',
            expiration_date: '',
            sevp: false,
            sevp_doc_title: '',
            sevp_issuing_authority: '',
            sevp_doc_number: '',
            sevp_expiration_date: '',
            secondary_doc_title: '',
            secondary_issuing_authority: '',
            secondary_doc_number: '',
            secondary_expiration_date: '',
        }
    });

    const i9FormMethods = useForm({
        defaultValues: {
            job_title: '',
            location: null,
            signature: { signature: null, type: 'draw' },
            terms_agreed: false
        }
    });

    const onSubmitEligibilityDocs = (data: any) => {
        let formData = {
            employee_id: id,
            class_a_id: data.class_a,
            class_b_id: data.class_b,
            class_c_id: data.class_c,
            continue: true
        };

        finishEligibilityStep(formData);
    };

    const onSubmitDocInformation = (data: any) => {
        let sevp = !!data.sevp_issuing_authority || !!data.sevp_doc_number;
        let formData = {
            employee_id: id,
            continue: true,
            ...data,
            sevp,
        }
        finishDocumentInfoStep(formData);
    };

    const onSubmitI9 = (data: any) => {
        let formData = new FormData();

        let formI9Data = {
            employee_id: id,
            job_title: data.job_title,
            location_id: data.location?.id ?? null,
            terms_agreed: data.terms_agreed,
        };
        let signature = { signature: data.signature.signature, type: data.signature.type };

        formData.append('employee_id', formI9Data.employee_id);
        formData.append('job_title', formI9Data.job_title);
        formData.append('location_id', formI9Data.location_id);
        formData.append('terms_agreed', formI9Data.terms_agreed);
        if (signature.signature?.[0] instanceof File) {
            formData.append("signature[signature]", signature.signature[0]);
        };
        if (typeof signature.signature === 'string' && signature.type !== 'upload') {
            formData.append("signature[signature]", signature.signature);
        };
        formData.append("signature[type]", signature.type);
        formData.append("continue", 'true');

        finishI9Step(formData)
    };

    const onClickSaveContinue = () => {
        if (activeStep === 1) eligibilityDocFormMethods.handleSubmit(data => onSubmitEligibilityDocs(data))();
        if (activeStep === 2) docInformationFormMethods.handleSubmit(data => onSubmitDocInformation(data))();
        if (activeStep === 3) i9FormMethods.handleSubmit(data => onSubmitI9(data))();
    };

    const onClickPreviousButton = () => {
        if (activeStep === 2) {
            setActiveStep(e => e - 1);
            docInformationFormMethods.reset();
        } else setActiveStep(e => e - 1);
    };

    const documentInformationRequires = () => {
        let fields: string[] = [];
        const { watch } = docInformationFormMethods;

        docInfoRequiredFields?.forEach((e: any) => {
            if (!watch(e)) {
                if (e === 'doc_title' || (watch('sevp') && e === 'sevp_doc_title') || e === 'secondary_doc_title') {
                    fields.push(t('onBoarding.onboardingReview.document_title'));
                };
                if (e === 'issuing_authority' || (watch('sevp') && e === 'sevp_issuing_authority') || e === 'secondary_issuing_authority') {
                    fields.push(t('onBoarding.onboardingReview.document_authority'));
                };
                if (e === 'doc_number' || (watch('sevp') && e === 'sevp_doc_number') || e === 'secondary_doc_number') {
                    fields.push(t('onBoarding.onboardingReview.document_number'));
                };
            };
        });

        return Array.from(new Set(fields));
    };

    const i9Requires = () => {
        let fields: string[] = [];
        const { watch } = i9FormMethods;

        !watch('job_title') && fields.push(t('onBoarding.onboardingReview.your_title'));
        !watch('location') && fields.push(t('onBoarding.onboardingReview.organization_address'));
        (!watch('signature')?.signature || !watch('signature')?.signature?.[0]) && fields.push(t('onBoarding.onboardingReview.your_signature'));
        !watch('terms_agreed') && fields.push(t('onBoarding.onboardingReview.your_agreement'));

        return fields;
    };

    const renderTooltip = (activeStep: number) => {
        if (activeStep === 1) {
            return t('onBoarding.onboardingReview.authorization_documents');
        };
        if (activeStep !== 1) {
            return <Fragment>
                {t('onBoarding.onboardingReview.please_fill')}
                <RequiredFieldsContainer>
                    {activeStep === 2 && documentInformationRequires().map((item: any) => <li key={item}>{item}</li>)}
                    {activeStep === 3 && i9Requires().map((item: any) => <li key={item}>{item}</li>)}
                </RequiredFieldsContainer>
            </Fragment>
        };
        return "";
    };

    const renderSaveAndContinueButtonText = (activeStep: number) => {
        if (activeStep === 1) {
            return t('onBoarding.save_continue');
        };
        if (activeStep === 2) {
            return t('onBoarding.save_continue');
        };
        if (activeStep === 3) {
            return t('onBoarding.sign_document_confirm');
        };
        return t('onBoarding.save_continue')
    };

    const steps = [
        { label: t('onBoarding.onboardingReview.select_eligibility_documents'), title: 1, step: 1, },
        { label: t('onBoarding.onboardingReview.enter_information'), title: 2, step: 2, },
        { label: t('onBoarding.onboardingReview.form_signature'), title: 3, step: 3, },
    ];

    const isActionButtonDisabled = (activeStep === 1 && !(eligibilityDocFormMethods.watch('class_a') ||
        (eligibilityDocFormMethods.watch('class_b') && eligibilityDocFormMethods.watch('class_c')))) ||
        (activeStep === 2 && documentInformationRequires().length > 0) || (activeStep === 3 && i9Requires().length > 0);
    const isActionButtonLoading = finishEligibilityStepLoading || finishDocumentInfoStepLoading || finishI9StepLoading;

    if (onboardingDataLoading || infoDataLoading) return <LoadingScreenContainer><CircularProgress thickness={4} /></LoadingScreenContainer>;

    return (
        <PageContainer>
            <PageHeaderTitle title={`${t('onBoarding.onboardingReview.review_complete', {firstName: employeeData?.first_name})}`} />
            <div style={{ display: 'flex', height: dimension.height - 265, overflowY: 'auto', overflowX: 'hidden' }}>
                <StepsContainer>
                    <Steps
                        items={steps}
                        activeStep={activeStep}
                    />
                </StepsContainer>
                <StepsContentContainer>
                    {activeStep === 1 && <FormProvider {...eligibilityDocFormMethods}>
                        <EligibilityDocuments employeeData={employeeData} />
                    </FormProvider>}
                    {activeStep === 2 && <FormProvider {...docInformationFormMethods}>
                        <DocumentInformation setRequiredFields={setDocInfoRequiredFields} />
                    </FormProvider>}
                    {activeStep === 3 && <FormProvider {...i9FormMethods}>
                        <FormI9 />
                    </FormProvider>}
                </StepsContentContainer>
            </div>
            <BottomActionsContainer>
                {activeStep > 1 && <Button
                    size='large'
                    sx={{ marginRight: 1, width: 150 }}
                    startIcon={<StyledArrowIcon direction="left" fill="#339966" />}
                    onClick={onClickPreviousButton}
                >
                    {t('onBoarding.previous_step')}
                </Button>}
                <Tooltip placement="top" title={isActionButtonDisabled ? renderTooltip(activeStep) : ''}><div>
                    <LoadingButton
                        variant='contained'
                        size='large'
                        sx={{ width: activeStep === 3 ? 250 : 220 }}
                        onClick={onClickSaveContinue}
                        endIcon={<StyledArrowIcon direction="right" fill={isActionButtonDisabled ? "#8D8D8D" : "#FFF"} />}
                        disabled={isActionButtonDisabled}
                        loading={isActionButtonLoading}
                    >
                        {renderSaveAndContinueButtonText(activeStep)}
                    </LoadingButton>
                </div></Tooltip>
            </BottomActionsContainer>
        </PageContainer>
    )
};