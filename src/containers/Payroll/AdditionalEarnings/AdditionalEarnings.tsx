import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GridColumns,
  GridFilterModel,
  gridFilterModelSelector,
  GridInitialState,
  useGridApiContext,
} from '@mui/x-data-grid-premium';
import Tooltip from '@mui/material/Tooltip';
import { uniq } from 'lodash';
import styled from 'styled-components';

import DataGrid from 'components/DataLists/DataGrid';
import { ReactComponent as MessageIcon } from 'assets/svg/message.svg';
import SelectDropdown from 'components/Dropdowns/SelectDropdown';
import { toFormattedDate } from 'utils/date';
import { currencyFormatter } from 'utils/number';
import { Section } from 'containers/Payroll/components/Section';
import { useMockData } from './mockData';

type SelectOption = {
  id: string | number;
  name: string;
};

type Filters = {
  earnings: SelectOption[];
  types: SelectOption[];
  statuses: SelectOption[];
};

type CustomToolbarProps = {
  filters: Filters;
};

enum StatusOrder {
  Planned = 1,
  Current = 2,
  Finished = 3,
  Cancelled = 4,
}

const initialState: GridInitialState = {
  sorting: {
    sortModel: [
      { field: 'status', sort: 'asc' },
      { field: 'effective_date', sort: 'desc' },
    ],
  },
};

const CustomToolbar = ({ filters }: CustomToolbarProps) => {
  const apiRef = useGridApiContext();
  const gridFilterModelItems: GridFilterModel['items'] =
    gridFilterModelSelector(apiRef).items;

  const getFilterValue = useMemo(
    () => (field: string, options: SelectOption[]) => {
      const filterValue = gridFilterModelItems.find(
        (e) => e.columnField === field
      )?.value;
      if (field === 'status') {
        const statusText = Object.keys(StatusOrder).find(
          (key) =>
            StatusOrder[key as keyof typeof StatusOrder] === Number(filterValue)
        );
        return options.find((e) => e.id === statusText) || options[0];
      }

      return options.find((e) => e.id === Number(filterValue)) || options[0];
    },
    [gridFilterModelItems]
  );

  const onChangeFilter = (
    value: SelectOption,
    type: 'earning' | 'type' | 'status'
  ) => {
    if (value.id === '0' || !value.id) {
      apiRef.current.deleteFilterItem({
        columnField: type,
        id: `fltr_${type}`,
      });
    } else {
      apiRef.current.upsertFilterItem({
        columnField: type,
        value:
          type === 'status'
            ? String(StatusOrder[value.id as keyof typeof StatusOrder])
            : value.id.toString(),
        operatorValue: 'equals',
        id: `fltr_${type}`,
      });
    }
  };

  return (
    <FiltersContainer>
      <SelectDropdown
        size={'small'}
        value={getFilterValue('earning', filters.earnings)}
        onChange={(_, value) =>
          onChangeFilter(value as SelectOption, 'earning')
        }
        disableClearable
        options={filters.earnings}
        sx={{ width: 220 }}
      />
      <SelectDropdown
        size={'small'}
        value={getFilterValue('type', filters.types)}
        onChange={(_, value) => onChangeFilter(value as SelectOption, 'type')}
        disableClearable
        options={filters.types}
        sx={{ width: 200 }}
      />
      <SelectDropdown
        size={'small'}
        value={getFilterValue('status', filters.statuses)}
        onChange={(_, value) => onChangeFilter(value as SelectOption, 'status')}
        disableClearable
        options={filters.statuses}
        sx={{ width: 150 }}
      />
    </FiltersContainer>
  );
};

