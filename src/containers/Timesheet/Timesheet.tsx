import { useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { isEmpty } from 'lodash';
import format from 'date-fns/format';
import styled from 'styled-components';
import {
  GridColDef,
  GridInitialState,
  GridRenderCellParams,
  GridState,
  GridRenderEditCellParams,
  useGridApiContext,
  GridValueSetterParams,
  GridColumnHeaderParams,
  GRID_CHECKBOX_SELECTION_COL_DEF,
  GridExceljsProcessInput,
  GridEventListener,
  useGridApiEventHandler,
} from '@mui/x-data-grid-premium';
import { Button } from '@mui/material';
import { NumberFormatValues, NumericFormat } from 'react-number-format';
import { useQueryClient } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';

import { ReactComponent as HolidayIcon } from 'assets/svg/holiday.svg';
import { ReactComponent as NoResultsIcon } from 'assets/svg/no-results.svg';
import { ReactComponent as CancelIcon } from 'assets/svg/close-circle.svg';
import { ReactComponent as CalendarCircle } from 'assets/svg/calendar-circle.svg';

import DataGrid from 'components/DataLists/DataGrid';
import { PageHeaderTitle } from 'components/DesignUIComponents';
import EmployeeCard from 'components/Employee/Card';
import PermissionGate from 'permissions/PermissionGate';
import { dateFormat } from 'lib/DateFormat';
import DatePicker from 'components/DatePickers/DatePicker';
import useQueryCustom from 'hooks/useQueryCustom';
import { Timesheet as TimesheetType, Time, TimesheetTimes } from 'types';
import SelectDropdown from 'components/Dropdowns/SelectDropdown';
import {
  getCompanyPermissionSettings,
  getCurrentUser,
  getDepartments,
  updateTimesheetTimes,
} from 'services';
import { Modal } from './Modal';
import { currentUserSelector } from 'redux/selectors';
import { setCurrentUser } from 'redux/authSlice';
import { usePermissionGate } from 'permissions/usePermissionGate';
import { useToasts } from 'react-toast-notifications';

type FilterState = {
  department: Department;
  date: Date;
};

type ModalState = {
  type: 'add' | 'delete';
  open: boolean;
};

type Department = {
  id: number;
  name: string;
};

const maxDaysInMonth = 31;
const additionalColumnsMapping = [
  'sum_days',
  'sum_hours',
  'overtime_hours',
  'night_hours',
  'holiday_hours',
  'other_hours',
];

const renderAvatarCell = (params: GridRenderCellParams, type: string) => {
  return params.row[type]?.first_name ? (
    <PermissionGate on="timesheet" properties={{ disabled: true }}>
      <EmployeeCard fontSize={11} employee={params.row[type]} />
    </PermissionGate>
  ) : (
    ''
  );
};

const renderCustomHeader = ({
  icon,
  title,
  subtitle,
}: {
  icon?: ReactNode;
  title: string;
  subtitle: string;
}) => (
  <div className="header">
    <div className="header_title">
      <DateDayTitle>{title}</DateDayTitle>
      <DateDaySubtitle>{subtitle}</DateDaySubtitle>
    </div>
    {icon}
  </div>
);

const getAllDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  return Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) =>
    format(new Date(year, month, i + 1), 'yyyy-MM-dd')
  );
};

const CustomEditComponent = (
  props: GridRenderEditCellParams & { hoursLimit?: boolean; refetchData: () => void }
) => {
  const { addToast } = useToasts();
  const { t } = useTranslation();

  const { id, value, field, hoursLimit = true, refetchData } = props;
  const apiRef = useGridApiContext();
  const [editValue, setEditValue] = useState(value);

  const handleValueChange = (values: NumberFormatValues) => {
    const newValue = values.value || null;
    setEditValue(newValue);
  };

  const handleEditStop: GridEventListener<'cellEditStop'> = useCallback(
    (params) => {
      apiRef.current.setEditCellValue({ id, field, value: editValue });

      if (typeof editValue === 'number' || editValue === '' || editValue === undefined)
        return false;

      const type = ['night_hours', 'overtime_hours', 'other_hours'].includes(params.field)
        ? params.field
        : 'work_hours';
      const date =
        type === 'work_hours'
          ? params.field
          : params.row.timesheet.findLast((element: TimesheetType) => element.active)?.day;

      updateTimesheetTimes({
        employee_id: params.row.employee.id,
        effective_date: new Date(date),
        [type]: editValue === null ? '' : editValue,
      }).catch((result) => {
        if (result.response.status === 403) {
          addToast(t('timesheet.permission_error'), {
            appearance: 'error',
            autoDismiss: true,
            placement: 'top-center',
          });
          refetchData();
        }
      });
    },
    [t, apiRef, id, field, editValue, refetchData, addToast]
  );

  useEffect(() => {
    const unregister = apiRef.current.subscribeEvent('cellEditStop', handleEditStop);
    return () => unregister();
  }, [apiRef, handleEditStop]);

  return (
    <CustomNumericFormat
      autoFocus
      onValueChange={handleValueChange}
      value={editValue}
      decimalSeparator="."
      decimalScale={2}
      valueIsNumericString
      allowNegative={false}
      isAllowed={(values) => {
        const { floatValue } = values;
        if (!floatValue) return true;
        return floatValue > 0 && hoursLimit ? floatValue <= 24 : true;
      }}
    />
  );
};

