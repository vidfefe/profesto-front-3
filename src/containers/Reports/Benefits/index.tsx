import { useState, useEffect, useMemo, useCallback } from 'react';
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
  useGridApiRef,
  gridFilteredSortedRowIdsSelector,
  gridFilteredSortedRowEntriesSelector,
  GridComparatorFn,
  GridSortItem,
  GridRowId,
} from '@mui/x-data-grid-premium';
import _ from 'lodash';

import DataGrid from 'components/DataLists/DataGrid';
import { PageHeaderTitle } from 'components/DesignUIComponents';
import EmployeeCard from 'components/Employee/Card';
import PermissionGate from 'permissions/PermissionGate';
import useMutationCustom from 'hooks/useMutationCustom';
import { getBenefitTypeList } from 'services';
import SelectDropdown from 'components/Dropdowns/SelectDropdown';
import { dateFormat } from 'lib/DateFormat';

const renderAvatarCell = (params: GridRenderCellParams, type: string) => {
  return params.row[type]?.first_name ? (
    <PermissionGate on="employee" properties={{ disabled: true }}>
      <EmployeeCard fontSize={12} employee={params.row[type]} />
    </PermissionGate>
  ) : (
    ''
  );
};

const employeeTranslation = ['თანამშრომელი', 'Employee'];

