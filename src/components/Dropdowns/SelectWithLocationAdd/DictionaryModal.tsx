import { Fragment, useEffect, useState } from "react";
import styled from '@mui/system/styled';
import DialogModal from "components/Modal/Dialog";
import { useToasts } from "react-toast-notifications";
import { Controller, useForm } from "react-hook-form";
import UniversalInput from "components/Input/UniversalInput";
import Checkbox from "components/Checkbox";
import SelectDropdown from "../SelectDropdown";
import { getCountryList, getStateList } from "services";
import { useTranslation } from "react-i18next";
import { region } from "lib/Regionalize";

function DictionaryModal({ open, setOpen, name, inputText, onValueChange, createRequest }: any) {
    const { t } = useTranslation();
    const { register, unregister, handleSubmit, watch, setValue, setError, control, formState: { errors }, reset } = useForm({
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
    const watchCountry: any = watch('country');
    const watchRemoveLocation = watch('remote_location');

    useEffect(() => {
        if (inputText) setValue('name', inputText)
    }, [inputText, setValue]);

    const { addToast } = useToasts();
    const [reqLoading, setReqLoading] = useState<boolean>(false);

    const humanizeName = () => {
        return name.charAt(0).toUpperCase() + name.slice(1)
            .replace(/^[\s_]+|[\s_]+$/g, '')
            .replace(/[_\s]+/g, ' ')
    };

    const dialogTitle = () => {
        if (region(['geo'])) {
            return t('components.selectWithAdd.add')+' '+name;
        }
        else {
            return t('components.selectWithAdd.name')+' '+humanizeName()
        }
    }

    const onSubmit = (data: any) => {
        setReqLoading(true);
        createRequest(data).then((res: any) => {
            setReqLoading(false);
            setOpen(false);
            onValueChange(res.data)
            addToast(`${humanizeName()} ${t('components.selectWithLocationAdd.added_successfully')}`, { appearance: 'success', autoDismiss: true });
        }).catch((err: any) => {
            setReqLoading(false);
            if (err?.response?.data?.errors[0].field) {
                addToast(err.response.data.errors[0].message, { appearance: 'error', autoDismiss: true });
                err.response.data.errors.forEach((item: any) => {
                    setError(item.field, { type: 'custom', message: item.message });
                });
            };
        })
    };

    return (
        <DialogModal
            open={open}
            onClose={() => { setOpen(false); reset(); }}
            title={dialogTitle()}
            actionButton={handleSubmit(onSubmit)}
            actionLoading={reqLoading}
            withButtons
            cancelButtonText={t('components.selectWithLocationAdd.add')}
            actionButtonText={t('components.selectWithLocationAdd.add')}
            disableAutoFocus
            upperPosition
        >
            <ModalContentContainer>
                <StyledFieldItem>
                    <label>{t('components.selectWithLocationAdd.location_name')}<sup>*</sup></label>
                    <UniversalInput
                        inputProps={{ maxLength: 250 }}
                        errorText={errors.name ? errors.name.message : ''}
                        {...register('name', { required: t('components.selectWithLocationAdd.location_name_is_required'), maxLength: 250 })}
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
                            rules={{ required: t('validations.country_required') }}
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
                            {...register('address', { required: t('validations.please_enter_address_line_one') })}
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
            </ModalContentContainer>
        </DialogModal>
    )

}
export default DictionaryModal;

const ModalContentContainer = styled('div')`
    display: flex;
    flex-direction: column;
    padding-block: 10px;
    max-width: 650px;
    min-width: 500px;
`;

const StyledFieldItem = styled('div')`
    margin-bottom: 20px;
    margin-right: 10px;
    & sup {
        color: #C54343;
    }
    & > label {
        display: inline-block;
        margin-bottom: 6px;
    }
`;