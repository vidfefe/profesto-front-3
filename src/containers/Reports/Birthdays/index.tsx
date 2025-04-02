import { useState, useEffect } from 'react';
import styled from "styled-components";
import {
    GridColDef,
    GridExceljsProcessInput,
    GridInitialState,
    GridRenderCellParams,
    GridState,
    GridComparatorFn,
    useGridApiRef,
    useKeepGroupedColumnsHidden
} from "@mui/x-data-grid-premium";
import DataGrid from "components/DataLists/DataGrid";
import { PageHeaderTitle } from "components/DesignUIComponents";
import EmployeeCard from "components/Employee/Card";
import useQuery from "hooks/useQueryCustom";
import { isEmpty, uniqBy,  filter } from "lodash";
import format from "date-fns/format";
import { useSelector } from "react-redux";
import { currentUserSelector } from "redux/selectors";
import { getMonthNumber } from 'utils/common';
import PermissionGate from 'permissions/PermissionGate';
import { useTranslation } from "react-i18next";
import { region } from 'lib/Regionalize';
import { changeColumns } from 'lib/ChnageColumns';
import { dateFormat } from 'lib/DateFormat';

const renderAvatarCell = (params: GridRenderCellParams, type: string) => {
    return params.row[type]?.first_name ?
        <PermissionGate on='employee' properties={{ disabled: true }}>
            <EmployeeCard fontSize={12} employee={params.row[type]} />
        </PermissionGate> : ""
};

const monthNameComparator: GridComparatorFn<string> = (v1: string, v2: string) => getMonthNumber(v1) - getMonthNumber(v2);



export default function BirthdaysReport() {
    const { t } = useTranslation();
    const apiRef = useGridApiRef();
    const [numberOfEmployees, setNumberOfEmployees] = useState<number>(0);
    const currentUser = useSelector(currentUserSelector);
    const [columns, setColumns] = useState<GridColDef[]>([
        {
            field: 'month',
            headerName: t('globaly.month'),
            sortComparator: monthNameComparator,
            filterable: false,
            minWidth: 100, flex: 0.6,
        },
        { field: 'day', headerName: t('globaly.day'), minWidth: 100, flex: 0.6, type: 'number' },
        {
            field: 'year',
            headerName: t('globaly.year'),
            minWidth: 100,
            flex: 0.6,
            type: 'number',
            valueFormatter: ({ value }) => value,
        },
        {
            field: 'employee', headerName: t('employee.employee'),
            renderCell: (params) => renderAvatarCell(params, 'employee'),
            valueGetter: ({ value }) => value ? `${value?.first_name} ${value?.last_name}` : '',
            groupingValueGetter: ({ value }) => `${value.first_name} ${value.last_name}`,
            minWidth: 150, flex: 1
        },
        { field: 'employee_id', headerName: t('employee.short_emp_id'), minWidth: 100, flex: 0.6, type: 'string' },
        { field: 'age', headerName: t('employee.age'), minWidth: 100, flex: 0.6, type: 'number' },
        { field: 'job_title', headerName: t('employee.job.job_title'), minWidth: 100, flex: 1 },
        { field: 'employment_status', headerName: t('employee.short_status'), minWidth: 100, flex: 1 },
        { field: 'department', headerName: t('employee.job.department'), minWidth: 100, flex: 1 },
        { field: 'division', headerName: t('employee.job.division'), minWidth: 100, flex: 1 },
        { field: 'location', headerName: t('employee.address.location'), minWidth: 100, flex: 1 },
        {
            field: 'birth_date',
            headerName: t('employee.birth_date'),
            type: 'date',
            valueGetter: ({ value }) => value && new Date(value),
            valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDate'),
            minWidth: 100, flex: 0.6
        },
    ]);

    const { data: birthdaysReportData = [], isLoading } = useQuery<any>(["birthdays_report"], {
        endpoint: 'reports/birthdays',
        options: { method: "post" },
    }, { enabled: true });


    const initialState = useKeepGroupedColumnsHidden({
        apiRef,
        initialState: {
            sorting: {
                sortModel: [
                    { field: 'day', sort: 'asc' },
                ],
            },
            columns: {
                columnVisibilityModel: {
                    employee_id: false
                },
            },
            rowGrouping: {
                model: ['month'],
            }
        } as GridInitialState,
    });

    const exceljsPreProcess = ({ workbook, worksheet }: GridExceljsProcessInput): any => {
        workbook.creator = 'Profesto';
        workbook.created = new Date();
        worksheet.properties.defaultRowHeight = 30;

        worksheet.getCell('A1').value = t('reports.list.birthdays');
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
        worksheet.getCell('A3').value = format(new Date(), "MM.dd.yyyy HH:mm:ss");
        worksheet.getCell('A3').font = {
            name: 'Arial',
            size: 10,
        };
        worksheet.addRow({});
    };

    const exceljsPostProcess = ({ worksheet }: GridExceljsProcessInput): any => {
        worksheet.getRow(5).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'cccccc' }
        };
        worksheet.getRow(5).font = {
            size: 12,
            bold: true
        };
        worksheet.getRow(5).alignment = {
            vertical: 'middle',
            horizontal: 'center',
        };
    };

    const onGridStateChange = ({ filter: { filteredRowsLookup }, rows: { idRowsLookup } }: GridState) => {
        if (!isEmpty(filteredRowsLookup)) {
            const filteredRowsIds = Object.keys(filteredRowsLookup).filter(key => filteredRowsLookup[key] && !key.includes('auto-generated-row'));
            let rows = Object.keys(idRowsLookup).map((key) => filteredRowsIds.includes(key) && idRowsLookup[key]).filter((row => row));
            let numberOfEmployees = uniqBy(rows, 'employee_id').length;
            setNumberOfEmployees(numberOfEmployees)
        } else {
            let numberOfEmployees = uniqBy(birthdaysReportData, 'employee_id').length;
            setNumberOfEmployees(numberOfEmployees)
        }
    };

    return (
        <>
            <PageHeaderTitle title={t('reports.birthdays', {count: numberOfEmployees, empl: t('employee.employee')})} />
            <div style={{ display: 'flex', height: '85%', margin: '20px 50px', flexDirection: 'column' }}>
                <DataGrid
                    name="birthday_report"
                    saveGridState
                    apiRef={apiRef}
                    defaultGroupingExpansionDepth={1}
                    onStateChange={onGridStateChange}
                    loading={isLoading}
                    rows={birthdaysReportData}
                    columns={columns}
                    initialState={initialState}
                    enableExports
                    excelOptions={{
                        exceljsPreProcess,
                        exceljsPostProcess,
                        fileName: `${format(new Date(), "yyyy-MM-dd'T'HH:mm")} - Profesto - ${t('reports.list.birthdays')}`,
                    }}
                />
            </div>
        </>
    )
};
