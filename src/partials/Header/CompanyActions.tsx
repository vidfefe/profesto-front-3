import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { saveStorageObject } from "utils/storage";
import {
    createCompany,
    getCurrentUser,
    getCompanies,
    switchCompany
} from "services";
import { useForm } from "react-hook-form";
import Popover from '@mui/material/Popover';
import DialogModal from "components/Modal/Dialog";
import { useToasts } from "react-toast-notifications";
import UniversalInput from 'components/Input/UniversalInput';
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import { setAuthorizationToken } from "services/mainAxios";
import { setCurrentUser, setDomain, setToken } from "redux/authSlice";
import { currentUserSelector } from "redux/selectors";

import { ReactComponent as FourSquareIcon } from "assets/svg/four-square_circle.svg";
import { ReactComponent as ArrowDownIcon } from "assets/svg/arrow.svg";
import { ReactComponent as SelectedIcon } from 'assets/svg/mark_circle.svg';
import { ReactComponent as PlusIcon } from 'assets/svg/plus.svg';
import { useTranslation } from "react-i18next";

const CompanyActions = () => {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        setError,
        clearErrors,
        formState: { errors }
    } = useForm({
        shouldFocusError: true,
        defaultValues: {
            company_name: '',
        } as any
    });
    const { t } = useTranslation();
    const [companyOpen, setCompanyOpen] = useState<boolean>(false)
    const [addCompanyOpen, setAddCompanyOpen] = useState<boolean>(false)
    const [companies, setCompanies] = useState([]);
    const dispatch = useDispatch();
    const [loadingRequest, setLoadingRequest] = useState<boolean>(false)
    const watchCompany = watch('company_name');
    const { addToast } = useToasts();
    const [companyAnchorEl, setCompanyAnchorEl] = useState<HTMLButtonElement | null>(null);
    const currentUser = useSelector(currentUserSelector)

    const companyClick = (event: any) => {
        setCompanyAnchorEl(event.currentTarget)
        setCompanyOpen(true)
    };

    const switchCompanyAction = (id: number) => {
        setCompanyOpen(false)
        switchCompany(id).then((res: any) => {
            reloadToCompany(res.data)
        })
    };

    const onSubmit = (data: any) => {
        setLoadingRequest(true)

        createCompany(data).then(res => {
            setLoadingRequest(false)
            closeCompanyAdd()
            reloadToCompany(res.data)
        }).catch(err => {
            setLoadingRequest(false)
            err.response.data.errors.forEach((item: any) => {
                if (item.field && item.field === 'base') {
                    setError(item.field, { type: 'string', message: item.message })
                } else {
                    addToast(item.message, { appearance: 'error', autoDismiss: true });
                }
            });
        });
    };

    const reloadToCompany = (data: any) => {
        saveStorageObject('token', data.token);
        saveStorageObject('refresh_token', data.refresh_token);
        setAuthorizationToken(data.token);
        dispatch(setToken(data.token));
        getCurrentUser().then(res => {
            dispatch(setDomain(res.data.company.id));
            dispatch(setCurrentUser(res.data));
        })
        window.location.href = "/people"
    };

    const companyAddClick = () => {
        setCompanyOpen(false)
        setAddCompanyOpen(true)
    };

    const closeCompanyAdd = () => {
        setCompanyOpen(false)
        setAddCompanyOpen(false)
    }

    useEffect(() => {
        if (companyOpen) {
            setValue('company_name', null)
            clearErrors()
            getCompanies().then(res => {
                setCompanies(res.data)
            })
        }
    }, [companyOpen])

    const onError = (err: any) => {
        if (err) {
            addToast(<ToastContentContainer dangerouslySetInnerHTML={{ __html: t('headers.authorized.companyActions.please_fix_highlighted')}}/>, {
                appearance: 'error',
                autoDismiss: true,
                placement: 'top-center'
            });
        }
    };

    return (
        <Fragment>
            <CompanyWrapper $active={companyOpen} onClick={(e) => companyClick(e)}>
                <div style={{ width: 35 }}><FourSquareIcon /></div>
                <p>{currentUser?.company?.name}</p>
                <div style={{ width: 14, height: 38, display: 'flex', alignItems: 'center', marginLeft: 'auto', marginRight: 2 }}>
                    <StyledArrowDownIcon $active={companyOpen} />
                </div>
            </CompanyWrapper>

            <Popover
                open={companyOpen}
                anchorEl={companyAnchorEl}
                onClose={() => setCompanyOpen(false)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: -18,
                    horizontal: 'right',
                }}
            >
                <CompanyListWrapper>
                    <CompanyHeader>
                        <p>{t('headers.authorized.companyActions.switch_another_company')}</p>
                        <div>{companies.length > 1 ? t('headers.authorized.companyActions.you_have_roles', {count: companies.length}) : t('headers.authorized.companyActions.you_have_roles', {count: companies.length})}</div>
                    </CompanyHeader>

                    {companies.length ? companies.map((item: any) =>
                        <div key={item.id}>
                            <Divider />
                            <CompanyBody current={item.current}
                                onClick={() => item.current ? '' : switchCompanyAction(item.id)}>
                                <p>{item.name}</p>
                                <div>
                                    {item.current && <SelectedIcon style={{ marginRight: 7 }} />}
                                    {item.current ? t('headers.authorized.companyActions.currently_signed_as') : t('headers.authorized.companyActions.sign_in_as')} { item.role ? t(`enums.roles.${item.role}`) : '' }
                                </div>
                            </CompanyBody>
                        </div>
                    ) : <LinearProgress />}
                    <Divider style={{ marginBottom: 10 }} />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 12 }}>
                        <Button startIcon={<StyledPlusIcon />} type="button" size='large' variant='contained'
                            style={{ width: 200 }} onClick={() => companyAddClick()}>
                            {t('headers.authorized.companyActions.add_new_company')}
                        </Button>
                    </div>
                </CompanyListWrapper>
            </Popover>

            {addCompanyOpen && <DialogModal
                open={addCompanyOpen}
                title={t('headers.authorized.companyActions.addCompany.add_company')}
                onClose={() => closeCompanyAdd()}
                actionButton={handleSubmit(onSubmit, onError)}
                withButtons
                cancelButtonText={t('headers.authorized.companyActions.addCompany.cancel')}
                actionButtonText={t('headers.authorized.companyActions.addCompany.submit')}
                actionLoading={loadingRequest}
                upperPosition
            >
                <AddCompanyWrapper>
                    <div style={{ textAlign: 'center' }}>
                        <HeaderText>{t('headers.authorized.companyActions.addCompany.add_new_company')}</HeaderText>
                        <AddText dangerouslySetInnerHTML={{ __html: t('headers.authorized.companyActions.addCompany.package')}}></AddText>
                    </div>

                    <InputWrapper>
                        <UniversalInput
                            size='small'
                            maxLength='250'
                            placeholder={t('headers.authorized.companyActions.addCompany.company_name_placeholder')}
                            visiblePlaceholder={watchCompany ? true : false}
                            errorText={
                                errors.company_name ? t('headers.authorized.companyActions.addCompany.please_enter_your_company_name') : ""
                            }
                            {...register("company_name", { required: true, maxLength: 250 })}
                        />
                    </InputWrapper>
                    <TOSContainer>
                        {t('auth.registration.agree_creating_account')} <a target={'_blank'} rel="noreferrer" href='https://profesto.net/terms-of-service/'>{t('auth.registration.terms_conditions')}</a>
                    </TOSContainer>
                </AddCompanyWrapper>
            </DialogModal>}
        </Fragment>
    );
};

