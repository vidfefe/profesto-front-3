import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { currentUserSelector } from 'redux/selectors';
import { useTranslation } from 'react-i18next';
import { isEmpty } from 'lodash';
import format from 'date-fns/format';
import styled from 'styled-components';
import {
  GridColDef,
  GridInitialState,
  GridRenderCellParams,
  GridExceljsProcessInput,
  GridState,
} from '@mui/x-data-grid-premium';
import _ from 'lodash';

import DataGrid from 'components/DataLists/DataGrid';
import { PageHeaderTitle } from 'components/DesignUIComponents';
import EmployeeCard from 'components/Employee/Card';
import PermissionGate from 'permissions/PermissionGate';
import useMutationCustom from 'hooks/useMutationCustom';
import { dateFormat } from 'lib/DateFormat';
import DatePicker from 'components/DatePickers/DatePicker';
import { MonthChnagesReport } from 'types';
import { toFormattedDate } from 'utils/date';

const renderAvatarCell = (params: GridRenderCellParams, type: string) => {
  return params.row[type]?.first_name ? (
    <PermissionGate on="employee" properties={{ disabled: true }}>
      <EmployeeCard fontSize={12} employee={params.row[type]} />
    </PermissionGate>
  ) : (
    ''
  );
};

const renderDate = (params: GridRenderCellParams) => {
  if (params.row.start_date && params.row.end_date) {
    return `${dateFormat(new Date(params.row.start_date))} - ${dateFormat(
      new Date(params.row.end_date)
    )}`;
  }
  return params.value && dateFormat(new Date(params.value));
};

