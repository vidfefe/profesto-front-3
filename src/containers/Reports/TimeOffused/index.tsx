import { useState, useEffect } from 'react';
import styled from "styled-components";
import {
    GridColDef,
    GridInitialState,
    GridRenderCellParams,
    GridExceljsProcessInput,
    GridState,
} from "@mui/x-data-grid-premium";
import DataGrid from "components/DataLists/DataGrid";
import { PageHeaderTitle } from "components/DesignUIComponents";
import EmployeeCard from "components/Employee/Card";
import { isEmpty, map, uniqBy } from "lodash";
import format from "date-fns/format";
import { useSelector } from "react-redux";
import { currentUserSelector } from "redux/selectors";
import PermissionGate from 'permissions/PermissionGate';
import { useTranslation } from "react-i18next";
import useMutationCustom from "hooks/useMutationCustom";

export default function TimeOffused() {
    const { t } = useTranslation();
    const [numberOfEmployees, setNumberOfEmployees] = useState<number>(0);
    const [list, setList] = useState<any>([]);
    const [columns, setColumns] = useState<GridColDef[]>([
        {
            field: 'employee', 
            headerName: t('employee.employee'),
            renderCell: (params) => renderAvatarCell(params, 'employee'),
            valueGetter: ({ value }) => `${value.first_name} ${value.last_name}`,
            minWidth: 150,
            flex: 1
        },
        { field: 'id', headerName: t('employee.short_emp_id'), minWidth: 100, flex: 0.3 },
        {
            field: 'status', headerName: t('employee.status'),
            type: 'singleSelect',
            valueOptions: [t('employee.statuses.hiring'), t('employee.statuses.active'), t('employee.statuses.terminated')],
            valueGetter: ({ value }) => value && t('employee.statuses.'+value),
            minWidth: 100, flex: 1
        },
        { field: 'job_title', headerName:  t('employee.job.job_title'), minWidth: 100, flex: 1 },
        { field: 'employment_status', headerName: t('employee.short_employment_status'), minWidth: 100, flex: 1 },
        { field: 'work_type', headerName: t('employee.job.work_type'), minWidth: 100, flex: 1 },
        { field: 'department', headerName: t('employee.job.department'), minWidth: 100, flex: 1 },
        { field: 'division', headerName: t('employee.job.division'), minWidth: 100, flex: 1 },
        { field: 'location', headerName: t('employee.address.location'), minWidth: 100, flex: 1 },
        {
            field: 'manager',
            headerName: t('employee.job.manager_t'),
            renderCell: (params) => renderAvatarCell(params, 'manager'),
            valueGetter: ({ value }) => value.first_name ? `${value.first_name} ${value.last_name}` : '',
            minWidth: 150, flex: 1
        },


    ]);
    const [mainColumns, setMainColumns] = useState<GridColDef[]>([]);
    const [dates, setDates] = useState<any>(null);
    const [columnOrder, setColumnOrder] = useState<any>(null)

    const renderAvatarCell = (params: GridRenderCellParams, type: string) => {
        return params.row[type]?.first_name ?
            <PermissionGate on='employee' properties={{ disabled: (currentUser.permissions.role !== 'manager') }}>
                <EmployeeCard fontSize={12} employee={params.row[type]} />
            </PermissionGate> : ""
    };

    useEffect(() => {
        getData(dates);
    }, [dates]);


    const { mutate: getData, isLoading: typesLoading } = useMutationCustom<string[], {}, {}>(["time_off_request_types"], {
        endpoint: '/reports/time_off_used/types', options: { method: "post" },
    }, {
        onSuccess: (_, variables) => {
            getTypeOffUsedList(dates);
            createColumns(_);
        }
    });

    const { mutate: getTypeOffUsedList, isLoading: typeOffUsedListLoading } = useMutationCustom<string[], {}, {}>(["time_off_request_list"], {
        endpoint: '/reports/time_off_used', options: { method: "post" },
    }, {
        onSuccess: (_, variables) => {
            setList(_)
        }
    });

    const createColumns = (types: any) => {
        const createField = map(types, (x, index) => {
            return {
                field: x.id.toString(),
                tempColumn: true,
                headerName: x.name,
                minWidth: 150,
                flex: 1,
                renderCell: (params: any) => {
                    return params?.row?.days[x.id.toString()]
                },
                valueGetter: (props: any) => {
                    return props?.row?.days[x.id.toString()];
                }
            }
        });
        setMainColumns([...columns, ...createField]);
    }


    const currentUser = useSelector(currentUserSelector);

    const initialState: GridInitialState = {
        filter: {
        },
        sorting: {
            sortModel: [
                { field: 'employee', sort: 'asc' },
                { field: 'date_from', sort: 'desc' },
            ],
        },
        columns: {
            columnVisibilityModel: {
                work_type: false,
                department: false,
                division: false,
                location: false,
                manager: false,
            }
        }
    };

    const renderPeriodDates = () => {
        if (dates?.filter?.start_date && dates?.filter?.end_date) {
            return format(dates?.filter?.start_date, "dd.MM.yyyy")+ ' - '+format(dates?.filter?.end_date, "dd.MM.yyyy");
        }
        else if (dates?.filter?.start_date && !dates?.filter?.end_date) {
            return format(dates?.filter?.start_date, "dd.MM.yyyy");
        }
        else if (!dates?.filter?.start_date && dates?.filter?.end_date) {
            return format(dates?.filter?.end_date, "dd.MM.yyyy");
        }
        else {
            return format(new Date(), "dd.MM.yyyy");
        }
    }

    const exceljsPreProcess = ({ workbook, worksheet }: GridExceljsProcessInput): any => {
        workbook.creator = 'Profesto';
        workbook.created = new Date();
        worksheet.properties.defaultRowHeight = 30;

        worksheet.getCell('A1').value = t('reports.list.time_off_used');
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
        worksheet.getCell('A3').font = { name: 'Arial', size: 10};

        worksheet.getCell('A4').value = '';
        worksheet.getCell('A4').font = {};

        worksheet.getCell('A5').value = t('timeOff.period')+' '+renderPeriodDates();
        worksheet.getCell('A5').font = { name: 'Arial Black', size: 12, bold: true};
        
    };

    const exceljsPostProcess = ({ worksheet }: GridExceljsProcessInput): any => {
        worksheet.getRow(6).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'cccccc' }
        };
        worksheet.getRow(6).font = {
            size: 12,
            bold: true
        };
        worksheet.getRow(5).alignment = {
            vertical: 'middle',
            horizontal: 'center',
        };
    };

    const onGridStateChange = ({ filter: { filteredRowsLookup }, rows: { idRowsLookup }, columns }: GridState) => {
        if (!isEmpty(filteredRowsLookup)) {
            const filteredRowsIds = Object.keys(filteredRowsLookup).filter(key => filteredRowsLookup[key]);
            let rows = Object.keys(idRowsLookup).map((key) => filteredRowsIds.includes(key) && idRowsLookup[key]).filter((row => row));
            let numberOfEmployees = uniqBy(rows, 'id').length;
            setNumberOfEmployees(numberOfEmployees)
        } else {
            let numberOfEmployees = uniqBy(list, 'id').length;
            setNumberOfEmployees(numberOfEmployees)
        }
    };

    return (
        <>
            <PageHeaderTitle title={t('reports.time_off_used_recrods', {count: list.length})} />
            <div style={{ display: 'flex', height: '85%', margin: '20px 50px', flexDirection: 'column' }}>
                <DataGrid
                    name="time_off_used_report"
                    saveGridState
                    disableRowGrouping
                    onStateChange={onGridStateChange}
                    loading={typeOffUsedListLoading || typesLoading}
                    rows={list}
                    columns={!isEmpty(mainColumns) ? mainColumns : columns}
                    initialState={initialState}
                    onColumnOrderChange={(e) => setColumnOrder(e)}
                    rangePicker={(e: any) => {
                        setDates({filter: {
                            start_date: e.start ? e.start : null, 
                            end_date: e.end ? e.end : null
                        }})
                    }}
                    enableExports
                    excelOptions={{
                        exceljsPreProcess,
                        exceljsPostProcess,
                        fileName: `${format(new Date(), "yyyy-MM-dd'T'HH:mm")} - Profesto - ${t('reports.list.time_off_used')}`,
                    }}
                />
            </div>
        </>
    )
};
