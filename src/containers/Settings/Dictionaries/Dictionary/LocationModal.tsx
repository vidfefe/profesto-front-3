import React, {useState, Fragment, useEffect} from "react";
import { Controller, useForm } from 'react-hook-form';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from "react-i18next";
import { useToasts } from 'react-toast-notifications';
import styled from "styled-components";

import { getCountryList, getLocation, getStateList } from "services";
import DialogModal from 'components/Modal/Dialog';
import UniversalInput from "components/Input/UniversalInput";
import SelectDropdown from "components/Dropdowns/SelectDropdown";
import Checkbox from "components/Checkbox";
import { EditModalState } from "./Dictionary";
import useMutationCustom from 'hooks/useMutationCustom';

interface LocationModalProps {
    isOpen: boolean;
    editModalState: EditModalState;
    onCloseModal: () => void;
    singularTitle: string;
    endpoint: string;
    refreshData: () => void;
};

type FormValues = {
    name: string;
    remote_location: boolean;
    country: { id: number; iso: string; name: string } | null;
    address: string;
    address_details: string;
    city: string | null;
    region: string | null;
    state: { id: number; name: string } | null;
    postal_code: string;
};

export const LocationModal = ({
    isOpen,
    editModalState,
    onCloseModal,
    singularTitle,
    endpoint,
    refreshData
}: LocationModalProps) => {
    const { t } = useTranslation();
    const { addToast } = useToasts();
    const [isLoading, setIsLoading] = useState(false);

    const { register, unregister, reset, handleSubmit, setError, setValue, control, watch, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            name: '',
            remote_location: false,
            country: null,
            address: '',
            address_details: '',
            city: null,
            region: '',
            state: null,
            postal_code: ''
        }
    });
    const watchCountry: FormValues['country'] = watch('country');
    const watchRemoveLocation = watch('remote_location');

    useEffect(() => {
        if (editModalState) {
            setIsLoading(true);
            getLocation(editModalState.id).then((res: { data: { id: number } & FormValues}) => {
                const { data } = res;
                setValue('name', data.name);
                setValue('remote_location', data.remote_location);
                setValue('country', data.country);
                setValue('address', data.address);
                setValue('address_details', data.address_details);
                setValue('city', data.city);
                setValue('region', data.region);
                setValue('state', data.state);
                setValue('postal_code', data.postal_code);
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, [endpoint, editModalState, setValue]);

    const createLocation = useMutationCustom<{}, { errors: [{ field: string, message: string, }] }, any>(
        ["create_location"], {
        endpoint: endpoint,
        options: { method: "post" },
    }, {
        onSuccess: () => {
            onCloseModal();
            addToast(`${t('globaly.add_success', {title: singularTitle})}`, { appearance: 'success', autoDismiss: true });
            reset();
            refreshData();
        },
        onError: (err) => {
            if (err?.errors[0].field) {
                err.errors.forEach((item: any) => {
                    setError(item.field, { type: 'custom', message: item.message });
                });
            };
        }
    });

    const updateLocation = useMutationCustom<{}, { errors: [{ field: string, message: string, }] }, any>(
        ["update_location"], {
        endpoint: endpoint + `/${editModalState?.id}`,
        options: { method: "put" },
    }, {
        onSuccess: () => {
            onCloseModal();
            addToast(`${t('globaly.update_success', {title: singularTitle})}`, { appearance: 'success', autoDismiss: true });
            reset();
            refreshData();
        },
        onError: (err) => {
            if (err?.errors[0].field) {
                err.errors.forEach((item: any) => {
                    setError(item.field, { type: 'custom', message: item.message });
                });
            };
        }
    });

    const onAddNewLocation = (data: FormValues) => {
        const formData = {
            name: data.name,
            remote_location: data.remote_location,
            country_id: data.country?.id,
            address: data.address,
            address_details: data.address_details,
            city: data.city,
            region: data.region,
            state_id: data.state?.id,
            postal_code: data.postal_code
        };
        createLocation.mutate(formData);
    };

    const onUpdateLocation = (data: FormValues) => {
        const formData = {
            name: data.name,
            remote_location: data.remote_location,
            country_id: data.country?.id,
            address: data.address,
            address_details: data.address_details,
            city: data.city,
            region: data.region,
            state_id: data.state?.id,
            postal_code: data.postal_code
        };
        updateLocation.mutate(formData);
    };

    return (
        <DialogModal
            open={(isOpen || !!editModalState)}
            title={(isOpen ? t('dictionaries.add') : t('dictionaries.edit')) + ' ' + singularTitle}
            onClose={() => {
                onCloseModal();
                reset();
            }}
            actionButton={() => { editModalState ? handleSubmit(onUpdateLocation)() : handleSubmit(onAddNewLocation)(); }}
            withButtons
            cancelButtonText={t('globaly.cancel')}
            actionButtonText={t('globaly.save')}
            actionLoading={updateLocation.isLoading || createLocation.isLoading}
            maxWidth={'md'}
            upperPosition
        >
            <div style={{ display: 'flex', flexDirection: 'column', paddingBlock: 10, width: 600 }}>
                {isLoading ? <CircularProgress sx={{ alignSelf: 'center' }} /> : <Fragment>
                    <StyledFieldItem>
                        <label>{singularTitle}<sup>*</sup></label>
                        <UniversalInput
                            inputProps={{ maxLength: 250 }}
                            placeholder={t('dictionaries.placeholder', { title: singularTitle })}
                            errorText={errors.name ? errors.name.message : ''}
                            {...register('name', { required: t('validations.location_name_is_required'), maxLength: 250 })}
                        />
                    </StyledFieldItem>
                    <StyledFieldItem>
                        <Controller
                            name="remote_location"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <Checkbox
                                    checked={value}
                                    onChange={(event) => {
                                        onChange(event.target.checked);
                                        if (event.target.checked) {
                                            unregister(['country', 'address', 'address_details', 'city', 'state', 'region', 'postal_code']);
                                        };
                                    }}
                                    label={t('components.selectWithLocationAdd.this_location_is_for_remote_employees')}
                                />
                            )}
                        />
                    </StyledFieldItem>
                    {!watchRemoveLocation && <Fragment>
                        <StyledFieldItem style={{ width: '65%' }}>
                            <label>{t('employee.address.country')}<sup>*</sup></label>
                            <Controller
                                name="country"
                                control={control}
                                rules={{ required: t('validations.country_is_required') }}
                                render={({ field: { onChange, value } }) => (
                                    <SelectDropdown
                                        onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
                                            onChange(newValue)
                                        }}
                                        value={value}
                                        inputPlaceholder={t('createPerson.select_country')}
                                        loadRemoteData={() => getCountryList(300, 1)}
                                        errorText={errors.country ? errors.country.message : ''}
                                    />
                                )}
                            />
                        </StyledFieldItem>
                        <StyledFieldItem style={{ width: '65%' }}>
                            <label>{t('employee.address.address_line_one')}<sup>*</sup></label>
                            <UniversalInput
                                {...register('address', { required: t('validations.address_line_one_is_required') })}
                                errorText={errors.address ? errors.address.message : ''}
                                placeholder={t('employee.address.street_address_example')}
                            />
                        </StyledFieldItem>
                        <StyledFieldItem style={{ width: '65%' }}>
                            <label>{t('employee.address.address_line_two')}</label>
                            <UniversalInput
                                {...register('address_details')}
                                placeholder={t('employee.address.street_address_example_two')}
                            />
                        </StyledFieldItem>
                        <div style={{ display: 'flex' }}>
                            <StyledFieldItem style={{ width: '33%' }}>
                                <label>{t('employee.address.city')}<sup>*</sup></label>
                                <UniversalInput
                                    errorText={errors.city ? errors.city.message : ''}
                                    {...register('city', { required: t('validations.city_is_required') })}
                                />
                            </StyledFieldItem>
                            {watchCountry?.iso === 'US' ? <StyledFieldItem style={{ width: '33%' }}>
                                <label>{t('employee.address.state_province_region')}<sup>*</sup></label>
                                <Controller
                                    name="state"
                                    control={control}
                                    rules={{ required: t('validations.state_province_region_required') }}
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
                                />
                            </StyledFieldItem> : <StyledFieldItem style={{ width: '33%' }}>
                                <label>{t('employee.address.state_province_region')}<sup>*</sup></label>
                                <UniversalInput
                                    {...register('region', { required: t('validations.state_province_region_required') })}
                                    errorText={errors.region ? errors.region.message : ''}
                                />
                            </StyledFieldItem>}
                            <StyledFieldItem style={{ width: '33%' }}>
                                <label>{t('employee.address.postal_code')}<sup>*</sup></label>
                                <UniversalInput
                                    {...register("postal_code", { required: t('validations.zip_postal_code_required') })}
                                    errorText={errors.postal_code ? errors.postal_code.message : ""}
                                />
                            </StyledFieldItem>
                        </div>
                    </Fragment>}
                </Fragment>}
            </div>
        </DialogModal>
    )
};

const StyledFieldItem = styled.div`
    margin-bottom: 16px;
    margin-right: 10px;
    & sup {
        color: #C54343;
    }
    & > label {
        display: inline-block;
        margin-bottom: 6px;
    }
`;