export default CompanyActions;

const ToastContentContainer = styled.div`
    & > b {
        font-family: 'Aspira Demi', 'FiraGO Regular';
    }
`;

const CompanyWrapper = styled('div')<{ $active?: boolean }>(({ theme, $active }) => ({
    width: "16rem",
    height: 36,
    background: $active ? '#215549' : '#243844',
    borderRadius: 30,
    paddingRight: 10,
    color: "#FFFFFF",
    fontSize: 11,
    marginRight: 12,
    alignItems: "center",
    display: "flex",
    lineHeight: 1,
    cursor: "pointer",
    overflow: "hidden",
    "&:hover": { background: "#215549" },
    "& > p": {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        paddingRight: 5
    },
}));

const StyledArrowDownIcon = styled(ArrowDownIcon) <{ $active?: boolean }>`
    transform: ${(props) => { return props.$active ? 'rotate(180deg)' : 'rotate(0deg)' }};
    width: 15px;
    height: 15px;
    top: 3px;
    path{
      fill: #FFF;
    }
`;

const CompanyListWrapper = styled.div`
    width: 412px;
    padding: 15px 0px;
`;

const CompanyHeader = styled.div`
    color: #676767;
    padding-left: 12px;
    padding-right: 12px;
    padding-bottom: 12px;
    
    p {
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 4px;
        padding-left: 3px;
    }
    
    div {
        font-size: 10px;
        padding-left: 3px;
        padding-right: 3px;
    }
`

const CompanyBody = styled.div <{ current?: boolean }>`
    cursor: ${(props) => { return props.current ? 'auto' : 'pointer' }};
    padding-top: 13px;
    padding-bottom: 15px;
    padding-left: 12px;
    padding-right: 12px;
    
    &:hover {
        background: #DCEEE5;
    }
    
    p {
        color: #339966;
        font-weight: 500; 
        padding-left: 3px;
        font-size: 12px;
    }
    
    div {
        color:  ${(props) => { return props.current ? '#77B448' : '#00101A' }};
        font-size: 10px;
        padding-left: 3px;
        display: flex;
        align-items: center;
        height: 15px;
        margin-top: 2px;
    }
`

const Divider = styled.div`
    border-top: 1px solid #F1F1F1;
    margin-left: 12px;
    margin-right: 12px;
`

const StyledPlusIcon = styled(PlusIcon)`
    margin-right: 5px;
    path{
        fill: #FFF;
    }
`;

const AddCompanyWrapper = styled.div`
    padding: 20px 40px;
    color: #676767;
    width: 500px;
`;

const HeaderText = styled.div`
    font-size: 18px;
    margin-bottom: 16px;
    font-family: 'Aspira Demi', 'FiraGO Regular';
`

const AddText = styled.div`
    color: #676767;
    font-size: 11px;
    margin-bottom: 45px;
    line-height: 1.5;
`

const InputWrapper = styled.div`
    margin-bottom: 15px;
`

const TOSContainer = styled('div')`
  text-align: center;
  font-size: 12px;
  color: #172B37;
  & > a {
    font-family: 'Aspira Demi', 'FiraGO Regular';
    text-decoration: underline;
    cursor: pointer;
  }
`;