import React, { useState, Fragment, useMemo } from 'react';
import { useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import { GridInitialState } from '@mui/x-data-grid-pro';
import { GridColumns, GridRowParams } from '@mui/x-data-grid-premium';

import useQueryCustom from 'hooks/useQueryCustom';
import { BenefitModal } from './BenefitModal';
import { Template } from '../Template';
import { DeleteModalState, DictionaryProps, EditModalState } from '../Dictionary';
import { Actions } from '../Actions';
import { dateFormat } from 'lib/DateFormat';
import { Benefit } from 'types';

export const Benefits = ({ ...props }: DictionaryProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isOpen, setModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<EditModalState>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState<DeleteModalState>(null);

  const { data: initialData } = useQueryCustom<
    { count: number; list: Array<Benefit> },
    { errors: [{ field: string; message: string }] }
  >(
    ['get_benefits'],
    {
      endpoint: props.endpoint,
      options: { method: 'get' },
    },
    { cacheTime: 0, enabled: true }
  );

  const initialState: GridInitialState = {
    sorting: {
      sortModel: [
        { field: 'start_on', sort: 'desc' },
      ],
    },
    columns: {
      columnVisibilityModel: {},
    },
  };

  const columns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: props.singularTitle,
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'benefit_type',
        headerName: t('settings.benefit.type'),
        renderCell: (params) => params.value.name,
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'coverage_type',
        headerName: t('settings.benefit.coverage_type'),
        renderCell: (params) => params.value.name,
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'total_cost',
        headerName: t('settings.benefit.total_cost'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'combined_pays',
        headerName: t('settings.benefit.combined_pays'),
        minWidth: 150,
        flex: 1,
      },
      {
        field: 'status',
        type: 'singleSelect',
        valueOptions: [t('enums.active'), t('enums.inactive')],
        headerName: t('settings.benefit.status'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'start_on',
        type: 'date',
        headerName: t('settings.benefit.start_date'),
        renderCell: (params) => dateFormat(params.value),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'end_on',
        type: 'date',
        headerName: t('settings.benefit.end_date'),
        renderCell: (params) => (params.value ? dateFormat(params.value) : undefined),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'action',
        type: 'actions',
        headerName: t('globaly.action'),
        renderHeader: () => (<></>),
        getActions: (params: GridRowParams) => [
          <Actions
            onDelete={() => setDeleteModalOpen({ id: params.row.id, name: params.row.name })}
            onEdit={() => setEditModalOpen({ id: params.row.id })}
          />,
        ],
      },
    ],
    [props.singularTitle, t]
  );

  const data = useMemo(
    () =>
      initialData?.list.map((record) => ({
        ...record,
        total_cost: `${record.currency.symbol} ${Number(record.total_cost).toFixed(2)}`,
        combined_pays: `
            ${record.currency.symbol}
            ${Number(record.employee_pays).toFixed(2)} / ${record.currency.symbol} ${Number(
          record.company_pays
        ).toFixed(2)}
        `,
      })),
    [initialData]
  );

  return (
    <Fragment>
      <Template
        columns={columns}
        data={data}
        deleteModalState={deleteModalOpen}
        setDeleteModalState={setDeleteModalOpen}
        initialState={initialState}
        onAdd={() => setModalOpen(true)}
        onEdit={setEditModalOpen}
        refreshData={() => queryClient.invalidateQueries('get_benefits')}
        {...props}
      />
      <BenefitModal
        singularTitle={props.singularTitle}
        isOpen={isOpen}
        endpoint={props.endpoint}
        editModalState={editModalOpen}
        refreshData={() => queryClient.invalidateQueries('get_benefits')}
        onCloseModal={() => (editModalOpen ? setEditModalOpen(null) : setModalOpen(false))}
      />
    </Fragment>
  );
};
