import React, { useState, Fragment, useMemo, memo, useCallback } from 'react';
import styled from 'styled-components';
import { useToasts } from 'react-toast-notifications';
import { useQueryClient } from 'react-query';
import { useTranslation } from "react-i18next";
import { isEmpty } from 'lodash';
import { useForm } from 'react-hook-form';
import Button from '@mui/material/Button';
import {
    GridColumns,
    GridToolbarContainer,
    GridToolbarQuickFilter,
    GridRenderCellParams,
    GridInitialState
} from "@mui/x-data-grid-premium";

import useQueryCustom from 'hooks/useQueryCustom';
import useMutationCustom from 'hooks/useMutationCustom';
import DialogModal from 'components/Modal/Dialog';
import TimeOfftypesModal from './TimeOfftypesModal';
import { LocationModal } from './LocationModal';
import UniversalInput from "../../../../components/Input/UniversalInput";
import { Template } from '../Template';
import { Actions } from '../Actions';
import { PaymentTypeModal } from './PaymentTypeModal';
import { EmploymentStatusModal } from './EmploymentStatusModal';

export interface DictionaryProps {
    addOrRemove?: boolean;
    endpoint: string;
    title: string;
    singularTitle: string;
    withChecking?: boolean;
    queryParams?: Record<string, string | number>;
}

export type EditModalState = { id: number } | null;
export type DeleteModalState = { id: number, name: string } | null;

type FormValues = {
    name: string;
};

const specialModalEndpoints = ['/time_off_type', '/location', '/payment_type', '/employment_status'];

