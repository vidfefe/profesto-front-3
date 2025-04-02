import React, { Fragment, useEffect, useState } from 'react';
import styled from "styled-components";
import { useToasts } from "react-toast-notifications";
import { useQueryClient } from 'react-query';
import { useHistory, Link } from 'react-router-dom';
import Text from 'components/Text';
import { currentUserSelector } from "redux/selectors";
import { setCurrentUser, setDomain } from 'redux/authSlice';
import { useDispatch, useSelector } from "react-redux";
import { getOwner, getUserRoleList, getPotentialOwners, changeOwner, getCurrentUser, createLocation, getLocations } from "services";
import useQuery from "hooks/useQueryCustom";
import EmployeeCard from "components/Employee/Card";
import DialogModal from 'components/Modal/Dialog';
import { Controller, useForm } from "react-hook-form";
import SelectDropdown from "../../../components/Dropdowns/SelectDropdown";
import Box from "@mui/material/Box";
import SelectWithLocationAdd from 'components/Dropdowns/SelectWithLocationAdd';
import UniversalInput from 'components/Input/UniversalInput';
import useMutationCustom from 'hooks/useMutationCustom';
import { useTranslation } from "react-i18next";
export const CompanyInfo = () => {
    const { t } = useTranslation();
    const { handleSubmit, setValue, control, setError, clearErrors, formState: { errors } } = useForm({
        shouldFocusError: true,
        defaultValues: {
            employee: null,
            role: null
        } as any
    });

    const companyAddressFormMethods = useForm({
        defaultValues: {
            location: null
        }
    });

    const companyNameFormMethods = useForm({
        defaultValues: {
            name: ''
        }
    });

    const dispatch = useDispatch();
    const currentUser = useSelector(currentUserSelector);
    const [owner, setOwner] = useState<any>();
    const [changeOwnerOpen, setChangeOwnerOpen] = useState<boolean>(false);
    const [companyAddressModal, setCompanyAddressModal] = useState<{ type: string, open: boolean }>({ type: '', open: false });
    const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
    const [companyNameModal, setCompanyNameModal] = useState<boolean>(false);
    const { addToast } = useToasts();
    const history = useHistory();
    const queryClient = useQueryClient();

    const { data } = useQuery<any>(["subscription_info"], {
        endpoint: 'billing/subscription',
        options: { method: "get" },
    }, { enabled: true });

    const { data: companyLocation } = useQuery<any>(["get_company_location"], {
        endpoint: 'company_setting',
        options: { method: "get" },
    }, { enabled: true });

    const { data: subscriptionPlans } = useQuery<any>(["getSubscriptionPlans"], {
        endpoint: '/billing/subscription/plans',
        options: { method: "get" },
    }, { enabled: true });
    
    const { mutate, isLoading } = useMutationCustom<string[], {}, {}>(["post_company_address"], {
        endpoint: 'company_setting/location', options: { method: "post" },
    }, {
        onSuccess: () => {
            setCompanyAddressModal({ type: '', open: false });
            addToast(`${t('settings.companyInfo.your_company_address_has_been')} ${companyAddressModal.type === 'Change' ? t('settings.companyInfo.changed') : t('settings.companyInfo.added')}`, {
                appearance: 'success', autoDismiss: true
            });
            queryClient.invalidateQueries('get_company_location');
            companyAddressFormMethods.reset();
        },
    });

    const { mutate: updateCompanyName, isLoading: companyNameChangeLoading } = useMutationCustom<string[], any, any>(["post_company_name"], {
        endpoint: 'company', options: { method: "post" },
    }, {
        onSuccess: () => {
            setCompanyNameModal(false);
            addToast(t('settings.companyInfo.company_name_changed'), {
                appearance: 'success', autoDismiss: true
            });
            getCurrentUser().then(res => {
                dispatch(setDomain(res.data.company.id));
                dispatch(setCurrentUser(res.data));
            });
        },
        onError: (err) => {
            err.errors.forEach((item: any) => {
                addToast(item.message, {
                    appearance: 'error',
                    autoDismiss: true,
                    placement: 'top-center'
                });
            });
        }
    });

    useEffect(() => {
        getOwner().then(res => setOwner(res.data))
    }, []);

    useEffect(() => {
        if (changeOwnerOpen) {
            setValue('employee', null)
            setValue('role', null)
            clearErrors()
        }
    }, [changeOwnerOpen]);

    const onSubmit = (data: any) => {
        setLoadingRequest(true)

        changeOwner(data).then(res => {
            getCurrentUser().then(res => {
                dispatch(setCurrentUser(res.data));
            });
            setLoadingRequest(false)
            setChangeOwnerOpen(false)
            getOwner().then(res => setOwner(res.data))
            history.push('/people')
            addToast(t('settings.companyInfo.company_owner_changed'), { appearance: 'success', autoDismiss: true })
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

    const onSubmitCompanyAddress = (data: any) => {
        let locationId = data.location?.id;

        mutate({ location_id: locationId });
    };

    const onSubmitCompanyName = (data: any) => {
        updateCompanyName(data)
    };

    const onError = (err: any) => {
        if (err) {
            addToast(<ToastContentContainer dangerouslySetInnerHTML={{ __html: t('globaly.fix_Highlighted')}}/>, {
                appearance: 'error',
                autoDismiss: true,
                placement: 'top-center'
            });
        }
    };

    return (
        <Fragment>
            <div style={{ display: 'flex', alignContent: 'center' }}>
                <div style={{ width: 3, height: 25, backgroundColor: '#339966', float: 'left', marginRight: 15 }} />
                <Text type="title">{t('settings.companyInfo.company_info')}</Text>
            </div>
            <Wrapper>
                <div style={{ display: 'flex' }}>
                    <BlockWrapper>
                        <TitleWrapper>
                            <CompanyName>{currentUser?.company?.name}</CompanyName>
                            <CompanyId>{t('settings.companyInfo.company_id')} <span>{currentUser?.company?.id}</span></CompanyId>
                            <ActionTextTitle onClick={() => setCompanyNameModal(true)}>{t('settings.companyInfo.change_company_name')}</ActionTextTitle>
                            <CompanyEmployees style={{ color: 'var(--dark-gray)' }}>
                                <Link to="/list/filters?status=none">
                                    {data?.employee_count} {t('settings.companyInfo.employees')}
                                </Link> / {' '}
                                { data?.plan === 'large_bizz'
                                    ? t('settings.companyInfo.unlimited')
                                    : subscriptionPlans?.filter((plan: any) => plan.id_name === data?.plan)[0].seats_limitation.match(/\d+/) + ' ' + t('settings.companyInfo.seats')
                                }
                            </CompanyEmployees>
                        </TitleWrapper>
                    </BlockWrapper>
                    <BlockWrapper style={{ marginTop: 9 }}>
                        <TitleWrapper>
                            <p className={'title'}>{t('settings.companyInfo.account_owner')}</p>
                            {owner && <EmployeeCard employee={owner} key={owner?.id} fontSize={13}
                                additionalInfo={<ChangeOwnerWrapper
                                    onClick={() => setChangeOwnerOpen(true)}>{t('globaly.change')}</ChangeOwnerWrapper>} />}
                        </TitleWrapper>
                    </BlockWrapper>
                    <BlockWrapper style={{ marginTop: 9 }}>
                        <TitleWrapper>
                            <p className={'title'}>{t('settings.companyInfo.company_address')}</p>
                            {companyLocation ?
                                <CompanyAddressContainer>
                                    <p>{`${companyLocation.location.address} ${companyLocation.location.address_details}`}</p>
                                    <p>{`${companyLocation.location.city}, ${companyLocation.location.state ?
                                        companyLocation.location.state.name : companyLocation.location.region} ${companyLocation.location.postal_code}`}</p>
                                    <ActionTextTitle onClick={() => setCompanyAddressModal({ type: 'Change', open: true })}>{t('settings.companyInfo.change_company_address')}</ActionTextTitle>
                                </CompanyAddressContainer> :
                                <ActionTextTitle onClick={() => setCompanyAddressModal({ type: 'Add', open: true })}>{t('settings.companyInfo.add_company_address')}</ActionTextTitle>}
                        </TitleWrapper>
                    </BlockWrapper>
                </div>
                <Wrapper style={{ display: 'grid' }}>
                    <SubscriptionsHeader>{t('settings.menu.subscriptions.subscriptions')}</SubscriptionsHeader>
                    <div style={{ display: 'flex',  overflow: 'auto', gap: '10px' }}>
                        {subscriptionPlans?.map((subscription: any) => {
                            return  (
                                <SubscriptionCard key={subscription.name} $color={subscription.color} $active={data?.plan === subscription.id_name} style={{ width: `calc(100%/${subscriptionPlans.length})` }}>
                                    <span>{subscription.name}</span>
                                    <p style={{ fontSize: 11 }}>{subscription.seats_limitation}</p>
                                        <BillingInfo>
                                            <span>{subscription.price}</span>
                                            <div>
                                                <span>{subscription.price_period}</span>
                                                <span>{subscription.pay_period}</span>
                                            </div>
                                        </BillingInfo>
                                    <ListHeader>{t('settings.menu.subscriptions.what_included')}</ListHeader>
                                    <ul>
                                        {subscription.items?.map((item: string) => {
                                            return (
                                                <li key={item} style={{ fontSize: '11px', lineHeight: '14px' }}>
                                                    {item}
                                                </li>
                                            )
                                        })}
                                    </ul>
                                    {data?.plan === subscription.id_name &&
                                    <CurrentSubscriptionLabel $color={subscription.color}>
                                        <div>{t('settings.menu.subscriptions.current')}</div>
                                        <div>{t('settings.menu.subscriptions.subscription')}</div>
                                    </CurrentSubscriptionLabel>}
                                </SubscriptionCard>
                            )
                        })}
                    </div>
                </Wrapper>
            </Wrapper>

            {changeOwnerOpen && <DialogModal
                open={changeOwnerOpen}
                title={t('settings.companyInfo.change_account_owner')}
                onClose={() => setChangeOwnerOpen(false)}
                actionButton={handleSubmit(onSubmit, onError)}
                withButtons
                cancelButtonText={t('globaly.cancel')}
                actionButtonText={t('globaly.submit')}
                actionLoading={loadingRequest}
                upperPosition
            >
                <ChangeWrapper>
                    <div style={{ textAlign: 'center' }}>
                        <HeaderText>{t('settings.companyInfo.change_account_owner')}</HeaderText>
                        <AddText>{t('settings.companyInfo.account_owner_access')}</AddText>
                    </div>

                    <InputWrapper>
                        <label>{t('settings.companyInfo.new_account_owner')}<sup>*</sup></label>
                        <Controller
                            name="employee"
                            control={control}
                            rules={{ required: t('validations.new_account_owner_required') }}
                            render={({ field: { onChange, value } }) => (
                                <SelectDropdown
                                    inputPlaceholder={t('settings.companyInfo.select_new_account_owner')}
                                    onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
                                        onChange(newValue)
                                    }}
                                    value={value}
                                    loadRemoteData={() => getPotentialOwners()}
                                    withPic
                                    errorText={errors.role ? errors.role.message : ''}
                                />
                            )}
                        />
                        <div style={{ marginTop: 3 }}>{t('settings.companyInfo.management_access')}</div>
                    </InputWrapper>

                    <InputWrapper>
                        <label>{t('settings.companyInfo.your_user_role')}<sup>*</sup></label>
                        <Controller
                            name="role"
                            control={control}
                            rules={{ required: t('validations.your_new_user_role_required') }}
                            render={({ field: { onChange, value } }) => (
                                <SelectDropdown
                                    inputPlaceholder={t('settings.companyInfo.select_user_role')}
                                    renderOption={(props: any, option: any) => (
                                        <Box component="li" {...props}
                                            style={{
                                                paddingLeft: 13,
                                                borderTop: option.addLine ? '1px solid #D6D6D6' : 'none'
                                            }}
                                            key={option.id ?? props.key}
                                        >
                                            {`${option.name} (${option.user_count})`}
                                        </Box>
                                    )}
                                    onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
                                        onChange(newValue)
                                    }}
                                    value={value}
                                    loadRemoteData={() => getUserRoleList(50, 1, 0, true, t)}
                                    errorText={errors.role ? errors.role.message : ''}
                                />
                            )}
                        />
                    </InputWrapper>
                </ChangeWrapper>
            </DialogModal>}

            <DialogModal
                open={companyAddressModal.open}
                onClose={() => { setCompanyAddressModal({ type: '', open: false }); companyAddressFormMethods.reset(); }}
                actionButton={companyAddressFormMethods.handleSubmit(onSubmitCompanyAddress)}
                actionLoading={isLoading}
                title={`${companyAddressModal.type} ${t('settings.companyInfo.company_address')}`}
                withButtons
                actionButtonText={t('globaly.save')}
                cancelButtonText={t('globaly.cancel')}
                maxWidth={'sm'}
                fullWidth
                upperPosition
            >
                <CompanyModalContainer>
                    <p>{t('settings.companyInfo.please_click_save')}</p>
                    <label>{t('settings.companyInfo.company_address')}<sup>*</sup></label>
                    <Controller
                        name="location"
                        control={companyAddressFormMethods.control}
                        rules={{ required: t('validations.company_address_required') }}
                        render={({ field: { value, onChange, ref } }) => (
                            <SelectWithLocationAdd
                                name='location'
                                inputPlaceholder={t('createPerson.select_location')} ///c
                                inputValue={value}
                                loadRemoteData={() => getLocations(100, 1, false, false)}
                                createRequest={createLocation}
                                onChange={onChange}
                                errorText={companyAddressFormMethods.formState?.errors.location?.message}
                                ref={ref}
                            />
                        )}
                    />
                </CompanyModalContainer>
            </DialogModal>

            <DialogModal
                open={companyNameModal}
                onClose={() => { setCompanyNameModal(false); companyNameFormMethods.reset(); }}
                actionButton={companyNameFormMethods.handleSubmit(onSubmitCompanyName)}
                actionLoading={companyNameChangeLoading}
                title={t('settings.companyInfo.change_company_name')}
                withButtons
                actionButtonText={t('globaly.change')}
                cancelButtonText={t('globaly.cancel')}
                maxWidth={'sm'}
                fullWidth
                upperPosition
            >
                <CompanyModalContainer>
                    <p>{t('settings.companyInfo.please_click_change')}</p>
                    <label>{t('settings.companyInfo.company_name')}<sup>*</sup></label>
                    <UniversalInput
                        inputProps={{ maxLength: 250 }}
                        errorText={companyNameFormMethods.formState.errors?.name?.message}
                        {...companyNameFormMethods.register('name', { required: t('validations.company_name_required'), maxLength: 250 })}
                    />
                </CompanyModalContainer>
            </DialogModal>
        </Fragment>
    )
};

