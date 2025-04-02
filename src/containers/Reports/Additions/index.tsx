import { useState, useEffect } from 'react';
import styled from "styled-components";
import {
    GridColDef,
    GridExceljsProcessInput,
    GridInitialState,
    GridRenderCellParams,
    GridState
} from "@mui/x-data-grid-premium";
import DataGrid from "components/DataLists/DataGrid";
import { PageHeaderTitle } from "components/DesignUIComponents";
import EmployeeCard from "components/Employee/Card";
import useQuery from "hooks/useQueryCustom";
import { isEmpty, uniqBy, filter } from "lodash";
import format from "date-fns/format";
import { useSelector } from "react-redux";
import { currentUserSelector } from "redux/selectors";
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



export default function AdditionsReport() {
    const { t, i18n } = useTranslation();
    const [numberOfEmployees, setNumberOfEmployees] = useState<number>(0);
    const [columns, setColumns] = useState<GridColDef[]>([
        {
            field: 'employee', headerName: t('employee.employee'),
            renderCell: (params) => renderAvatarCell(params, 'employee'),
            valueGetter: ({ value }) => `${value.first_name} ${value.last_name}`,
            minWidth: 150, flex: 1
        },
        { field: 'employee_id', headerName: t('employee.short_emp_id'), minWidth: 100, flex: 0.6 },
        { field: 'personal_number', headerName: t('employee.personal_number'), minWidth: 150, flex: 1 },
        {
            field: 'hire_date',
            headerName: t('employee.job.hire_date'),
            type: 'date',
            valueGetter: ({ value }) => value && new Date(value),
            valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDate'),
            minWidth: 100, flex: 0.6
        },
        {
            field: 'status', headerName: t('employee.status'),
            type: 'singleSelect',
            valueOptions: [t('employee.statuses.hiring'), t('employee.statuses.active'), t('employee.statuses.terminated')],
            valueGetter: ({ value }) => value && t('employee.statuses.'+value),
            minWidth: 100, flex: 0.6
        },
        { field: 'employment_status', headerName: t('employee.short_status'), minWidth: 100, flex: 1 },
        { field: 'work_type', headerName: t('employee.job.work_type'), minWidth: 100, flex: 1 },
        { field: 'job_title', headerName: t('employee.job.job_title'), minWidth: 100, flex: 1 },
        { field: 'department', headerName: t('employee.job.department'), minWidth: 100, flex: 1 },
        { field: 'division', headerName: t('employee.job.division'), minWidth: 100, flex: 1 },
        { field: 'location', headerName: t('employee.address.location'), minWidth: 100, flex: 1 },
    ]);

    useEffect(() => {
        if (region(['eng'])) {
            const newColumns = changeColumns(['personal_number'], columns);
            setColumns(newColumns);
        }
    }, []);


    const { data: additionsReportData = [], isLoading } = useQuery<any>(["additions_report"], {
        endpoint: 'reports/hire',
        options: { method: "post" },
    }, { enabled: true });

    const currentUser = useSelector(currentUserSelector);

    const initialState: GridInitialState = {
        sorting: {
            sortModel: [
                { field: 'hire_date', sort: 'desc' },
                { field: 'employee', sort: 'asc' },
            ],
        },
        columns: {
            columnVisibilityModel: {}
        }
    };

    const exceljsPreProcess = ({ workbook, worksheet }: GridExceljsProcessInput): any => {
        workbook.creator = 'Profesto';
        workbook.created = new Date();
        worksheet.properties.defaultRowHeight = 30;

        worksheet.getCell('A1').value = t('reports.list.additions');
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
            const filteredRowsIds = Object.keys(filteredRowsLookup).filter(key => filteredRowsLookup[key]);
            let rows = Object.keys(idRowsLookup).map((key) => filteredRowsIds.includes(key) && idRowsLookup[key]).filter((row => row));
            let numberOfEmployees = uniqBy(rows, 'employee_id').length;
            setNumberOfEmployees(numberOfEmployees)
        } else {
            let numberOfEmployees = uniqBy(additionsReportData, 'employee_id').length;
            setNumberOfEmployees(numberOfEmployees)
        }
    };

    return (
        <>
            <PageHeaderTitle title={t('reports.additions', {count: numberOfEmployees, empl: t('employee.employee')})} />
            <div style={{ display: 'flex', height: '85%', margin: '20px 50px', flexDirection: 'column' }}>
                <DataGrid
                    name="additions_report"
                    saveGridState
                    disableRowGrouping
                    onStateChange={onGridStateChange}
                    loading={isLoading}
                    rows={additionsReportData}
                    columns={columns}
                    initialState={initialState}
                    enableExports
                    excelOptions={{
                        exceljsPreProcess,
                        exceljsPostProcess,
                        fileName: `${format(new Date(), "yyyy-MM-dd'T'HH:mm")} - Profesto - ${t('reports.list.additions')}`,
                    }}
                />
            </div>
        </>
    )
};