const Dictionary: React.FC<DictionaryProps> = ({ addOrRemove = true, queryParams, ...props }) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [isOpen, setModalOpen] = useState<boolean>(false);
    const [editModalOpen, setEditModalOpen] = useState<EditModalState>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState<{ id: number, name: string } | null>(null);
    const { addToast } = useToasts();
    const { register, reset, handleSubmit, setError, setValue, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            name: '',
        }
    });

    const { data } = useQueryCustom<{ count: number, list: Array<{ id: number, name: string, deleted: boolean }> },
        { errors: [{ field: string, message: string, }] }>(
            ["get_dictionary"], {
            endpoint: props.endpoint,
            options: {
                method: 'get',
                body: {
                    order_direction: 'asc',
                    order: 'name',
                    ...queryParams,
                }
            },
        }, { cacheTime: 0, enabled: true });

    const createDictionaryOption = useMutationCustom<{}, { errors: [{ field: string, message: string, }] }, { name: string }>(
        ["create_dictionary"], {
        endpoint: props.endpoint,
        options: { method: "post" },
    }, {
        onSuccess: () => {
            setModalOpen(false);
            addToast(`${t('globaly.add_success', {title: props.singularTitle})}`, { appearance: 'success', autoDismiss: true });
            queryClient.invalidateQueries('get_dictionary');
            reset();
        },
        onError: (err) => {
            if (err?.errors[0].field) {
                err.errors.forEach((item: any) => {
                    setError(item.field, { type: 'custom', message: item.message });
                });
            };
        }
    });

    const updateDictionaryOption = useMutationCustom<{}, { errors: [{ field: string, message: string, }] }, { name: string }>(
        ["update_dictionary"], {
        endpoint: props.endpoint + `/${editModalOpen?.id}`,
        options: { method: "put" },
    }, {
        onSuccess: () => {
            setEditModalOpen(null);
            addToast(`${t('globaly.update_success', {title: props.singularTitle})}`, { appearance: 'success', autoDismiss: true });
            queryClient.invalidateQueries('get_dictionary');
            reset();
        },
        onError: (err) => {
            if (err?.errors[0].field) {
                err.errors.forEach((item: any) => {
                    setError(item.field, { type: 'custom', message: item.message });
                });
            };
        }
    });

    const initialState: GridInitialState = {
        sorting: {
            sortModel: [
                { field: 'name', sort: 'asc' }
            ],
        }
    };

    const onEdit = useCallback(({ id, name }: { id: number; name: string }) => {
        setEditModalOpen({ id });
        setValue('name', name);
    }, [setValue]);

    const renderAvatarCell = useCallback((params: GridRenderCellParams) => {
        return <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div>{params.row.name}</div>
            <Actions
                onDelete={!addOrRemove ? undefined : () => setDeleteModalOpen({ id: params.row.id, name: params.row.name })}
                onEdit={() => onEdit({ id: params.row.id, name: params.row.name })}
            />
        </div>
    }, [onEdit]);

    const columns = useMemo<GridColumns>(() => [
        {
            field: 'name',
            headerName: props.title,
            renderCell: (params) => renderAvatarCell(params),
            flex: 1
        }
    ], [props.title, renderAvatarCell]);

    const CustomToolbar = () => {
        return (
            <GridToolbarContainer>
                <GridToolbarQuickFilter
                    sx={quickFilterStyle}
                    variant="outlined"
                    placeholder={t('components.dataGrid.quick_filter_placeholder')}
                    size="small"
                    debounceMs={500}
                />
                {addOrRemove &&
                    <Button
                        onClick={(e) => { e.preventDefault(); setModalOpen(true); }}
                        type="button"
                        size='large'
                        variant='contained'
                        sx={{ width: 140, marginLeft: 'auto' }}
                    >
                        + {t('settings.new_item')}
                    </Button>
                }
            </GridToolbarContainer>
        )
    };

    const onSubmit = useCallback((data: FormValues) => {
        editModalOpen ? updateDictionaryOption.mutate(data) : createDictionaryOption.mutate(data);
    }, [createDictionaryOption, editModalOpen, updateDictionaryOption]);

    return (
        <Fragment>
            <Template
                components={{ Toolbar: CustomToolbar }}
                data={data?.list}
                deleteModalState={deleteModalOpen}
                setDeleteModalState={setDeleteModalOpen}
                columns={columns}
                initialState={initialState}
                onEdit={onEdit}
                refreshData={() => queryClient.invalidateQueries('get_dictionary')}
                {...props}
            />

            {(isOpen || !!editModalOpen) && !specialModalEndpoints.includes(props.endpoint) && <DialogModal
                open={(isOpen || !!editModalOpen) && props.endpoint !== '/location'}
                title={(isOpen ? t('dictionaries.add') : t('dictionaries.edit')) + ' ' + props.singularTitle}
                onClose={() => { updateDictionaryOption.reset(); createDictionaryOption.reset(); reset(); editModalOpen ? setEditModalOpen(null) : setModalOpen(false) }}
                actionButton={handleSubmit(onSubmit)}
                withButtons
                cancelButtonText={t('globaly.cancel')}
                actionButtonText={t('globaly.save')}
                actionLoading={updateDictionaryOption.isLoading || createDictionaryOption.isLoading}
                upperPosition
                fullWidth
            >
                <div style={{ paddingBlock: 10 }}>
                    <InputTitle>{props.singularTitle}<sup>*</sup></InputTitle>
                    <UniversalInput
                        autoFocus
                        placeholder={t('dictionaries.placeholder', { title: props.singularTitle })}
                        errorText={errors.name ? errors.name.message : ''}
                        {...register('name', { required: t('validations.is_required', { attribute: props.singularTitle }) })}
                    />
                </div>
            </DialogModal>}

            {props.endpoint === '/time_off_type' && 
                <TimeOfftypesModal 
                    singularTitle={props.singularTitle} 
                    isOpen={isOpen}
                    endpoint={props.endpoint}
                    isEditMode={editModalOpen}
                    timeOfftypeId={!isEmpty(editModalOpen) ? editModalOpen?.id : null}
                    refreshData={() => queryClient.invalidateQueries('get_dictionary')}
                    onCloseModal={() => editModalOpen ? setEditModalOpen(null) : setModalOpen(false)}
                /> 
            }
            {props.endpoint === '/location' && 
                <LocationModal 
                    singularTitle={props.singularTitle} 
                    isOpen={isOpen}
                    endpoint={props.endpoint}
                    editModalState={editModalOpen}
                    refreshData={() => queryClient.invalidateQueries('get_dictionary')}
                    onCloseModal={() => editModalOpen ? setEditModalOpen(null) : setModalOpen(false)}
                /> 
            }
            {props.endpoint === '/payment_type' && editModalOpen &&
                <PaymentTypeModal
                    id={editModalOpen.id}
                    onClose={() => setEditModalOpen(null)}
                    refreshData={() => queryClient.invalidateQueries('get_dictionary')}
                    title={props.singularTitle} 
                /> 
            }
            {props.endpoint === '/employment_status' && (editModalOpen || isOpen) &&
                <EmploymentStatusModal
                    id={editModalOpen?.id}
                    onClose={() => editModalOpen ? setEditModalOpen(null) : setModalOpen(false)}
                    refreshData={() => queryClient.invalidateQueries('get_dictionary')}
                    title={props.singularTitle} 
                /> 
            }
        </Fragment>
    );
};

export default memo(Dictionary, (prevProps, nextProps) => {
    return prevProps.title !== nextProps.title;
});

const quickFilterStyle = {
    padding: 0,
    width: 440,
    '& input': { padding: '10px 5px' },
    '.MuiButtonBase-root': {
        padding: '5px !important',
        '&:hover': {
            backgroundColor: 'transparent !important',
            'path': { fill: '#636363 !important' }
        },
    },
};

const InputTitle = styled('p')`
    margin-bottom: 8px;
    text-transform: capitalize;
    & > sup {
        color: #C54343;
    }
`;
