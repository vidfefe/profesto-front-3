import { useState, useEffect } from 'react';
import styled from "styled-components";
import {
    GridColDef,
    GridInitialState,
    GridRenderCellParams,
    GridExceljsProcessInput,
    GridState,
    GridActionsCellItem,
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
import { region } from 'lib/Regionalize';
import { changeColumns } from 'lib/ChnageColumns';
import { dateFormat } from 'lib/DateFormat';
import useMutationCustom from "../../../hooks/useMutationCustom";
import { ReactComponent as MagnifierIcon } from 'assets/svg/actions_circle/magnifier.svg';
import { Tooltip } from '@mui/material';
import EditTimeOffModal from 'containers/Employee/timeOff/editTimeOffModal';
import RequestTimeOffModal from 'containers/Employee/timeOff/RequestTimeOffModal';

type ModalState = {
    type: 'view' | 'edit'
    open: boolean;
}

export default function TimeOffRequests() {
    const { t } = useTranslation();
    const [numberOfEmployees, setNumberOfEmployees] = useState<number>(0);
    const [list, setList] = useState<any>([]);
    const [filterDates, setFilterDates] = useState<{ start: any; end: any }>({
        start: null,
        end: null,
    });
    const [modal, setModal] = useState<ModalState>({
        type: 'view',
        open: false,
    });
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [columns, setColumns] = useState<GridColDef[]>([
        {
            field: 'employee', 
            headerName: t('employee.employee'),
            renderCell: (params) => renderAvatarCell(params, 'employee'),
            valueGetter: ({ value }) => `${value?.first_name} ${value?.last_name}`,
            minWidth: 150,
            flex: 1
        },
        { field: 'time_off_type_name', headerName: t('timeOff.time_off_type'), minWidth: 100, flex: 0.6 },
        {
            field: 'date_from',
            headerName: t('timeOff.date_from'), 
            type: 'date',
            valueGetter: ({ value }) => value && new Date(value),
            valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDate'),
            minWidth: 100,
            flex: 0.6
        },
        {
            field: 'date_to',
            headerName: t('timeOff.date_to'), 
            type: 'date',
            valueGetter: ({ value }) => value && new Date(value),
            valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDate'),
            minWidth: 100,
            flex: 0.6
        },
        {
            field: 'requested_days',
            headerName: t('timeOff.total_requested_days'),
            minWidth: 100, flex: 0.6
        },
        {
            field: 'time_off_status',
            headerName: t('timeOff.request_status'),
            minWidth: 100, flex: 0.6
        },
        {
            field: 'note',
            headerName: t('timeOff.noteComment'),
            minWidth: 100, 
            flex: 0.6
        },
        { field: 'employee_id', headerName: t('employee.short_emp_id'), minWidth: 100, flex: 0.3 },
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
            field: 'created_at',
            headerName: t('timeOff.created_at'), 
            type: 'date',
            valueGetter: ({ value }) => value && new Date(value),
            valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDateAndTime'),
            minWidth: 100,
            flex: 0.6
        },
        {
            field: 'created_data',
            headerName: t('timeOff.created_by'),
            renderCell: (params) => renderAvatarCell(params, 'created_data'),
            valueGetter: ({ value }) => value?.employee?.first_name ? `${value?.employee?.first_name} ${value?.employee?.last_name}` : '',
            minWidth: 150, flex: 1
        },
        {
            field: 'requested_at',
            headerName: t('timeOff.requested_at'), 
            type: 'date',
            valueGetter: ({ value }) => value && new Date(value),
            valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDateAndTime'),
            minWidth: 100,
            flex: 0.6
        },
        {
            field: 'requested_data',
            headerName: t('timeOff.requested_by'),
            renderCell: (params) => renderAvatarCell(params, 'requested_data'),
            valueGetter: ({ value }) => value?.employee?.first_name ? `${value?.employee?.first_name} ${value?.employee?.last_name}` : '',
            minWidth: 150, flex: 1
        },
        {
            field: 'approved_at',
            headerName: t('timeOff.approved_at'), 
            type: 'date',
            valueGetter: ({ value }) => value && new Date(value),
            valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDateAndTime'),
            minWidth: 100,
            flex: 0.6
        },
        {
            field: 'approved_data',
            headerName: t('timeOff.approved_by'),
            renderCell: (params) => renderAvatarCell(params, 'approved_data'),
            valueGetter: ({ value }) => value?.employee?.first_name ? `${value?.employee?.first_name} ${value?.employee?.last_name}` : '',
            minWidth: 150, flex: 1
        },
        {
            field: 'denied_at',
            headerName: t('timeOff.denied_at'), 
            type: 'date',
            valueGetter: ({ value }) => value && new Date(value),
            valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDateAndTime'),
            minWidth: 100,
            flex: 0.6
        },
        {
            field: 'denied_data',
            headerName: t('timeOff.denied_by'),
            renderCell: (params) => renderAvatarCell(params, 'denied_data'),
            valueGetter: ({ value }) => value?.employee?.first_name ? `${value?.employee?.first_name} ${value?.employee?.last_name}` : '',
            minWidth: 150, flex: 1
        },
        {
            field: 'canceled_at',
            headerName: t('timeOff.canceled_at'), 
            type: 'date',
            valueGetter: ({ value }) => value && new Date(value),
            valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDateAndTime'),
            minWidth: 100,
            flex: 0.6
        },
        {
            field: 'cancelled_data',
            headerName: t('timeOff.canceled_by'),
            renderCell: (params) => renderAvatarCell(params, 'cancelled_data'),
            valueGetter: ({ value }) => value?.employee?.first_name ? `${value?.employee?.first_name} ${value?.employee?.last_name}` : '',
            minWidth: 150, flex: 1
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: t('globaly.action'),
            renderHeader: () => (<></>),
            renderCell: (params: GridRenderCellParams) => (
                <GridActionsCellItem
                    className="actionButton"
                    icon={
                        <Tooltip title={t('timeOff.view')} disableInteractive arrow>
                            <StyledActionIcon as={MagnifierIcon} />
                        </Tooltip>
                    }
                    label={t('timeOff.view')}
                    onClick={() => {
                        setSelectedRequest(params.row);
                        setModal({
                            type: params.row.date_to ? 'view' : 'edit',
                            open: true,
                        });
                    }}
                    sx={{ 
                        padding: '2px', 
                        '&:hover': { backgroundColor: 'transparent' }
                    }}
                />
            )
        },
    ]);

    const renderAvatarCell = (params: GridRenderCellParams, type: string) => {
        const employee = params.row[type]?.employee ?? params.row[type];
        return employee?.first_name ?
            <PermissionGate on='employee' properties={{ disabled: (currentUser.permissions.role !== 'manager') }}>
                <EmployeeCard fontSize={12} employee={employee} />
            </PermissionGate> : ""
    };

    const { mutate: getData } = useMutationCustom<string[], {}, {}>(["time_off_used_report"], {
        endpoint: '/reports/time_off_requests', options: { method: "post" },
    }, {
        onSuccess: (_) => {
            setListData(_);
        }
    });

    useEffect(() => {
        if (region(['eng'])) {
            const newColumns = changeColumns(['personal_number'], columns);
            setColumns(newColumns);
        }
    }, []);

    useEffect(() => {
        getTimeOffRequests({
            filter: {
                start_date: filterDates?.start || null,
                end_date: filterDates?.end || null,
            },
        });
    }, [filterDates]);

    const { mutate: getTimeOffRequests, isLoading: timeOffRequestsLoading } =
        useMutationCustom<string[], {}, {}>(
            ['time_off_used_report'],
            {
                endpoint: '/reports/time_off_requests',
                options: { method: 'post' },
            },
            {
                onSuccess: (_, variables) => {
                    setListData(_);
                },
            }
        );

    const setListData = (timeOffRequestsData: any): any => {
        if (!isEmpty(timeOffRequestsData)) {
            const newData = map(timeOffRequestsData, (x) => {
                return {
                    ...x,
                    employee_id: x.employee?.id,
                    created_at: x?.created_data?.created_at,
                    requested_at: x?.requested_data?.created_at,
                    approved_at: x?.approved_data?.created_at,
                    denied_at: x?.denied_data?.created_at,
                    canceled_at: x?.cancelled_data?.created_at
                }
            })
            setList(newData);
        }
    }

    const currentUser = useSelector(currentUserSelector);

    const initialState: GridInitialState = {
        filter: {
        },
        pinnedColumns: { right: ['actions'] },
        sorting: {
            sortModel: [
                { field: 'employee', sort: 'asc' },
                { field: 'date_from', sort: 'desc' },
            ],
        },
        columns: {
            columnVisibilityModel: {
                employment_status: false,
                work_type: false,
                department: false,
                division: false,
                location: false,
                manager: false,
                created_at: false,
                created_data: false,
                requested_at: false,
                requested_data: false,
                approved_at: false,
                approved_data: false,
                denied_at: false,
                denied_data: false,
                canceled_at: false,
                cancelled_data: false
            }
        }
    };

    const exceljsPreProcess = ({ workbook, worksheet }: GridExceljsProcessInput): any => {
        workbook.creator = 'Profesto';
        workbook.created = new Date();
        worksheet.properties.defaultRowHeight = 30;

        worksheet.getCell('A1').value = t('reports.list.time_off_requests');
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

        worksheet.getCell('A4').value = '';
        worksheet.getCell('A4').font = {};

        worksheet.getCell('A5').value = t('reports.benefits.period') + ': ' + renderPeriodDates();
        worksheet.getCell('A5').font = { name: 'Arial', size: 10 };
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

    const onGridStateChange = ({ filter: { filteredRowsLookup }, rows: { idRowsLookup } }: GridState) => {
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

    const renderPeriodDates = () => {
        if (!filterDates?.start && !filterDates?.end) {
            return '-';
        } else {
            const start = filterDates?.start ? format(filterDates.start, 'dd.MM.yyyy') : '...';
            const end = filterDates?.end ? format(filterDates.end, 'dd.MM.yyyy') : '...';
            return `${start} - ${end}`;
        }
    };

    return (
        <>
            <PageHeaderTitle title={t('reports.time_off_request_recrods', {count: numberOfEmployees})} />
            <div style={{ display: 'flex', height: '85%', margin: '20px 50px', flexDirection: 'column' }}>
                <DataGrid
                    name="time_off_request"
                    saveGridState
                    disableRowGrouping
                    onStateChange={onGridStateChange}
                    loading={timeOffRequestsLoading}
                    rows={list}
                    columns={columns}
                    initialState={initialState}
                    rangePicker={(e: any) => {
                        setFilterDates({
                            start: e.start,
                            end: e.end,
                        });
                    }}
                    enableExports
                    excelOptions={{
                        exceljsPreProcess,
                        exceljsPostProcess,
                        fileName: `${format(new Date(), "yyyy-MM-dd'T'HH:mm")} - Profesto - ${t('reports.list.time_off_requests')}`,
                    }}
                />
                {modal.open &&
                    (modal.type === 'view' ? (
                        <EditTimeOffModal
                            open={modal.open}
                            onClose={() => setModal(prev => ({...prev, open: false}))}
                            requestId={selectedRequest?.id}
                            employeeId={selectedRequest?.employee?.id}
                            onRefresh={getData}
                        />
                    ) : (
                        <RequestTimeOffModal
                            open={modal.open}
                            onRefresh={() => getData('time_off_used_report')}
                            onClose={() => setModal(prev => ({...prev, open: false}))}
                            mode={'edit'}
                            requestId={selectedRequest!.id}
                            employeeInfo={selectedRequest?.employee}
                        />
                    )
                )}
            </div>
        </>
    )
};

const StyledActionIcon = styled.svg`
    width: 22px;
    height: 22px;
    &:hover {
        circle {
            fill: #396
        };
        path:not(#Vector, #Vector-2) {
            fill: #FFF
        };
        #Vector, #Vector-2 {
            stroke: #FFF;
        };
    }
`;
