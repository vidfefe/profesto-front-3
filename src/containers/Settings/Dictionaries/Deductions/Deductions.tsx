import React, { useState, Fragment, useMemo, useEffect, useCallback } from 'react';
import { useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import { GridComparatorFn, GridInitialState, GridRowParams } from '@mui/x-data-grid-pro';
import { GridColumns } from '@mui/x-data-grid-premium';

import useQueryCustom from 'hooks/useQueryCustom';
import { Template } from '../Template';
import { DeleteModalState, DictionaryProps, EditModalState } from '../Dictionary';
import { Deduction } from 'types';
import { DeductionModal } from './DeductionModal';
import { Actions } from '../Actions';
import { getEnum } from 'services';

export const Deductions = ({ ...props }: DictionaryProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isOpen, setModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<EditModalState>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState<DeleteModalState>(null);
  const [deductionStatuses, setDeductionStatuses] = useState<Deduction['status'][]>([]);

  useEffect(() => {
    getEnum('Enum::DeductionStatus').then((res) => setDeductionStatuses(res.data));
  }, []);

  const { data } = useQueryCustom<
    { count: number; list: Array<Deduction> },
    { errors: [{ field: string; message: string }] }
  >(
    ['get_deductions'],
    {
      endpoint: props.endpoint,
      options: { method: 'get' },
    },
    { refetchOnWindowFocus: false }
  );

  const statusComparator: GridComparatorFn<string> = useCallback(
    (v1, v2) => {
      if (v1 === v2) return 0;
      if (t('enums.active') === v1 || t('enums.active') !== v2) {
        return -1;
      } else if (t('enums.active') === v2 || t('enums.active') !== v1) {
        return 1;
      }
      return 0;
    },
    [t]
  );

  const columns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: t('settings.deduction.name'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'status',
        type: 'singleSelect',
        valueOptions: deductionStatuses.map((status) => status.name),
        headerName: t('globaly.status'),
        valueGetter: ({ value }) => value.name,
        sortComparator: statusComparator,
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'action',
        type: 'actions',
        headerName: t('globaly.action'),
        renderHeader: () => <></>,
        getActions: (params: GridRowParams) => [
          <Actions
            onDelete={() => setDeleteModalOpen({ id: params.row.id, name: params.row.name })}
            onEdit={() => setEditModalOpen({ id: params.row.id })}
          />,
        ],
      },
    ],
    [t, deductionStatuses, statusComparator]
  );

  const initialState: GridInitialState = {
    sorting: {
      sortModel: [
        { field: 'status', sort: 'asc' },
        { field: 'name', sort: 'asc' },
      ],
    },
    columns: {
      columnVisibilityModel: {},
    },
  };

  return (
    <Fragment>
      <Template
        disableColumnSelector
        columns={columns}
        data={data?.list}
        deleteModalState={deleteModalOpen}
        setDeleteModalState={setDeleteModalOpen}
        initialState={initialState}
        onAdd={() => setModalOpen(true)}
        onEdit={setEditModalOpen}
        refreshData={() => queryClient.invalidateQueries('get_deductions')}
        {...props}
      />
      <DeductionModal
        singularTitle={props.singularTitle}
        isOpen={isOpen}
        editModalState={editModalOpen}
        refreshData={() => queryClient.invalidateQueries('get_deductions')}
        onCloseModal={() => (editModalOpen ? setEditModalOpen(null) : setModalOpen(false))}
      />
    </Fragment>
  );
};
