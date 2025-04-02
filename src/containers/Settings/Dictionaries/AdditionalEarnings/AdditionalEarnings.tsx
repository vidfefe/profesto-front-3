import React, { useState, Fragment, useMemo, useEffect, useCallback } from 'react';
import { useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import { GridComparatorFn, GridInitialState, GridRowParams } from '@mui/x-data-grid-pro';
import { GridColumns } from '@mui/x-data-grid-premium';

import useQueryCustom from 'hooks/useQueryCustom';
import { Template } from '../Template';
import { DeleteModalState, DictionaryProps, EditModalState } from '../Dictionary';
import { AdditionalEarning } from 'types';
import { AdditionalEarningModal } from './AdditionalEarningModal';
import { Actions } from '../Actions';
import { getEnum } from 'services';

export const AdditionalEarnings = ({ ...props }: DictionaryProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isOpen, setModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<EditModalState>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState<DeleteModalState>(null);

  const [additionalEarningStatuses, setAdditionalEarningStatuses] = useState<
    AdditionalEarning['status'][]
  >([]);

  useEffect(() => {
    getEnum('Enum::AdditionalEarningStatus').then((res) => setAdditionalEarningStatuses(res.data));
  }, []);

  const { data } = useQueryCustom<
    { count: number; list: Array<AdditionalEarning> },
    { errors: [{ field: string; message: string }] }
  >(
    ['get_additional_earnings'],
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
        headerName: t('settings.additionalEarning.name'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'status',
        type: 'singleSelect',
        valueOptions: additionalEarningStatuses.map((status) => status.name),
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
    [additionalEarningStatuses, statusComparator, t]
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
        refreshData={() => queryClient.invalidateQueries('get_additional_earnings')}
        {...props}
      />
      <AdditionalEarningModal
        singularTitle={props.singularTitle}
        isOpen={isOpen}
        editModalState={editModalOpen}
        refreshData={() => queryClient.invalidateQueries('get_additional_earnings')}
        onCloseModal={() => (editModalOpen ? setEditModalOpen(null) : setModalOpen(false))}
      />
    </Fragment>
  );
};
