import styled from "styled-components";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { useQueryClient } from "react-query";
import LoadingButton from "@mui/lab/LoadingButton";
import useMediaQuery from '@mui/material/useMediaQuery';
import useMutationCustom from "hooks/useMutationCustom";
import DialogModal, { IDialogProps } from "components/Modal/Dialog";
import UniversalInput from "components/Input/UniversalInput";
import { getCurrentUser } from "services";
import { setCurrentUser, setDomain } from "redux/authSlice";
import { useTranslation } from "react-i18next";

interface IFinishRegModal extends IDialogProps {
    onClose?: () => void,
};

export default function FinishRegistration({ onClose, ...rest }: IFinishRegModal) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const matchesQuerySM = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));
    const dispatch = useDispatch();
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            first_name: '',
            last_name: '',
            company_name: '',
        }
    });

    const { mutate, isLoading } = useMutationCustom<string[], {}, {}>(["post_finish_registration"], {
        endpoint: 'company/finish_registration', options: { method: "post" },
    }, {
        onSuccess: () => {
            getCurrentUser().then(res => {
                dispatch(setDomain(res.data.company.id));
                dispatch(setCurrentUser(res.data));
            });
            queryClient.invalidateQueries(['employee_list']);
        }
    });

    const onSubmitForm = (data: { first_name: string, last_name: string, company_name: string }) => {
        mutate(data)
    };

    return (
        <DialogModal
            withoutHeader
            upperPosition
            maxWidth={'sm'}
            preDefinedPadding={false}
            {...rest}
        >
            <ContentContainer>
                <HeaderTitle>{t('auth.registration.finished.before_you_start')}</HeaderTitle>
                <FieldsContainer>
                    <UniversalInput
                        placeholder={t('auth.registration.finished.first_name')}
                        size={matchesQuerySM ? "small" : "medium"}
                        inputProps={{ maxLength: 150 }}
                        errorText={errors.first_name?.message}
                        {...register('first_name', { required: t('auth.registration.finished.enter_first_name'), maxLength: 150 })}
                    />
                    <UniversalInput
                        placeholder={t('auth.registration.finished.last_name')}
                        size={matchesQuerySM ? "small" : "medium"}
                        inputProps={{ maxLength: 150 }}
                        errorText={errors.last_name?.message}
                        {...register('last_name', { required: t('auth.registration.finished.enter_last_name'), maxLength: 150 })}
                    />
                    <UniversalInput 
                        placeholder={t('auth.registration.finished.company_name')}
                        size={matchesQuerySM ? "small" : "medium"}
                        inputProps={{ maxLength: 250 }}
                        errorText={errors.company_name?.message}
                        {...register('company_name', { required: t('auth.registration.finished.enter_company_name'), maxLength: 250 })}
                    />
                    <LoadingButton
                        loading={isLoading}
                        sx={{ height: matchesQuerySM ? 40 : 50 }}
                        type="submit"
                        variant='contained'
                        onClick={handleSubmit(onSubmitForm)}
                    >
                        {t('auth.registration.finished.get_started')}
                    </LoadingButton>
                </FieldsContainer>
            </ContentContainer>
            <WarningBox>{t('auth.registration.finished.please_note_that_still')}</WarningBox>
        </DialogModal>
    )
};

const ContentContainer = styled('div')(({ theme }) => ({
    display: "flex",
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 60px",
    [theme.breakpoints.down('sm')]: {
        padding: 20,
    },
}));

const HeaderTitle = styled('h2')`
    font-size: 18px;
    margin-bottom: 35px;
    font-family: 'Aspira Demi', 'FiraGO Regular';
    color: #676767;
    text-align: center;
`;

const FieldsContainer = styled('div')`
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 15px;
`;

const WarningBox = styled('div')(({ theme }) => ({
    backgroundColor: "#FCF2E4",
    color: "#F4906A",
    fontSize: 11,
    padding: 18,
    textAlign: "center",
    [theme.breakpoints.down('sm')]: {
        fontSize: 9,
    },
}));