const ToastContentContainer = styled.div`
    & > b {
        font-family: 'Aspira Demi', 'FiraGO Regular';
    }
`;

const Wrapper = styled.div`
     margin-top: 20px; 
     flex: 1; 
     background-color: #FFF; 
     padding: 18px 15px; 
     border-radius: 6px;
`;

const BlockWrapper = styled.div`
    flex: 0.23;
    
    > div {
        margin-bottom: 35px;
        margin-top: 13px;
        margin-left: 13px;
    }
`;

const TitleWrapper = styled.div`
    display: flex;
    flex-direction: column;
    > p {
        margin-bottom: 5px;
        font-family: 'Aspira Demi', 'FiraGO Regular';
    };

    .title {
        font-family: "Aspira Wide Demi", "FiraGO Medium";
    }
    
    span {
        color: #414141;
        & > a {
            color: var(--green);
            cursor: pointer;
            font-family: 'Aspira Demi', 'FiraGO Regular';
        }
    };
`;

const ChangeOwnerWrapper = styled.div`
    cursor: pointer;
    text-decoration: underline;
    font-weight: normal;
    font-size: 12px;

    :hover {
        color: var(--orange);
    }
`;

const ChangeWrapper = styled.div`
    padding: 20px 30px;
    color: #676767;
    width: 500px;
    height: 450px;
`;