export const AdditionalEarnings = () => {
  const { t } = useTranslation();
  const mockData = useMockData();

  const earningsMapping = useMemo(() => {
    return {} as Record<string, number>;
  }, []);
  
  const typesMapping = useMemo(() => {
    return {} as Record<string, number>;
  }, []);
  
  mockData.forEach((data) => {
    if (!earningsMapping[data.earning]) {
      earningsMapping[data.earning] = Object.keys(earningsMapping).length + 1;
    }
    if (!typesMapping[data.type]) {
      typesMapping[data.type] = Object.keys(typesMapping).length + 1;
    }
  });

  const [filters, setFilters] = useState<Filters>({
    earnings: [
      {
        id: 0,
        name: t('payroll.additional_earnings_block.select.earning'),
      },
    ],
    types: [
      { id: 0, name: t('payroll.additional_earnings_block.select.type') },
    ],
    statuses: [
      { id: 0, name: t('payroll.additional_earnings_block.select.status') },
    ],
  });

  useEffect(() => {
    const earnings = uniq(mockData.map((e) => e.earning));
    const types = uniq(mockData.map((e) => e.type));
    const statuses = uniq(mockData.map((e) => e.status));

    setFilters((prev) => ({
      earnings: [
        prev.earnings[0],
        ...earnings.map((earning) => ({ id: earningsMapping[earning], name: earning })),
      ],
      types: [
        prev.types[0],
        ...types.map((type) => ({ id: typesMapping[type], name: type })),
      ],
      statuses: [
        prev.statuses[0],
        ...statuses.map((status) => ({
          id: status,
          name: t(`enums.additional_earning_status.${status.toLowerCase()}`),
        })),
      ],
    }));
  }, []);

  const columns = useMemo<GridColumns>(
    () => [
      {
        field: 'effective_date',
        type: 'date',
        valueFormatter: ({ value }) => toFormattedDate(value, 'd MMM, yyyy'),
        headerName: t('payroll.additional_earnings_block.effective_date'),
        flex: 1,
        headerAlign: 'right',
        align: 'right',
      },
      {
        field: 'earning',
        headerName: t('payroll.additional_earnings_block.earning'),
        renderCell: ({ row }) => {
          const earningName = Object.keys(earningsMapping).find(
            (key) => earningsMapping[key] === row.earning
          );
          return earningName || row.earning;
        },
        valueGetter: ({ row }) => earningsMapping[row.earning] || 0,
        flex: 1,
        headerAlign: 'right',
        align: 'right',
      },
      {
        field: 'type',
        headerName: t('globaly.type'),
        renderCell: ({ row }) => {
          const typeName = Object.keys(typesMapping).find(
            (key) => typesMapping[key] === row.type
          );
          return typeName || row.type;
        },
        valueGetter: ({ row }) => typesMapping[row.type] || 0,
        flex: 1,
        headerAlign: 'right',
        align: 'right',
      },
      {
        field: 'status',
        headerName: t('globaly.status'),
        renderCell: ({ row }) => (
          <Status data-status={`${row.status.toLowerCase()}`}>
            <span className='dot'></span>
            {t(`enums.additional_earning_status.${row.status.toLowerCase()}`)}
          </Status>
        ),
        valueGetter: ({ row }) =>
          StatusOrder[row.status as keyof typeof StatusOrder],
        flex: 1,
        headerAlign: 'right',
        align: 'right',
      },
      {
        field: 'end_date',
        type: 'date',
        valueFormatter: ({ value }) =>
          value ? toFormattedDate(value, 'd MMM, yyyy') : '-',
        headerName: t('payroll.additional_earnings_block.end_date'),
        flex: 1,
        headerAlign: 'right',
        align: 'right',
      },
      {
        field: 'net_amount',
        type: 'number',
        valueGetter: ({ row }) => {
          return currencyFormatter({
            currency: row.currency || 'GEL',
            amount: row.amount,
          });
        },
        headerName: t('payroll.additional_earnings_block.net_amount'),
        flex: 1,
        align: 'left',
        headerAlign: 'left',
      },
      {
        field: 'note',
        type: 'number',
        renderCell: ({ row }) =>
          row.note ? (
            <Tooltip title={row.note} enterDelay={200}>
              <StyledMessageIcon />
            </Tooltip>
          ) : (
            '-'
          ),
        headerName: t('payroll.additional_earnings_block.note'),
        flex: 1,
        align: 'right',
        headerAlign: 'right',
      },
    ],
    [t, earningsMapping, typesMapping]
  );

  return (
    <Section title={t('payroll.additional_earnings_block.title')}>
      <DataGrid
        name={'additional_earnings'}
        saveGridState
        rows={mockData || []}
        columns={columns}
        initialState={initialState}
        discardQueryStringSaveRestrict
        disableQuickFilter
        disableColumnFilter
        disableColumnSelector
        disableColumnMenu
        rowHeight={50}
        sx={{
          minHeight: 600,
          overflow: 'auto',
        }}
        noRowsOverlayText={t('payroll.additional_earnings_block.no_earning')}
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

  &[data-status='current'] {
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

  &[data-status='finished'] {
    color: black;
    .dot {
      background: black;
    }
  }
`;

const StyledMessageIcon = styled(MessageIcon)`
  &:hover {
    & > path {
      fill: #396;
    }
  }
`;
