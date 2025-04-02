import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GridColumns,
  GridFilterModel,
  gridFilterModelSelector,
  GridInitialState,
  useGridApiContext,
} from '@mui/x-data-grid-premium';
import { orderBy, uniq } from 'lodash';
import styled from 'styled-components';

import DataGrid from 'components/DataLists/DataGrid';
import SelectDropdown from 'components/Dropdowns/SelectDropdown';
import useQueryCustom from 'hooks/useQueryCustom';
import { PaymentDocuments } from 'types';
import { getPeriod, toFormattedDate } from 'utils/date';
import { Actions } from './Actions';
import { currencyFormatter } from 'utils/number';
import { Section } from 'containers/Payroll/components/Section';

type SelectOption = {
  id: string | number;
  name: string;
};

type Filters = {
  types: SelectOption[];
  periods: SelectOption[];
  statuses: SelectOption[];
};

type CustomToolbarProps = {
  filters: Filters;
};

const initialState: GridInitialState = {
  sorting: {
    sortModel: [{ field: 'payment_date', sort: 'desc' }],
  },
};

const CustomToolbar = ({ filters }: CustomToolbarProps) => {
  const apiRef = useGridApiContext();
  const gridFilterModelItems: GridFilterModel['items'] = gridFilterModelSelector(apiRef).items;

  const typeSelectValue = useMemo(() => {
    const filterGridValue = gridFilterModelItems.find((e) => e.columnField === 'type')?.value;
    const result: SelectOption =
      filters.types.find((e) => e.id === filterGridValue) || filters.types[0];
    return result;
  }, [filters.types, gridFilterModelItems]);

  const periodSelectValue = useMemo(() => {
    const filterGridValue = gridFilterModelItems.find((e) => e.columnField === 'period')?.value;
    const result: SelectOption =
      filters.periods.find((e) => e.id === filterGridValue) || filters.periods[0];
    return result;
  }, [filters.periods, gridFilterModelItems]);

  const statusSelectValue = useMemo(() => {
    const filterGridValue = gridFilterModelItems.find((e) => e.columnField === 'status')?.value;
    const result: SelectOption =
      filters.statuses.find((e) => e.id === filterGridValue) || filters.statuses[0];
    return result;
  }, [filters.statuses, gridFilterModelItems]);

  const onChangeFilter = (value: SelectOption, type: 'type' | 'status' | 'period') => {
    if (value.id) {
      apiRef.current.upsertFilterItem({
        columnField: type,
        value: value.id,
        operatorValue: 'equals',
        id: `fltr_${type}`,
      });
    } else {
      apiRef.current.deleteFilterItem({ columnField: type, id: `fltr_${type}` });
    }
  };

  return (
    <FiltersContainer>
      <SelectDropdown
        size={'small'}
        value={typeSelectValue}
        onChange={(_, value) => onChangeFilter(value as SelectOption, 'type')}
        disableClearable
        options={filters.types}
        sx={{ width: 220 }}
      />
      <SelectDropdown
        size={'small'}
        value={periodSelectValue}
        onChange={(_, value) => onChangeFilter(value as SelectOption, 'period')}
        disableClearable
        options={filters.periods}
        sx={{ width: 200 }}
      />
      <SelectDropdown
        size={'small'}
        value={statusSelectValue}
        onChange={(_, value) => onChangeFilter(value as SelectOption, 'status')}
        disableClearable
        options={filters.statuses}
        sx={{ width: 150 }}
      />
    </FiltersContainer>
  );
};