const CustomDateCell = ({ text }: { text: string }) => {
  const apiRef = useGridApiContext();

  const handleSingleClickForDateCell: GridEventListener<'cellClick'> = (params) => {
    const deleteValue = typeof params.value === 'string';
    apiRef.current.startCellEditMode({ id: params.rowNode.id, field: params.field, deleteValue });
  };

  useGridApiEventHandler(apiRef, 'cellClick', handleSingleClickForDateCell);

  return <div>{text}</div>;
};

export const Timesheet = () => {
  const { addToast } = useToasts();
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const { role } = usePermissionGate();
  const queryClient = useQueryClient();
  const [recordsCount, setRecordsCount] = useState(0);
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<Time[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({
    department: { id: -1, name: t('timesheet.all_departments') },
    date: new Date(),
  });

  const updateHasPermission = useCallback(() => {
    if (role === 'manager') {
      getCompanyPermissionSettings().then((res) =>
        setHasPermission(res.data.manager_timesheet_management)
      );
    } else {
      setHasPermission(true);
    }
  }, [role]);

  const refreshPageData = useCallback(() => {
    getDepartments(100, 1, true).then((res: any) => {
      setDepartments([
        filters.department,
        ...res?.data?.list?.map((department: Department) => {
          return {
            id: department.id,
            name: department.name,
          };
        }),
      ]);
    });
    updateHasPermission();
  }, [updateHasPermission, filters]);

  const { data, isLoading, refetch } = useQueryCustom<TimesheetTimes, { errors: string[] }>(
    ['get_timesheet_times', filters],
    {
      endpoint: '/timesheet/times',
      options: {
        method: 'get',
        body: {
          department_id: filters.department.id === -1 ? undefined : filters.department.id,
          month: format(filters.date, 'MMMM yyyy'),
        },
      },
    },
    {
      cacheTime: 0,
      enabled: true,
      refetchOnWindowFocus: false,
      onSuccess: updateHasPermission,
      onError: (error: any) => {
        if (error.response.status === 403) {
          addToast(t('timesheet.permission_error'), {
            appearance: 'error',
            autoDismiss: true,
            placement: 'top-center',
          });
          getCurrentUser().then((res) => {
            dispatch(setCurrentUser(res.data));
          });
        }
      },
    }
  );

  useEffect(() => {
    refreshPageData();
  }, []);

  const valueSetter = useCallback((params: GridValueSetterParams, field: string) => {
    const time = params.value;
    const lastActive = params.row.timesheet.findLast((element: TimesheetType) => element.active);

    return {
      ...params.row,
      timesheet: params.row.timesheet.map((timesheet: TimesheetType) => {
        if (timesheet.day === lastActive?.day) {
          return {
            ...timesheet,
            [field]: time,
          };
        }
        return timesheet;
      }),
    };
  }, []);

  const columns = useMemo(() => {
    const result: GridColDef[] = [
      {
        field: 'employee',
        headerName: t('employee.employee'),
        renderCell: (params) => renderAvatarCell(params, 'employee'),
        valueGetter: ({ value }) => `${value.first_name} ${value.last_name}`,
        disableColumnMenu: true,
        minWidth: 150,
      },
      {
        field: 'employee_id',
        headerName: '#',
        valueGetter: ({ row }) => row.employee.id,
        getApplyQuickFilterFn: undefined,
        disableColumnMenu: true,
        minWidth: 36,
        cellClassName: 'employee-id',
        headerClassName: 'employee-id',
        flex: 1,
      },
      {
        field: 'personal_number',
        headerName: t('employee.personal_number'),
        valueGetter: ({ row }) => row.employee.pin,
        getApplyQuickFilterFn: undefined,
        disableColumnMenu: true,
        minWidth: 100,
        disableExport: true,
      },
      {
        field: 'job_title',
        headerName: t('employee.job.job_title'),
        valueGetter: ({ row }) => row.job_information.job_title,
        getApplyQuickFilterFn: undefined,
        disableColumnMenu: true,
        minWidth: 100,
      },
      ...(getAllDaysInMonth(filters.date).map((day, index) => {
        const result: GridColDef = {
          field: day,
          align: 'center',
          renderHeader: ({ field }: GridColumnHeaderParams) =>
            renderCustomHeader({
              icon: data?.holidays?.some((holiday) => holiday.date === field) && (
                <HolidayIcon className="header_icon" />
              ),
              title: `${dateFormat(new Date(day), 'shortDay')}`,
              subtitle: `${index + 1}`,
            }),
          renderCell: ({ row }) => (
            <CustomDateCell
              text={
                row.timesheet[index].time_off
                  ? row.timesheet[index].time_off
                  : row.timesheet[index].active
                  ? Number(row.timesheet[index].work_hours) || '-'
                  : ''
              }
            />
          ),
          valueGetter: ({ row }) =>
            row.timesheet[index].time_off
              ? row.timesheet[index].time_off
              : row.timesheet[index].active
              ? Number(row.timesheet[index].work_hours) || 'X'
              : 'X',
          valueSetter: (params: GridValueSetterParams) => {
            const time = params.value;
            return {
              ...params.row,
              timesheet: params.row.timesheet.map((timesheet: any, timesheetIndex: number) => {
                if (index === timesheetIndex) {
                  return {
                    ...timesheet,
                    work_hours: time,
                  };
                }
                return timesheet;
              }),
            };
          },
          renderEditCell: (params: GridRenderEditCellParams) => (
            <CustomEditComponent refetchData={refetch} {...params} />
          ),
          cellClassName: ({ field, row }) =>
            row.timesheet[index].time_off
              ? 'timeoff'
              : data?.holidays?.some((holiday) => holiday.date === field)
              ? !row.timesheet[index].active
                ? 'holiday inactive'
                : 'holiday'
              : !row.timesheet[index].active
              ? 'inactive'
              : '',
          headerClassName: ({ field }) =>
            data?.holidays?.some((holiday) => holiday.date === field)
              ? 'holiday'
              : 'date-header-cell',
          headerAlign: 'center',
          sortable: false,
          editable: hasPermission,
          disableColumnMenu: true,
          getApplyQuickFilterFn: undefined,
          minWidth: 32,
          flex: 1,
        };
        return result;
      }) || []),
      {
        field: 'sum_days',
        headerName: `${t('timesheet.sum')} ${t('timesheet.days')}`,
        renderHeader: () =>
          renderCustomHeader({ title: t('timesheet.sum'), subtitle: t('timesheet.days') }),
        renderCell: ({ value }) => value || '-',
        valueGetter: ({ row }) =>
          row.timesheet.filter(
            (timesheet: TimesheetType) => Number(timesheet.work_hours || 0) && !timesheet.time_off
          ).length || undefined,
        headerClassName: 'sum',
        cellClassName: 'sum',
        headerAlign: 'center',
        align: 'center',
        filterable: false,
        sortable: false,
        disableColumnMenu: true,
        getApplyQuickFilterFn: undefined,
        width: 33,
      },
      {
        field: 'sum_hours',
        headerName: `${t('timesheet.sum')} ${t('timesheet.hrs')}`,
        renderHeader: () =>
          renderCustomHeader({ title: t('timesheet.sum'), subtitle: t('timesheet.hrs') }),
        renderCell: ({ value }) => value || '-',
        valueGetter: ({ row }) =>
          _.sumBy(row.timesheet, (item: TimesheetType) =>
            item.time_off ? 0 : Number(item.work_hours || 0)
          ) || undefined,
        headerClassName: 'sum',
        cellClassName: 'sum',
        headerAlign: 'center',
        align: 'center',
        filterable: false,
        sortable: false,
        disableColumnMenu: true,
        getApplyQuickFilterFn: undefined,
        width: 33,
      },
      {
        field: 'overtime_hours',
        headerName: `${t('timesheet.overtime')} ${t('timesheet.hrs')}`,
        renderEditCell: (params: GridRenderEditCellParams) => (
          <CustomEditComponent refetchData={refetch} {...params} hoursLimit={false} />
        ),
        valueSetter: (params: GridValueSetterParams) => valueSetter(params, 'overtime_hours'),
        renderHeader: () =>
          renderCustomHeader({ title: t('timesheet.overtime'), subtitle: t('timesheet.hrs') }),
        renderCell: ({ value }) => value || '-',
        valueGetter: ({ row }) =>
          Number(
            row.timesheet.findLast((element: TimesheetType) => element.active)?.overtime_hours
          ) || undefined,
        headerAlign: 'center',
        align: 'center',
        filterable: false,
        sortable: false,
        editable: hasPermission,
        disableColumnMenu: true,
        getApplyQuickFilterFn: undefined,
        width: 60,
        cellClassName: 'hours',
        headerClassName: 'hours',
      },
      {
        field: 'night_hours',
        headerName: `${t('timesheet.night')} ${t('timesheet.hrs')}`,
        renderEditCell: (params: GridRenderEditCellParams) => (
          <CustomEditComponent refetchData={refetch} {...params} hoursLimit={false} />
        ),
        valueSetter: (params: GridValueSetterParams) => valueSetter(params, 'night_hours'),
        renderHeader: () =>
          renderCustomHeader({ title: t('timesheet.night'), subtitle: t('timesheet.hrs') }),
        renderCell: ({ value }) => value || '-',
        valueGetter: ({ row }) =>
          Number(row.timesheet.findLast((element: TimesheetType) => element.active)?.night_hours) ||
          undefined,
        headerAlign: 'center',
        align: 'center',
        filterable: false,
        sortable: false,
        editable: hasPermission,
        disableColumnMenu: true,
        getApplyQuickFilterFn: undefined,
        width: 48,
        cellClassName: 'hours',
        headerClassName: 'hours',
      },
      {
        field: 'holiday_hours',
        headerName: `${t('timesheet.holiday')} ${t('timesheet.hrs')}`,
        renderHeader: () =>
          renderCustomHeader({ title: t('timesheet.holiday'), subtitle: t('timesheet.hrs') }),
        renderCell: ({ value }) => value || '-',
        valueGetter: ({ row }) =>
          data?.holidays?.reduce(
            (acc, value) =>
              acc +
              Number(
                row.timesheet.find(
                  (timesheet: TimesheetType) => timesheet.day === value.date && !timesheet.time_off
                )?.work_hours || 0
              ),
            0
          ) || undefined,
        headerAlign: 'center',
        align: 'center',
        filterable: false,
        sortable: false,
        disableColumnMenu: true,
        getApplyQuickFilterFn: undefined,
        width: 48,
        cellClassName: 'hours',
        headerClassName: 'hours',
      },
      {
        field: 'other_hours',
        headerName: `${t('timesheet.other')} ${t('timesheet.hrs')}`,
        renderEditCell: (params: GridRenderEditCellParams) => (
          <CustomEditComponent refetchData={refetch} {...params} hoursLimit={false} />
        ),
        valueSetter: (params: GridValueSetterParams) => valueSetter(params, 'other_hours'),
        renderHeader: () =>
          renderCustomHeader({ title: t('timesheet.other'), subtitle: t('timesheet.hrs') }),
        renderCell: ({ value }) => value || '-',
        valueGetter: ({ row }) =>
          Number(row.timesheet.findLast((element: TimesheetType) => element.active)?.other_hours) ||
          undefined,
        headerAlign: 'center',
        align: 'center',
        filterable: false,
        sortable: false,
        editable: hasPermission,
        getApplyQuickFilterFn: undefined,
        width: 48,
        disableColumnMenu: true,
        cellClassName: 'hours',
        headerClassName: 'hours',
      },
    ];
    return result;
  }, [t, filters.date, data?.holidays, valueSetter, hasPermission, refetch]);

  const initialState: GridInitialState = {
    filter: {},
    columns: {
      columnVisibilityModel: {
        personal_number: false,
      },
    },
    pinnedColumns: {
      left: [
        GRID_CHECKBOX_SELECTION_COL_DEF.field,
        'employee',
        'employee_id',
        'personal_number',
        'job_title',
      ],
      right: [
        'sum_days',
        'sum_hours',
        'overtime_hours',
        'night_hours',
        'holiday_hours',
        'other_hours',
      ],
    },
  };

  const onGridStateChange = ({
    filter: { filteredRowsLookup },
    rows: { idRowsLookup },
  }: GridState) => {
    if (!isEmpty(filteredRowsLookup)) {
      const filteredRowsIds = Object.keys(filteredRowsLookup).filter(
        (key) => filteredRowsLookup[key]
      );
      let rows = _.unionBy(
        Object.keys(idRowsLookup)
          .map((key) => filteredRowsIds.includes(key) && idRowsLookup[key])
          .filter((row) => row),
        'employee.id'
      );
      const count = rows.length;
      setRecordsCount(count);
    } else {
      let count = 0;
      setRecordsCount(count);
    }
  };

  const CustomNoResultsOverlay = () => {
    const { t } = useTranslation();
    return (
      <StyledCustomNoResultsContainer>
        <NoResultsIcon />
        <p>{t('components.dataGrid.many_great_matches')}</p>
        <p>{t('components.dataGrid.searching_another_values')}</p>
      </StyledCustomNoResultsContainer>
    );
  };

  const currentUser = useSelector(currentUserSelector);

  const exceljsPreProcess = ({ workbook, worksheet }: GridExceljsProcessInput): any => {
    workbook.creator = 'Profesto';
    workbook.created = new Date();
    worksheet.pageSetup.orientation = 'landscape';
    worksheet.properties.defaultRowHeight = 8;
    worksheet.pageSetup.margins = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      header: 0,
      footer: 0,
    };
    worksheet.pageSetup.printTitlesRow = '12:16';
    const date = filters.date;
    const mergeCellsData = [
      'D2:AB2',
      'D4:AB4',
      'D5:AB5',
      'D6:AB6',
      'D7:AB7',
      'D9:H9',
      'D10:H10',
      'L9:O9',
      'L10:O10',
      'S9:W9',
      'X9:AB9',
      'S10:AB10',
      'A12:A15',
      'B12:B15',
      'C12:C15',
      'D12:AH12',
      'D16:AH16',
      'AI12:AN12',
      'AI13:AI15',
      'AJ13:AN13',
      'AJ14:AJ15',
      'AK14:AN14',
    ];

    worksheet.properties.defaultRowHeight = 11.25;
    function widthPixelsToPoints(pixels: number) {
      return (pixels * 7 + 5) / 7;
    }
    const setCellAlignment = (cell: string | number, alignment: any) => {
      worksheet.getCell(cell).alignment = alignment;
    };

    const setRowAlignment = (rowNumber: number, alignment: any) => {
      worksheet.getRow(rowNumber).alignment = alignment;
    };

    const setRowFont = (rowNumber: number, font: any) => {
      worksheet.getRow(rowNumber).font = font;
    };

    const mergeCells = (cells: Array<string | number>) => {
      cells.forEach((period: any) => worksheet.mergeCells(period));
    };

    const setColumnWidth = (columns: number[], width: number) => {
      columns.forEach((col) => {
        worksheet.getColumn(col).width = widthPixelsToPoints(width);
      });
    };

    [2, 4, 5, 6, 7, 10].forEach((row) => setRowAlignment(row, { horizontal: 'center' }));
    mergeCells(mergeCellsData);

    [1, 2, 3].forEach((col) => {
      worksheet.getColumn(col).alignment = { horizontal: 'left' };
    });

    for (let i = 0; i < maxDaysInMonth; i++) {
      const dateColumn = 4 + i;
      worksheet.mergeCells(13, dateColumn, 15, dateColumn);
      worksheet.getCell(13, dateColumn).value = i + 1;
      worksheet.getCell(13, dateColumn).font = { size: 8 };
      worksheet.getCell(13, dateColumn).alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getColumn(dateColumn).width = widthPixelsToPoints(3);
    }

    setColumnWidth([35], 3.5);
    setColumnWidth([36, 37, 38, 39, 40], 4.5);
    setColumnWidth([1], 22.5);
    setColumnWidth([2], 15.5);
    setColumnWidth([3], 17.5);

    worksheet.getCell(16, 1).value = 1;
    worksheet.getCell(16, 2).value = 2;
    worksheet.getCell(16, 3).value = 3;
    worksheet.getCell(16, 34).value = 4;
    worksheet.getCell(16, 35).value = 5;
    worksheet.getCell(16, 36).value = 6;
    worksheet.getCell(16, 37).value = 7;
    worksheet.getCell(16, 38).value = 8;
    worksheet.getCell(16, 39).value = 9;
    worksheet.getCell(16, 40).value = 10;
    worksheet.getRow(16).alignment = { horizontal: 'center' };

    ['D9', 'L9', 'S9', 'X9'].forEach((cell) => {
      const currentCell = worksheet.getCell(cell);
      currentCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    worksheet.getCell('D2').value = t('reports.list.timesheet');
    setRowAlignment(2, { horizontal: 'center' });
    setRowFont(2, { size: 14, bold: true });

    worksheet.getRows(4, 7)?.forEach((row) => setRowFont(row.number, { size: 7 }));

    worksheet.getCell('D4').value = currentUser.company.name;
    worksheet.getCell('D5').value = t('settings.companyInfo.company_name');
    worksheet.getCell('D6').value =
      filters.department.name !== t('timesheet.all_departments')
        ? filters.department.name
        : currentUser.company.name;
    worksheet.getCell('D7').value = t('timesheet.department_name');

    worksheet.getCell('D10').value = t('timesheet.excel.identification_code');

    worksheet.getCell('L9').value = format(new Date(), 'dd.MM.yyyy');
    worksheet.getCell('L10').value = t('timesheet.created_date');

    setCellAlignment('S9', { horizontal: 'right' });
    setCellAlignment('X9', { horizontal: 'right' });
    worksheet.getCell('S9').value = format(
      new Date(date.getFullYear(), date.getMonth(), 1),
      'dd.MM.yyyy'
    );
    worksheet.getCell('X9').value = format(
      new Date(date.getFullYear(), date.getMonth() + 1, 0),
      'dd.MM.yyyy'
    );
    worksheet.getCell('S10').value = t('timeOff.period');

    worksheet.getCell('D12').value = t('timesheet.excel.date_header');
    setCellAlignment('D12', { vertical: 'middle', horizontal: 'center' });
    worksheet.getCell('AI12').value = t('timesheet.excel.total_work_for_month');
    setCellAlignment('AI12', { vertical: 'middle', horizontal: 'center' });

    const headerData = [
      { cell: 'A12', value: `${t('employee.last_name')}, ${t('employee.first_name')}` },
      {
        cell: 'B12',
        value: t('timesheet.excel.employee_number') + ' / ' + t('employee.personal_number'),
      },
      { cell: 'C12', value: t('employee.job.job_title') },
      { cell: 'AI13', value: t('timesheet.days') },
      { cell: 'AJ13', value: t('timesheet.excel.hours') },
      { cell: 'AK14', value: t('timesheet.excel.including') },
      { cell: 'AJ14', value: t('timesheet.sum') },
      { cell: 'AK15', value: t('timesheet.overtime') },
      { cell: 'AL15', value: t('timesheet.night') },
      { cell: 'AM15', value: t('timesheet.holiday') },
      { cell: 'AN15', value: t('timesheet.other') },
    ];

    [35, 36, 37, 38, 39, 40].forEach((column, index) => {
      worksheet.getColumn(column).key = additionalColumnsMapping[index];
    });

    headerData.forEach(({ cell, value }) => {
      worksheet.getCell(cell).value = value;
      if (Number(cell) > 3)
        setCellAlignment(cell, { vertical: 'middle', horizontal: 'center', wrapText: true });
      else setCellAlignment(cell, { vertical: 'middle', wrapText: true });
    });
  };

  const exceljsPostProcess = ({ worksheet }: GridExceljsProcessInput): any => {
    const dataLength = data!.data!.length;
    const startRow = 12;
    const footerRowIndex = startRow + dataLength + 6;

    if (getAllDaysInMonth(filters.date).length !== maxDaysInMonth) {
      [...Array(maxDaysInMonth - getAllDaysInMonth(filters.date).length).keys()].forEach(
        (index) => {
          for (let i = 0; i < dataLength; i++) {
            const row = 17 + i;
            const column = 34 - index;
            worksheet.getCell(row, column).value = 'X';
          }
        }
      );
    }

    [35, 36, 37, 38, 39, 40].forEach((column) => {
      worksheet.getColumn(column).eachCell((cell) => {
        if (Number(cell.row) >= 17 && cell.value === null)
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
      });
    });

    worksheet.getRows(startRow, dataLength + 5)?.forEach((row) => {
      row.font = { size: 8 };
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        if (
          (Number(cell.col) > 3 && Number(cell.row) > 16) ||
          (Number(cell.col) > 34 && Number(cell.row) < 16)
        ) {
          cell.alignment = { horizontal: 'center' };
        }
        if (Number(cell.col) > 34 && Number(cell.row) < 16) {
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        }
      });
    });

    const footer = worksheet.getRow(footerRowIndex);
    footer.height = 24;

    const setFooterCell = (cellIndex: number, value?: string, alignment?: any, font?: any) => {
      const cell = footer.getCell(cellIndex);
      if (value) cell.value = value;
      if (alignment) cell.alignment = { horizontal: alignment, wrapText: true };
      cell.font = font;
    };

    footer.getCell(2).border = { bottom: { style: 'thin' } };
    footer.getCell(3).border = { bottom: { style: 'thin' } };
    footer.getCell(7).border = { bottom: { style: 'thin' } };
    footer.getCell(25).border = { bottom: { style: 'thin' } };
    footer.getCell(32).border = { bottom: { style: 'thin' } };

    setFooterCell(1, t('timesheet.excel.responsible_person'), 'left', { size: 10 });
    worksheet.mergeCells(footerRowIndex, 3, footerRowIndex, 5);
    worksheet.mergeCells(footerRowIndex + 1, 3, footerRowIndex + 1, 5);
    setFooterCell(5);

    worksheet.mergeCells(footerRowIndex, 7, footerRowIndex, 12);
    worksheet.mergeCells(footerRowIndex + 1, 7, footerRowIndex + 1, 12);
    setFooterCell(12);

    worksheet.mergeCells(footer.number, 17, footer.number, 24);
    setFooterCell(24, t('timesheet.excel.head_of_organization'), 'center', { size: 10 });
    footer.getCell(24).alignment = { wrapText: true };

    worksheet.mergeCells(footerRowIndex, 25, footerRowIndex, 30);
    worksheet.mergeCells(footerRowIndex + 1, 25, footerRowIndex + 1, 30);
    setFooterCell(30);

    worksheet.mergeCells(footerRowIndex, 32, footerRowIndex, 35);
    worksheet.mergeCells(footerRowIndex + 1, 32, footerRowIndex + 1, 35);
    setFooterCell(35);

    worksheet.getCell(footerRowIndex + 1, 5).value = t('timesheet.excel.job_title');
    worksheet.getCell(footerRowIndex + 1, 5).font = { size: 10 };
    worksheet.getCell(footerRowIndex + 1, 5).alignment = { horizontal: 'center' };
    worksheet.getCell(footerRowIndex + 1, 12).value = t('timesheet.excel.signature');
    worksheet.getCell(footerRowIndex + 1, 12).font = { size: 10 };
    worksheet.getCell(footerRowIndex + 1, 12).alignment = { horizontal: 'center' };
    worksheet.getCell(footerRowIndex + 1, 30).value = t('timesheet.excel.job_title');
    worksheet.getCell(footerRowIndex + 1, 30).font = { size: 10 };
    worksheet.getCell(footerRowIndex + 1, 30).alignment = { horizontal: 'center' };
    worksheet.getCell(footerRowIndex + 1, 35).value = t('timesheet.excel.signature');
    worksheet.getCell(footerRowIndex + 1, 35).font = { size: 10 };
    worksheet.getCell(footerRowIndex + 1, 35).alignment = { horizontal: 'center' };
  };

  return (
    <div>
      <PageHeaderContainer>
        <PageHeaderTitle title={t('timesheet.title', { count: recordsCount })} />
      </PageHeaderContainer>
      <TableWrapper>
        <DataGrid
          name="timesheet_times"
          saveGridState
          editMode="cell"
          disableSelectionOnClick
          experimentalFeatures={{ newEditingApi: true }}
          disableRowGrouping
          components={{
            NoRowsOverlay: CustomNoResultsOverlay,
          }}
          onStateChange={onGridStateChange}
          showCellRightBorder
          checkboxSelection={hasPermission}
          onSelectionModelChange={(selectionModel) => {
            const selected = (data?.data || []).filter((data) =>
              selectionModel.includes(`${data.employee.id} ${data.job_information.job_title}`)
            );
            setSelectedEmployees(selected);
          }}
          rowHeight={50}
          getRowId={(row) => `${row.employee.id} ${row.job_information.job_title}`}
          loading={isLoading}
          rows={data?.data || []}
          columns={columns}
          initialState={initialState}
          customFilter={
            <>
              <DatePicker
                selected={filters.date}
                onChange={(value) => {
                  if (value) {
                    setFilters((prev) => ({
                      ...prev,
                      date: value,
                    }));
                  }
                }}
                dateFormat="MMMM yyyy"
                showMonthYearPicker
                customInput={null}
                todayButton={null}
                containerStyle={{ marginRight: 10 }}
              />
              <SelectWrapper>
                <SelectDropdown
                  size="small"
                  onChange={(_event: any, newValue: any, reason) => {
                    setFilters((prev) => ({
                      ...prev,
                      department: reason === 'clear' ? departments[0].name : newValue,
                    }));
                  }}
                  value={filters.department}
                  style={{ marginRight: 10 }}
                  sx={{ width: 220 }}
                  options={departments}
                />
              </SelectWrapper>
            </>
          }
          customButton={
            <>
              {hasPermission && (
                <>
                  <StyledButton
                    data-type={'add'}
                    disabled={!selectedEmployees.length}
                    onClick={() => setModalState({ open: true, type: 'add' })}
                    startIcon={<CalendarCircle />}
                    variant={'outlined'}
                  >
                    {t('timesheet.enter_hours')}
                  </StyledButton>
                  <StyledButton
                    data-type={'delete'}
                    disabled={!selectedEmployees.length}
                    onClick={() => setModalState({ open: true, type: 'delete' })}
                    startIcon={<CancelIcon />}
                    variant={'outlined'}
                  >
                    {t('timesheet.delete_hours')}
                  </StyledButton>
                </>
              )}
            </>
          }
          quickFilterPlaceholder={t('timesheet.search')}
          quickFilterWidth={330}
          disableColumnSelector
          enableExports
          withoutExportModal={true}
          excelOptions={{
            exceljsPreProcess,
            exceljsPostProcess,
            fileName: `${format(new Date(), "yyyy-MM-dd'T'HH:mm")} - Profesto - ${t(
              'reports.list.timesheet'
            )}`,
            includeHeaders: false,
          }}
        />
      </TableWrapper>
      {modalState?.open && (
        <Modal
          employees={selectedEmployees}
          modalType={modalState.type}
          date={filters.date}
          onCloseModal={() => setModalState(null)}
          refreshData={() => queryClient.invalidateQueries('get_timesheet_times')}
        />
      )}
    </div>
  );
};

