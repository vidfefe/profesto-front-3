import { useEffect, useState } from "react";
import styled from "styled-components";
import { useHistory, useParams } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import useMutationCustom from "hooks/useMutationCustom";
import useQueryCustom from "hooks/useQueryCustom";
import { PageHeaderTitle } from 'components/DesignUIComponents';
import DialogModal from "components/Modal/Dialog";
import CircularProgress from "@mui/material/CircularProgress";
import { useTranslation } from "react-i18next";
import CreatePersonForm from '../../../containers/createperson/CreatePersonForm';
import { ReactComponent as WarningMark } from 'assets/svg/warning-mark_circles.svg';

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

export default function OnboardingUpdate() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const history = useHistory();
    const { addToast } = useToasts();
    const [formErrors, setFormErrors] = useState(null);
    const [updateErrorModal, setUpdateErrorModal] = useState<boolean>(false);

    useEffect(() => {
        return () => {
            removeOnboardingData();
            removeEmployeeInfo();
            removeContactInfo();
            removeJobsDetails();
            removeCompensationInfo();
        }
    }, []);

    const { data: onboardingData, isLoading: onboardingDataLoading, remove: removeOnboardingData } = useQueryCustom<string[], {}, TOnboardingWelcome>(["onboarding_welcome"], {
        endpoint: `onboarding?employee_id=${id}`,
        options: { method: "get" },
    }, {
        onSuccess: (data) => data?.onboarding_status.id !== 'in_progress' && history.replace('/'),
        onError: () => history.replace('/'),
        refetchOnWindowFocus: false
    });

    const { data: infoData, isLoading: infoDataLoading, remove: removeEmployeeInfo } = useQueryCustom<any>(["employee_info"], {
        endpoint: `employee/${id}`,
        options: { method: "get" },
    }, { refetchOnWindowFocus: false });

    const { data: contactData, remove: removeContactInfo } = useQueryCustom<any>(["employee_contact_info"], {
        endpoint: `employee_contact_info/${id}`,
        options: { method: "get" },
    }, { refetchOnWindowFocus: false });

    const { data: jobDetails, remove: removeJobsDetails } = useQueryCustom<any>(["employee_job_details"], {
        endpoint: `employee_job_detail/active?employee_id=${id}`,
        options: { method: "get" },
    }, { refetchOnWindowFocus: false });

    const { data: compensationData, remove: removeCompensationInfo } = useQueryCustom<any>(["employee_compensation"], {
        endpoint: `employee_compensation/active?employee_id=${id}`,
        options: { method: "get" },
    }, { refetchOnWindowFocus: false });

    const { mutate: updateOnboardingData, isLoading: updateOnboardingUpdate, error: updateError } = useMutationCustom<string[], TMutationErrorData, {}>(["onboarding_update"], {
        endpoint: 'onboarding/admin/update', options: { method: "put" },
    }, {
        onSuccess: () => {
            history.replace(`/employee/${id}`);
            addToast(t('onBoarding.onboardingUpdate.successfully'), { appearance: 'success', autoDismiss: true });
            removeOnboardingData();
            removeEmployeeInfo();
            removeContactInfo();
            removeJobsDetails();
            removeCompensationInfo();
        },
        onError: (err: any) => {
            if (!err?.errors[0]?.field) setUpdateErrorModal(true);
            else setFormErrors(err?.errors);
        }
    });

    const onSubmit = (data: any) => {
        let formData = {
            employee_id: id,
            first_name: data.first_name,
            last_name: data.last_name,
            middle_name: data.middle_name,
            role_id: data.role?.id ?? null,
            i9_form: data.i9_form,
            user_email: data.user_email,
            hire_date: data.hire_date,
            employee_contact_info_attributes: {
                work_phone: data.work_phone,
                work_phone_ext: data.work_phone_ext,
                work_email: data.work_email,
                personal_email: data.personal_email
            },
            employee_job_details_attributes: {
                effective_date: data.effective_date,
                employment_status_id: data.employment_status?.id ?? null,
                location_id: data.location?.id ?? null,
                division_id: data.division?.id ?? null,
                department_id: data.department?.id ?? null,
                job_title_id: data.job_title?.id ?? null,
                manager_id: data.manager?.id ?? null,
            },
            employee_compensations_attributes: {
                effective_date: data.effective_date_compensation,
                pay_amount: data.pay_amount.inputValue,
                currency_id: data.pay_amount.selectValue?.id ?? null,
                payment_period_id: data.payment_period?.id ?? null,
                payment_schedule_id: data.payment_schedule?.id ?? null,
                payment_type_id: data.payment_type?.id ?? null,
                additional_payment_type_ids: data.additional_payment_types,
            }
        };

        updateOnboardingData(formData);
    };

    const formIsLoading = onboardingDataLoading || infoDataLoading;

    if (formIsLoading) return <LoadingScreenContainer><CircularProgress thickness={4} /></LoadingScreenContainer>;

    return (
        <PageContainer>
            <PageHeaderTitle title={`${t('onBoarding.onboardingUpdate.page_title', {firstName: infoData?.first_name})}`} />
            <CreatePersonForm
                onFormSubmit={onSubmit}
                propErrors={formErrors}
                formType={'onboarding_update'}
                employeeData={{
                    onboarding: onboardingData,
                    userInfo: infoData,
                    contact: contactData,
                    jobDetails,
                    compensationData,
                }}
                loadingEmployeeCreation={updateOnboardingUpdate}
            />
            <DialogModal
                open={updateErrorModal}
                onClose={() => { setUpdateErrorModal(false); history.replace(`/employee/${id}`); }}
                withButtons
                upperPosition
                actionButton={() => { setUpdateErrorModal(false); history.replace(`/employee/${id}`); }}
                fullWidth
                actionButtonText={t('button.close')}
            >
                <ModalContentContainer>
                    <WarningMark />
                    <p>{t('onBoarding.onboardingUpdate.self_onboarding_information')}</p>
                    <p>{updateError?.errors?.[0].message}</p>
                </ModalContentContainer>
            </DialogModal>
        </PageContainer>
    );
};

const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`;

const LoadingScreenContainer = styled.div`
   display: flex;
   justify-content: center;
   align-items: center;
   flex: 1;
`;

const ModalContentContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  padding: 30px 20px;
  & > svg {
    margin-bottom: 25px;
  };
  & > p:first-of-type {
    font-size: 12px;
    font-family: 'Aspira Demi', 'FiraGO Regular';
    color: #414141;
    margin-bottom: 14px;
  }
  & > p:last-of-type {
    font-size: 11px;
    color: #676767;
    margin-bottom: 14px;
  };
`;