const HeaderText = styled.div`
    font-size: 18px;
    margin-bottom: 16px;
    font-weight: bold;
`;

const AddText = styled.div`
    color: #676767;
    font-size: 11px;
    margin-bottom: 45px;
    line-height: 1.5;
`;

const InputWrapper = styled.div`
    margin-bottom: 20px;
    
    > label {
        display: inline-block;
        margin-bottom: 6px;
        margin-top: 6px;
        & > sup {
            color: #C54343;
        }
    }
`;

const ActionTextTitle = styled.span`
    font-size: 12px;
    color: var(--dark-gray);
    text-decoration: underline;
    cursor: pointer;        
    &:hover {
        color: var(--orange);
    }
`;

const CompanyModalContainer = styled.div`
    padding-block: 20px;
    & > p {
        margin-bottom: 20px;
        font-size: 13px;
    };
    & > label {
        display: inline-block;
        margin-bottom: 6px;
        & > sup {
            color: #C54343;
        };
    };
`;

const CompanyName = styled.span`
    font-family: "Aspira Wide Demi", "FiraGO Medium";
    font-size: 21px;
    margin-bottom: 6px;
`;

const CompanyId = styled.p`
    margin: 0px !important;
`;

const CompanyEmployees = styled.span`
    margin-top: 6px;
` 