const StyledButton = styled(Button)`
  border-color: #e5e8e9 !important;
  height: 37px !important;

  path:nth-child(2) {
    fill: #b5b5b5 !important;
  }
  svg {
    width: 25px;
    height: 25px;
  }

  &:disabled {
    background: var(--gray) !important;
  }

  &:hover {
    path {
      fill: revert-layer !important;
    }
  }

  &[data-type='add'] {
    &:hover {
      background: var(--light-orange) !important;
      color: var(--orange) !important;

      path:nth-child(1) {
        fill: var(--orange) !important;
      }
    }
  }
  &[data-type='delete'] {
    &:hover {
      background: var(--pink) !important;
      color: var(--red) !important;

      path:nth-child(2) {
        fill: var(--red) !important;
      }
    }
  }
`;

const PageHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #fff;
  transition: box-shadow 0.2s ease-in-out;
  & > span {
    border-bottom: 1px solid #f2f2f4;
  }

  & > div {
    padding: 0 20px;
  }
`;

const SelectWrapper = styled.div`
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

const TableWrapper = styled.div`
  display: flex;
  height: 85%;
  margin: 20px 20px;
  flex-direction: column;

  .MuiDataGrid-toolbarContainer {
    div:last-child {
      gap: 12px !important;
    }
  }

  .MuiDataGrid-columnHeader {
    background: var(--light-green);

    &.holiday {
      background: var(--meddium-orange);
    }
  }

  .date-header-cell {
    padding: 0px 4px;
  }

  .MuiDataGrid-columnHeaders {
    z-index: 10;
  }

  .MuiDataGrid-columnSeparator--sideLeft {
    left: -6px;
  }

  .MuiDataGrid-cellCheckbox,
  .MuiDataGrid-columnHeaderCheckbox {
    border-right: 0 !important;

    &:focus,
    &:focus-within {
      outline: none !important;
    }
  }

  .MuiDataGrid-columnHeader:nth-child(2),
  .MuiDataGrid-cell:nth-child(2) {
    padding: 0;
  }

  .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnSeparator {
    display: none;
  }

  .header {
    line-height: 20px;

    &_title {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    svg {
      position: absolute;
      bottom: 0;
      right: 0;
    }
  }

  .sum {
    background: var(--meddium-green);
  }

  .hours {
    padding: 0;
  }

  .holiday {
    background: var(--light-orange) !important;
    padding: 0 6px;
  }

  .inactive {
    pointer-events: none;
    background: var(--light-gray);
    padding: 0 6px;
  }

  .timeoff {
    pointer-events: none;
    background: var(--pink);
    color: var(--red);
    padding: 0 6px;
  }

  .employee-id {
    padding: 8px;
  }

  .MuiDataGrid-pinnedColumns--left {
    .MuiDataGrid-row {
      .MuiDataGrid-cell {
        font-size: 11px;
      }
    }
  }
`;

const StyledCustomNoResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  p:first-of-type {
    text-align: left;
    color: #676767;
    font-size: 13px;
    font-family: 'Aspira Demi', 'FiraGO Regular';
  }
  p:last-of-type {
    text-align: left;
    color: #676767;
    font-size: 12px;
  }
`;

const CustomNumericFormat = styled(NumericFormat)`
  width: 40px;
  text-align: center;
  border: none;
  background-color: transparent;
`;

const DateDayTitle = styled.span`
  font-size: 10px;
`;
const DateDaySubtitle = styled.span`
  font-size: 12px;
`;
