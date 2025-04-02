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
import { getTimeOffRequestTypes} from "services";
import SelectDropdown from "components/Dropdowns/SelectDropdown";
import { formatNumber } from 'utils/common';

export default function TimeOffBalance() {
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
        { 
            field: 'id', 
            headerName: t('employee.short_emp_id'), 
            minWidth: 100, 
            flex: 0.3 
        },
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
        {
            field: 'start_days',
            headerName: t('reports.balances.beginning_balance'), 
            valueGetter: ({ value }) => value && value,
            valueFormatter: ({ value }) => value && value !== 0 ? formatNumber(Number(value)) : '-',
            minWidth: 100,
            flex: 0.6
        },
        {
            field: 'added_days',
            headerName: t('reports.balances.accrued'), 
            valueGetter: ({ value }) => value && value,
            valueFormatter: ({ value }) => value && value !== 0 ? formatNumber(Number(value)) : '-',
            minWidth: 100,
            flex: 0.6
        },
        {
            field: 'used_days',
            headerName: t('reports.balances.used'), 
            valueGetter: ({ value }) => value && value,
            valueFormatter: ({ value }) => value && value !== 0 ? formatNumber(Number(value)) : '-',
            minWidth: 100,
            flex: 0.6
        },
        {
            field: 'scheduled_days',
            headerName: t('reports.balances.scheduled'), 
            valueGetter: ({ value }) => value && value,
            valueFormatter: ({ value }) => value && value !== 0 ? formatNumber(Number(value)) : '-',
            minWidth: 100,
            flex: 0.6
        },
        {
            field: 'adjustment_days',
            headerName: t('reports.balances.adjustments'), 
            valueGetter: ({ value }) => value && value,
            valueFormatter: ({ value }) => value && value !== 0 ? formatNumber(Number(value)) : '-',
            minWidth: 100,
            flex: 0.6
        },
        {
            field: 'annulled_days',
            headerName: t('reports.balances.annulled'), 
            valueGetter: ({ value }) => value && value,
            valueFormatter: ({ value }) => value && value !== 0 ? formatNumber(Number(value)) : '-',
            minWidth: 100,
            flex: 0.6
        },
        {
            field: 'end_days',
            headerName: t('reports.balances.ending_balance'), 
            valueGetter: ({ value }) => value && value,
            valueFormatter: ({ value }) => value && value !== 0 ? formatNumber(Number(value)) : '-',
            minWidth: 100,
            flex: 0.6
        },

    ]);
    const [mainColumns, setMainColumns] = useState<GridColDef[]>([]);
    const [columnOrder, setColumnOrder] = useState<any>(null);
    const [timeOfftype, setTimeOffType] = useState<any>(null);
    const [filterDates, setFilterDates] = useState<any>(null);

    const renderAvatarCell = (params: GridRenderCellParams, type: string) => {
        return params.row[type]?.first_name ?
            <PermissionGate on='employee' properties={{ disabled: (currentUser.permissions.role !== 'manager') }}>
                <EmployeeCard fontSize={12} employee={params.row[type]} />
            </PermissionGate> : ""
    };

    useEffect(() => {
        if (timeOfftype && filterDates?.start && filterDates?.end) {
            getTypeOffUsedList({
                filters: {
                    time_off_type_id: timeOfftype?.id,
                    start_date: filterDates?.start,
                    end_date: filterDates?.end
                }
            });
        }
    }, [timeOfftype, filterDates]);




    useEffect(() => {
        getTimeOffRequestTypes(100, 1, false, true).then((res: any) => {
            setTimeOffType(res?.data?.list[0])
        })
    }, []);

    const { mutate: getTypeOffUsedList, isLoading: typeOffUsedListLoading } = useMutationCustom<string[], {}, {}>(["time_off_balances_list"], {
        endpoint: '/reports/time_off_balance', options: { method: "post" },
    }, {
        onSuccess: (_, variables) => {
            setList(_)
        }
    });

    const currentUser = useSelector(currentUserSelector);

    const initialState: GridInitialState = {
        filter: {
        },
        sorting: {
            sortModel: [
                { field: 'employee', sort: 'asc' }
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
        if (filterDates?.start && filterDates?.end) {
            return format(filterDates?.start, "dd.MM.yyyy")+ ' - '+format(filterDates?.end, "dd.MM.yyyy");
        }
        else if (filterDates?.start && !filterDates?.end) {
            return format(filterDates?.start, "dd.MM.yyyy")+ ' - ...';
        }
        else if (!filterDates?.start && filterDates?.end) {
            return '... - '+format(filterDates?.end, "dd.MM.yyyy");
        }
        else {
            return format(new Date(), "dd.MM.yyyy");
        }
    }

    const exceljsPreProcess = ({ workbook, worksheet }: GridExceljsProcessInput): any => {
        workbook.creator = 'Profesto';
        workbook.created = new Date();
        worksheet.properties.defaultRowHeight = 30;

        worksheet.getCell('A1').value = t('reports.list.time_off_balances');
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

        worksheet.getCell('A5').value = t('timeOff.period') + ': '+ renderPeriodDates();
        worksheet.getCell('A5').font = { name: 'Arial', size: 10};
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

    const onChangeTimeOffTypeScelect = (value: any) => {
        setTimeOffType(value)
    }

    return (
        <>
            <PageHeaderTitle title={t('reports.time_off_balance_recrods', {count: numberOfEmployees})} />
            <div style={{ display: 'flex', height: '85%', margin: '20px 50px', flexDirection: 'column' }}>
                <DataGrid
                    name="time_off_balances_report"
                    saveGridState
                    disableRowGrouping
                    onStateChange={onGridStateChange}
                    loading={typeOffUsedListLoading}
                    rows={list}
                    columns={!isEmpty(mainColumns) ? mainColumns : columns}
                    initialState={initialState}
                    onColumnOrderChange={(e) => setColumnOrder(e)}
                    getRowId={(row) => row.employee.id}
                    initialDates={true}
                    rangePicker={(e: any) => {
                        setFilterDates({
                            start: e.start,
                            end: e.end
                        })
                    }}
                    timeOffTypeInput={() => (
                        <SelectWrapper>
                            <SelectDropdown
                                size="small"
                                inputPlaceholder={t('globaly.select', {title: t('timeOff.time_off_type')})}
                                onChange={(_event: any, newValue: any) => {
                                    onChangeTimeOffTypeScelect(newValue)
                                }}
                                value={timeOfftype}
                                style={{marginRight: 10}}
                                sx={{ width: 220}}
                                disableClearable
                                loadRemoteData={() => getTimeOffRequestTypes(100, 1, false, true)}
                                
                            />
                        </SelectWrapper>
                    )}
                    enableExports
                    excelOptions={{
                        exceljsPreProcess,
                        exceljsPostProcess,
                        fileName: `${format(new Date(), "yyyy-MM-dd'T'HH:mm")} - Profesto - ${t('reports.list.time_off_balances')}`,
                    }}
                />
            </div>
        </>
    )
};

const SelectWrapper = styled.div `
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

`