export const PayHistory = () => {
  const { t } = useTranslation();

  const [filters, setFilters] = useState<Filters>({
    types: [{ id: 0, name: t('payroll.history_block.select.type') }],
    periods: [{ id: 0, name: t('payroll.history_block.select.period') }],
    statuses: [{ id: 0, name: t('payroll.history_block.select.status') }],
  });

  const { data, isLoading } = useQueryCustom<PaymentDocuments, { errors: string[] }>(
    ['payment_documents'],
    {
      endpoint: '/payment_document',
      options: {
        method: 'get',
      },
    },
    {
      onSuccess: (data) => {
        const typeIds = uniq(data.map((e) => e.payment_document_type.id));
        const statusIds = uniq(data.map((e) => e.payment_document_status.id));
        const periods = uniq(
          orderBy(
            data.filter((e) => !!e.period_start),
            ['period_start', 'period_end'],
            ['desc', 'desc']
          ).map((e) => `${e.period_start},${e.period_end}`)
        );
        setFilters((prev) => ({
          types: [
            prev.types[0],
            ...typeIds.map((id) => ({
              id,
              name: t(`enums.payment_document_type.${id}`),
            })),
          ],
          periods: [
            prev.periods[0],
            ...periods.map((period) => {
              const dates = period.split(',');
              return {
                id: period,
                name: getPeriod(dates[0], dates[1]),
              };
            }),
          ],
          statuses: [
            prev.statuses[0],
            ...statusIds.map((id) => ({
              id,
              name: t(`enums.payment_document_status.${id}`),
            })),
          ],
        }));
      },
      refetchOnWindowFocus: false,
    }
  );

  const columns = useMemo<GridColumns>(
    () => [
      {
        field: 'payment_date',
        type: 'date',
        valueFormatter: ({ value }) => toFormattedDate(value, 'd MMM, yyyy'),
        headerName: t('payroll.pay_date'),
        flex: 1,
      },
      {
        field: 'type',
        headerName: t('globaly.type'),
        renderCell: ({ row }) => row.payment_document_type.name,
        valueGetter: ({ row }) => row.payment_document_type.id,
        flex: 1,
      },
      {
        field: 'period',
        headerName: t('payroll.history_block.pay_period'),
        renderCell: ({ row }) =>
          row.period_start ? getPeriod(row.period_start, row.period_end) : '-',
        valueGetter: ({ row }) =>
          row.period_start ? `${row.period_start},${row.period_end}` : '-',
        flex: 1,
      },
      {
        field: 'status',
        headerName: t('globaly.status'),
        renderCell: ({ row }) => (
          <Status data-status={`${row.payment_document_status.id}`}>
            <span className="dot"></span>
            {row.payment_document_status.name}
          </Status>
        ),
        valueGetter: ({ row }) => row.payment_document_status.id,
        flex: 1,
      },
      {
        field: 'total_payroll_cost',
        type: 'number',
        valueGetter: ({ row, value }) =>
          currencyFormatter({ currency: row.currency.code, amount: value || 0 }),
        headerName: t('payroll.history_block.total_cost'),
        flex: 1,
      },
      {
        field: 'net_pay',
        type: 'number',
        valueGetter: ({ row, value }) =>
          currencyFormatter({ currency: row.currency.code, amount: value || 0 }),
        headerName: t('payroll.history_block.net_pay'),
        flex: 1,
      },
      {
        field: 'action',
        type: 'actions',
        headerName: t('globaly.action'),
        renderHeader: () => <></>,
        getActions: ({ row }) => {
          return [<Actions row={row} />];
        },
      },
    ],
    [t]
  );

  return (
    <Section style={{ height: '100%' }} title={t('payroll.history_block.title')}>
      <DataGrid
        name={'payment_documents'}
        saveGridState
        rows={data || []}
        columns={columns}
        initialState={initialState}
        loading={isLoading}
        disableQuickFilter
        disableColumnFilter
        disableColumnSelector
        disableColumnMenu
        rowHeight={50}
        noRowsOverlayText={t('payroll.history_block.no_payment')}
        components={{
          Toolbar: CustomToolbar,
        }}
        componentsProps={{
          toolbar: {
            filters,
          },
        }}
      />
    </Section>
  );
};

const FiltersContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;

  .MuiAutocomplete-inputRoot {
    height: 36px;
  }
  & > .MuiAutocomplete-root {
    .MuiFormControl-root {
      .MuiInputBase-root {
        & > div {
          button {
            padding: 3px 3px;
          }
        }
      }
    }
  }
`;

const Status = styled.div`
  color: var(--orange);
  .dot {
    width: 8px;
    height: 8px;
    margin-right: 5px;
    border-radius: 50%;
    display: inline-block;
    background: var(--orange);
  }

  &[data-status='approved'] {
    color: var(--green);
    .dot {
      background: var(--green);
    }
  }
  &[data-status='cancelled'] {
    color: #bebebe;
    .dot {
      background: #bebebe;
    }
  }
`;