export const MonthChanges = () => {
  const { t } = useTranslation();
  const [recordsCount, setRecordsCount] = useState(0);
  const [list, setList] = useState<MonthChnagesReport[]>([]);

  const columns = useMemo(() => {
    const result: GridColDef[] = [
      {
        field: 'change_type',
        headerName: t('reports.month_changes.change_type'),
        type: 'singleSelect',
        valueOptions: Object.values(t('enums.change_type', { returnObjects: true })),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'employee',
        headerName: t('employee.employee'),
        renderCell: (params) => renderAvatarCell(params, 'employee'),
        valueGetter: ({ value }) => `${value.first_name} ${value.last_name}`,
        minWidth: 150,
        flex: 1,
      },
      {
        field: 'first_name',
        headerName: t('employee.first_name'),
        valueGetter: ({ row }) => row.employee.first_name,
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'last_name',
        headerName: t('employee.last_name'),
        valueGetter: ({ row }) => row.employee.last_name,
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'personal_number',
        headerName: t('employee.personal_number'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'employee_id',
        headerName: t('employee.short_emp_id'),
        valueGetter: ({ row }) => row.employee.id,
        minWidth: 60,
        flex: 0.3,
      },
      {
        field: 'mobile_phone',
        headerName: t('reports.month_changes.mobile_phone'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'start_date',
        headerName: t('reports.month_changes.date'),
        valueGetter: renderDate,
        filterable: false,
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'prev_job_title',
        headerName: t('reports.month_changes.previous_job_title'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'job_title',
        headerName: t('employee.job.job_title'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'prev_department',
        headerName: t('reports.month_changes.previous_department'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'department',
        headerName: t('employee.job.department'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'prev_salary_net',
        headerName: t('reports.month_changes.previous_salary', { type: 'Net' }),
        renderCell: ({ row, value }) =>
          !_.isNil(value) && `${row.prev_currency.symbol} ${value.toFixed(2)}`,
        type: 'number',
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'salary_net',
        headerName: t('reports.month_changes.salary', { type: 'Net' }),
        renderCell: ({ row, value }) =>
          !_.isNil(value) && `${row.currency.symbol} ${value.toFixed(2)}`,
        type: 'number',
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'prev_salary_gross',
        headerName: t('reports.month_changes.previous_salary', { type: 'Gross' }),
        renderCell: ({ row, value }) =>
          !_.isNil(value) && `${row.prev_currency.symbol} ${value.toFixed(2)}`,
        type: 'number',
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'salary_gross',
        headerName: t('reports.month_changes.salary', { type: 'Gross' }),
        renderCell: ({ row, value }) =>
          !_.isNil(value) && `${row.currency.symbol} ${value.toFixed(2)}`,
        type: 'number',
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'prev_currency',
        headerName: t('reports.month_changes.prev_currency'),
        valueGetter: ({ value }) => value?.code,
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'currency',
        headerName: t('globaly.currency'),
        valueGetter: ({ value }) => value?.code,
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'prev_employment_status',
        headerName: t('reports.month_changes.previous_employment_status'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'employment_status',
        headerName: t('employee.employment_status'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'bank_account',
        headerName: t('jobInfo.bank_account'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'reason',
        headerName: t('employee.job.reason'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'comment',
        headerName: t('globaly.comment'),
        minWidth: 100,
        flex: 1,
      },
    ];
    return result;
  }, [t]);

  const [month, setMonth] = useState(new Date());

  useEffect(() => {
    getMonthChangesList({
      month,
    });
  }, [month]);

  const columnsSetup = useMemo(
    () =>
      columns.map((column) => {
        if (column.field === 'prev_salary_net') {
          return {
            ...column,
            getApplyQuickFilterFn: undefined,
          };
        } else if (column.field === 'prev_salary_gross') {
          return {
            ...column,
            getApplyQuickFilterFn: undefined,
          };
        } else if (column.field === 'salary_net') {
          return {
            ...column,
            getApplyQuickFilterFn: undefined,
          };
        } else if (column.field === 'salary_gross') {
          return {
            ...column,
            getApplyQuickFilterFn: undefined,
          };
        }
        return column;
      }),
    [columns]
  );

  const { mutate: getMonthChangesList, isLoading } = useMutationCustom<
    MonthChnagesReport[],
    {},
    {}
  >(
    ['month_changes'],
    {
      endpoint: '/reports/month_change',
      options: { method: 'post' },
    },
    {
      onSuccess: (data) => {
        setList(data);
      },
    }
  );

  const currentUser = useSelector(currentUserSelector);

  const initialState: GridInitialState = {
    filter: {},
    sorting: {
      sortModel: [
        { field: 'change_type', sort: 'asc' },
        { field: 'start_date', sort: 'asc' },
      ],
    },
    columns: {
      columnVisibilityModel: {
        currency: false,
        employee: false,
        employee_id: false,
        mobile_phone: false,
        prev_currency: false,
        prev_job_title: false,
        prev_department: false,
        prev_employment_status: false,
      },
    },
  };

  const exceljsPreProcess = ({ workbook, worksheet }: GridExceljsProcessInput): any => {
    workbook.creator = 'Profesto';
    workbook.created = new Date();
    worksheet.properties.defaultRowHeight = 30;

    worksheet.getCell('A1').value = t('reports.list.month_changes');
    worksheet.getCell('A1').font = {
      name: 'Arial Black',
      bold: true,
      size: 12,
    };
    worksheet.getCell('A1').alignment = {
      vertical: 'top',
      horizontal: 'left',
      wrapText: true,
    };
    worksheet.getCell('A2').value = currentUser.company.name;
    worksheet.getCell('A2').font = {
      name: 'Arial',
      size: 10,
    };
    worksheet.getCell('A3').value = format(new Date(), 'MM.dd.yyyy HH:mm:ss');
    worksheet.getCell('A3').font = { name: 'Arial', size: 10 };

    worksheet.getCell('A5').value =
      t('reports.benefits.period') + ': ' + toFormattedDate(month, 'MMMM yyyy');
    worksheet.getCell('A5').font = { name: 'Arial', size: 10 };
  };

  const exceljsPostProcess = ({ worksheet }: GridExceljsProcessInput): any => {
    worksheet.getRow(6).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'cccccc' },
    };
    worksheet.getRow(6).font = {
      size: 12,
      bold: true,
    };
    worksheet.getRow(6).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    worksheet.getColumn('prev_salary_net').numFmt = '0.00';
    worksheet.getColumn('salary_net').numFmt = '0.00';
    worksheet.getColumn('prev_salary_gross').numFmt = '0.00';
    worksheet.getColumn('salary_gross').numFmt = '0.00';
  };

  const onGridStateChange = ({
    filter: { filteredRowsLookup },
    rows: { idRowsLookup },
  }: GridState) => {
    if (!isEmpty(filteredRowsLookup)) {
      const filteredRowsIds = Object.keys(filteredRowsLookup).filter(
        (key) => filteredRowsLookup[key]
      );
      let rows = Object.keys(idRowsLookup)
        .map((key) => filteredRowsIds.includes(key) && idRowsLookup[key])
        .filter((row) => row);
      const count = rows.length;
      setRecordsCount(count);
    } else {
      let count = list.length;
      setRecordsCount(count);
    }
  };

  const CustomNoResultsOverlay = () => {
    const { t } = useTranslation();
    return (
      <StyledCustomNoRowsContainer>
        <p>{t('components.dataGrid.many_great_matches')}</p>
        <p>{t('components.dataGrid.searching_another_values')}</p>
      </StyledCustomNoRowsContainer>
    );
  };

  return (
    <>
      <PageHeaderTitle title={t('reports.month_changes.count', { count: recordsCount })} />
      <div
        style={{
          display: 'flex',
          height: '85%',
          margin: '20px 50px',
          flexDirection: 'column',
        }}
      >
        <DataGrid
          name="month_changes_report"
          saveGridState
          components={{
            NoRowsOverlay: CustomNoResultsOverlay,
          }}
          disableRowGrouping
          onStateChange={onGridStateChange}
          loading={isLoading}
          rows={list}
          columns={columnsSetup}
          initialState={initialState}
          customFilter={
            <DatePicker
              selected={new Date(month)}
              onChange={(value) => {
                const date = new Date(value!);
                setMonth(date);
              }}
              dateFormat="MMMM yyyy"
              showMonthYearPicker
              customInput={null}
              todayButton={null}
              containerStyle={{ marginRight: 10 }}
            />
          }
          enableExports
          excelOptions={{
            exceljsPreProcess,
            exceljsPostProcess,
            fileName: `${format(new Date(), "yyyy-MM-dd'T'HH:mm")} - Profesto - ${t(
              'reports.list.month_changes'
            )}`,
          }}
        />
      </div>
    </>
  );
};

const StyledCustomNoRowsContainer = styled.div`
  padding: 20px 30px;
  p {
    text-align: center; //left
    color: #00101a;
    &:first-of-type {
      font-weight: 600;
      font-size: 16px;
    }
    &:last-of-type {
      font-size: 12px;
    }
  }
`;