export default function Benefits() {
  const { t } = useTranslation();
  const [numberOfBenefits, setNumberOfBenefits] = useState<number>(0);
  const [list, setList] = useState<any[]>([]);
  const apiRef = useGridApiRef();

  const comparator: GridComparatorFn<string> = useCallback((v1, v2, cellParams1) => {
    const fieldName = cellParams1.field;
    const currentOrder = cellParams1.api.state.sorting.sortModel.find(
      (model: GridSortItem) => model.field === fieldName
    )?.sort;
    if (employeeTranslation.includes(v1)) return currentOrder === 'asc' ? -1 : 1;
    if (employeeTranslation.includes(v2)) return currentOrder === 'asc' ? 1 : -1;
    return v1.localeCompare(v2);
  }, []);

  const columns = useMemo(() => {
    const result: GridColDef[] = [
      {
        field: 'dependent_first_name',
        headerName: t('employee.first_name'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'dependent_last_name',
        headerName: t('employee.last_name'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'dependent_personal_number',
        headerName: t('benefits.dependent.personal_number'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'dependent_birth_date',
        headerName: t('benefits.dependent.birthdate'),
        valueGetter: ({ value }) => value && new Date(value),
        valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDate'),
        type: 'date',
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'dependent_age',
        headerName: t('benefits.dependent.age'),
        type: 'number',
        minWidth: 60,
        flex: 1,
      },
      {
        field: 'dependent_gender',
        headerName: t('benefits.dependent.gender'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'dependent_relationship',
        headerName: t('benefits.dependent.relationship'),
        sortComparator: comparator,
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
        field: 'employee_id',
        headerName: t('employee.short_emp_id'),
        minWidth: 60,
        flex: 0.3,
      },
      {
        field: 'employee_personal_number',
        headerName: t('reports.benefits.employee_personal_number'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'employee_job_title',
        headerName: t('employee.job.job_title'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'employee_job_department',
        headerName: t('employee.job.department'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'employee_job_division',
        headerName: t('employee.job.division'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'employee_job_location',
        headerName: t('employee.address.location'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'benefit_name',
        headerName: t('settings.menu.singularTitle.benefit'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'benefit_type',
        headerName: t('settings.benefit.type'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'coverage_type',
        headerName: t('settings.benefit.coverage_type'),
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'currency',
        headerName: t('globaly.currency'),
        renderCell: ({ value }) => value?.code,
        valueGetter: ({ value }) => value?.code,
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'total_cost',
        headerName: t('settings.benefit.total_cost'),
        renderCell: ({ row, value }) =>
          !_.isNil(value) && `${row.currency.symbol} ${row.total_cost.toFixed(2)}`,
        type: 'number',
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'company_pays',
        headerName: t('settings.benefit.company_pays'),
        renderCell: ({ row, value }) =>
          !_.isNil(value) && `${row.currency.symbol} ${row.company_pays.toFixed(2)}`,
        type: 'number',
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'employee_pays',
        headerName: t('settings.benefit.employee_pays'),
        renderCell: ({ row, value }) =>
          !_.isNil(value) && `${row.currency.symbol} ${row.employee_pays.toFixed(2)}`,
        type: 'number',
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'start_on',
        headerName: t('settings.benefit.start_date'),
        valueGetter: ({ value }) => value && new Date(value),
        valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDate'),
        type: 'date',
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'end_date',
        headerName: t('settings.benefit.end_date'),
        valueGetter: ({ value }) => value && new Date(value),
        valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDate'),
        type: 'date',
        minWidth: 100,
        flex: 1,
      },
      {
        field: 'benefit_completion_reason_name',
        headerName: t('reports.benefits.completion_reason'),
        valueGetter: ({ value }) =>
          value === 'benefit_expiration'
            ? t('reports.benefits.benfeit_experation')
            : value || undefined,
        minWidth: 150,
        flex: 1,
      },
    ];
    return result;
  }, [comparator, t]);

  const [benefitType, setBenefitType] = useState<any>(t('reports.benefits.all_benefit_types'));
  const [benefitTypes, setBenefitTypes] = useState<any>();
  const [filterDates, setFilterDates] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });

  useEffect(() => {
    getEmployeeBenefitsList({
      filter: {
        benefit_type_id: benefitType && benefitType?.id !== 'all' ? benefitType.id : null,
        start_on: filterDates?.start || null,
        end_on: filterDates?.end || null,
      },
    });
  }, [benefitType, filterDates]);

  useEffect(() => {
    getBenefitTypeList(100, 1).then((res: any) => {
      setBenefitTypes([
        {
          id: 'all',
          id_name: 'all',
          name: t('reports.benefits.all_benefit_types'),
        },
        ...res?.data?.list?.map((benefitType: any) => {
          return {
            id: benefitType.id,
            id_name: benefitType.name.toLocaleLowerCase(),
            name: benefitType.name,
          };
        }),
      ]);
    });
  }, []);

  const { mutate: getEmployeeBenefitsList, isLoading: employeeBenefitListLoading } =
    useMutationCustom<string[], {}, {}>(
      ['employee_benefits_list'],
      {
        endpoint: '/reports/employee_benefit',
        options: { method: 'post' },
      },
      {
        onSuccess: (_, variables) => {
          setList(_);
        },
      }
    );

  const currentUser = useSelector(currentUserSelector);

  const initialState: GridInitialState = {
    filter: {},
    sorting: {
      sortModel: [
        { field: 'employee', sort: 'asc' },
        { field: 'benefit_name', sort: 'asc' },
        { field: 'dependent_relationship', sort: 'asc' },
      ],
    },
    columns: {
      columnVisibilityModel: {
        employee_id: false,
        employee_personal_number: false,
        employee_job_department: false,
        employee_job_division: false,
        employee_job_location: false,
        currency: false,
      },
    },
  };

  const renderPeriodDates = () => {
    if (!filterDates?.start && !filterDates?.end) {
      return '-';
    } else {
      const start = filterDates?.start ? format(filterDates.start, 'dd.MM.yyyy') : '...';
      const end = filterDates?.end ? format(filterDates.end, 'dd.MM.yyyy') : '...';
      return `${start} - ${end}`;
    }
  };

  const exceljsPreProcess = ({ workbook, worksheet }: GridExceljsProcessInput): any => {
    workbook.creator = 'Profesto';
    workbook.created = new Date();
    worksheet.properties.defaultRowHeight = 30;

    worksheet.getCell('A1').value = t('reports.list.benefits');
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

    worksheet.getCell('A5').value = t('reports.benefits.period') + ': ' + renderPeriodDates();
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
    worksheet.getColumn('total_cost').numFmt = '0.00';
    worksheet.getColumn('company_pays').numFmt = '0.00';
    worksheet.getColumn('employee_pays').numFmt = '0.00';
  };

  const [visibleRows, setVisibleRows] = useState<GridRowId[]>([]);

  useEffect(() => {
    const filteredSortedRowsAndIds = gridFilteredSortedRowEntriesSelector(apiRef);
    const data = _.groupBy(filteredSortedRowsAndIds, (item) => item.model.id);

    Object.keys(data).forEach((key) => {
      const current = list.find((record) => record.id === Number(key));

      apiRef.current.updateRows(
        data[key].map((record, index) => ({
          ...record.model,
          total_cost: index ? null : current?.total_cost,
          company_pays: index ? null : current?.company_pays,
          employee_pays: index ? null : current?.employee_pays,
        }))
      );
    });
  }, [visibleRows, employeeBenefitListLoading]);

  const onGridStateChange = ({
    filter: { filteredRowsLookup },
    rows: { idRowsLookup },
    columns,
  }: GridState) => {
    const filteredSortedIds = gridFilteredSortedRowIdsSelector(apiRef);

    setVisibleRows((prev) => {
      return _.isEqual(filteredSortedIds, prev) ? prev : filteredSortedIds;
    });

    if (!isEmpty(filteredRowsLookup)) {
      const filteredRowsIds = Object.keys(filteredRowsLookup).filter(
        (key) => filteredRowsLookup[key]
      );
      let rows = Object.keys(idRowsLookup)
        .map((key) => filteredRowsIds.includes(key) && idRowsLookup[key])
        .filter((row) => row);
      let numberOfBenefits = rows.length;
      setNumberOfBenefits(numberOfBenefits);
    } else {
      let numberOfBenefits = list.length;
      setNumberOfBenefits(numberOfBenefits);
    }
  };

  const onChangeBenefitTypeScelect = (value: any) => {
    setBenefitType(value);
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
      <PageHeaderTitle
        title={t('reports.benefit_records', { count: numberOfBenefits })}
      />
      <div
        style={{
          display: 'flex',
          height: '85%',
          margin: '20px 50px',
          flexDirection: 'column',
        }}
      >
        <DataGrid
          apiRef={apiRef}
          name="benefits_report"
          saveGridState
          components={{
            NoRowsOverlay: CustomNoResultsOverlay,
          }}
          disableQuickFilter
          disableRowGrouping
          onStateChange={onGridStateChange}
          loading={employeeBenefitListLoading}
          rows={list}
          columns={columns}
          initialState={initialState}
          getRowId={(row) => `${row.id} ${row.dependent_id}`}
          initialDatesValue={{
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
          }}
          rangePicker={(e: any) => {
            setFilterDates({
              start: e.start,
              end: e.end,
            });
          }}
          benefitTypeInput={() => (
            <SelectWrapper>
              <SelectDropdown
                size="small"
                inputPlaceholder={t('globaly.select', {
                  title: t('settings.benefit.type'),
                })}
                onChange={(_event: any, newValue: any) => {
                  onChangeBenefitTypeScelect(newValue);
                }}
                value={benefitType}
                style={{ marginRight: 10 }}
                sx={{ width: 220 }}
                options={benefitTypes}
              />
            </SelectWrapper>
          )}
          enableExports
          excelOptions={{
            exceljsPreProcess,
            exceljsPostProcess,
            fileName: `${format(new Date(), "yyyy-MM-dd'T'HH:mm")} - Profesto - ${t(
              'reports.list.benefits'
            )}`,
          }}
        />
      </div>
    </>
  );
}

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