const CompanyAddressContainer = styled.div`
    & > span {
        color: #414141;
    };
`;

const SubscriptionsHeader = styled.p`
    font-family: "Aspira Wide Demi", "FiraGO Medium";
    font-size: 14px;
    margin-bottom: 20px;
`;

const SubscriptionCard = styled.div<{ $color: string; $active: boolean }>`
    border: 1px solid rgb(from ${props => props.$color } r g b / 0.2);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-width: 240px;
    padding: 56px 8px 20px;
    ${props => props.$active ? `border: 3px solid ${props.$color}` : ''};
    border-radius: 6px;

    >span:first-child {
        font-family: 'Aspira Wide Demi';
        font-size: 24px;
        text-transform: uppercase;
        color: ${props => props.$color };

        margin-bottom: 14px;
    }

    p {
        font-size: 16px;
        line-height: 16px;
        margin-bottom: 26px;
    }

    li {
        font-size: 12px;
        line-height: 16px;

        &:not(:last-of-type) {
            margin-bottom: 12px;
        }
    }
`;

const BillingInfo = styled.div`
    display: flex;
    align-items: start;
    gap: 7px;

    margin-bottom: 36px;

    >span {
        font-family: "Aspira Wide Demi", "FiraGO Medium";
        font-size: 22px;
        line-height: 36px;
    }

    div {
        display: flex;
        flex-direction: column;
        gap: 7px;

        span {
            font-size: 10px;
            line-height: 10px;
            color: var(--dark-gray);
        }
    }
`;

const ListHeader = styled.div`
    font-family: "Aspira Wide Demi", "FiraGO Medium";
    font-size: 15px;
    line-height: 15px;
    margin-bottom: 20px;
`;

const CurrentSubscriptionLabel = styled.div<{ $color: string; }>`
    position: absolute;
    top: -78px;
    right: -78px;
    display: flex;
    align-items: center;
    justify-content: end;
    flex-direction: column;

    color: #fff;
    background-color: ${props => props.$color };

    transform: rotate(45deg);

    padding-bottom: 12px;
    width: 155px;
    height: 155px;

    div {
        font-family: "Aspira Wide Demi", "FiraGO Medium";
        line-height: 16px;
    }
`;