import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GRID_AGGREGATION_FUNCTIONS,
  GridColDef,
  GridComparatorFn,
  GridRenderCellParams,
  GridSortModel,
} from '@mui/x-data-grid-premium';
import { GridInitialStatePremium } from '@mui/x-data-grid-premium/models/gridStatePremium';
import { Button, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { ReactComponent as RotateIcon } from 'assets/svg/rotate_right.svg';

import DataGrid from 'components/DataLists/DataGrid';
import PermissionGate from 'permissions/PermissionGate';
import EmployeeCard from 'components/Employee/Card';
import { advanceSum, sum, totalSum, uniq } from './aggregationFunctions';
import {
  AdvancePayment,
  Employee,
  PaymentBenefit,
  PaymentDocumentStatus,
  PaymentDocumentType,
  PaymentEarning,
  PaymentSummary,
} from 'types';
import { RecalculateModal } from './RecalculateModal';
import { ExportButton } from './ExportButton';
import { Header, HeaderProps } from './Header';
import { getTableStyle } from './style';
import { aggregationRowHeight } from './consts';

type TableProps = {
  initialColumns: GridColDef[];
  data?: Array<PaymentEarning | PaymentBenefit | PaymentSummary | AdvancePayment>;
  dataLoading: boolean;
  loading?: boolean;
  initialState: GridInitialStatePremium;
  documentStatus: PaymentDocumentStatus | undefined;
  documentType: PaymentDocumentType;
  addButtonConfig?: {
    action: () => void;
    title: string;
  };
} & HeaderProps;

const renderAvatarCell = (params: GridRenderCellParams) => {
  if (params.aggregation) {
    return params.value || '';
  }
  return params.row.employee?.first_name ? (
    <PermissionGate on="employee" properties={{ disabled: true }}>
      <EmployeeCard
        additionalInfoStyle={{ fontSize: 10.5 }}
        fontSize={12}
        employee={params.row.employee}
      />
    </PermissionGate>
  ) : (
    ''
  );
};

export const Table = ({
  data,
  dataLoading,
  loading,
  initialColumns,
  initialState,
  documentStatus,
  documentType,
  addButtonConfig,
  ...headerProps
}: TableProps) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const [openModal, setOpenModal] = useState(false);
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'employee', sort: 'asc' },
    { field: 'period_start', sort: 'asc' },
  ]);

  const onSortModelChange = useCallback((sortModel: GridSortModel) => {
    const model: GridSortModel = [
      ...sortModel.filter((model) => model.field !== 'period_start'),
      { field: 'period_start', sort: 'asc' },
    ];
    setSortModel(model);
  }, []);

  const isDraft = documentStatus === PaymentDocumentStatus.DRAFT;

  const sortComparator: GridComparatorFn<Employee> = useCallback((v1, v2) => {
    const firstFullName = `${v1.first_name} ${v1.last_name}`.trim();
    const secondFullName = `${v2.first_name} ${v2.last_name}`.trim();
    return firstFullName.localeCompare(secondFullName);
  }, []);

  const columns = useMemo(() => {
    const result: GridColDef[] = [
      {
        field: 'employee',
        headerName: t('employee.employee'),
        cellClassName: 'employee',
        renderCell: (params) => renderAvatarCell(params),
        valueFormatter: ({ value }) => `${value?.first_name} ${value?.last_name}`,
        sortComparator,
        getApplyQuickFilterFn: (value: string) => (params) =>
          params.formattedValue &&
          params.formattedValue.toLowerCase().includes(value.toLowerCase()),
        filterable: false,
        minWidth: 160,
        flex: 1,
      },
      {
        field: 'employee_name',
        headerName: t('employee.employee'),
        valueGetter: ({ row }) => `${row.employee?.first_name} ${row.employee?.last_name}`,
        getApplyQuickFilterFn: undefined,
      },
      {
        field: 'period_start',
        filterable: false,
        valueGetter: ({ row }) => row.earning?.period_start || row.period_start,
        getApplyQuickFilterFn: undefined,
      },
      {
        field: 'personal_number',
        headerName: t('employee.personal_number'),
        valueGetter: ({ row }) => row.employee.personal_number,
        getApplyQuickFilterFn: undefined,
      },
      {
        field: 'job_title',
        headerName: t('employee.job.job_title'),
        valueGetter: ({ row }) => row.employee.job_title_name,
        getApplyQuickFilterFn: undefined,
      },
      {
        field: 'department',
        headerName: t('employee.job.department'),
        valueGetter: ({ row }) => row.employee.department_name,
        getApplyQuickFilterFn: undefined,
      },
      ...initialColumns.map((initialColumn) => ({
        ...initialColumn,
        filterable: false,
        sortable: false,
        getApplyQuickFilterFn: undefined,
      })),
    ];
    return result;
  }, [initialColumns, sortComparator, t]);

  const state = useMemo(() => {
    const result: GridInitialStatePremium = {
      aggregation: {
        model: {
          employee: 'uniq',
          ...initialState.aggregation?.model,
        },
      },
      columns: {
        columnVisibilityModel: {
          employee_name: false,
          period_start: false,
          personal_number: false,
          job_title: false,
          department: false,
        },
      },
      pinnedColumns: {
        left: ['employee'],
        right: initialState.pinnedColumns?.right,
      },
    };
    return result;
  }, [initialState.aggregation?.model, initialState.pinnedColumns?.right]);

  return dataLoading || !data ? (
    <LoadingContainer>
      <CircularProgress size={24} />
    </LoadingContainer>
  ) : (
    <Container>
      <Header {...headerProps} />
      <DataGrid
        rows={data}
        columns={columns}
        initialState={state}
        experimentalFeatures={{ aggregation: true, newEditingApi: true }}
        isCellEditable={() => isDraft}
        disableColumnSelector
        disableColumnMenu
        disableSelectionOnClick
        loading={loading}
        hideFooter={true}
        showCellRightBorder
        quickFilterPlaceholder={t('payroll.payment_document.search_placeholder')}
        enableExports
        customExportButton={<ExportButton documentId={id} documentType={documentType} />}
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        headerHeight={aggregationRowHeight}
        rowHeight={50}
        aggregationFunctions={{
          ...GRID_AGGREGATION_FUNCTIONS,
          totalSum,
          uniq,
          sum,
          advanceSum,
        }}
        onAdd={addButtonConfig?.action}
        addButtonText={addButtonConfig?.title}
        sx={getTableStyle(!!loading)}
        customButton={
          isDraft &&
          documentType === PaymentDocumentType.REGULAR_PAYROLL && (
            <Recalculate
              startIcon={<RotateIcon />}
              variant={'text'}
              onClick={() => setOpenModal(true)}
            >
              {t('payroll.payment_document.recalculate')}
            </Recalculate>
          )
        }
      />
      {openModal && <RecalculateModal onClose={() => setOpenModal(false)} id={Number(id)} />}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 10px;
`;

const Recalculate = styled(Button)`
  background: unset !important;
  &:hover {
    background: var(--light-green) !important;
    color: var(--green) !important;

    path {
      fill: var(--green) !important;
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
