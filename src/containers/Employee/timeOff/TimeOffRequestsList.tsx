import { useMemo, useState } from "react";
import styled from "styled-components";
import { sortBy, uniq } from 'lodash';
import {
    GridColumns,
    GridActionsCellItem,
    GridRenderCellParams,
    GridInitialState,
    GridRowParams,
    useGridApiContext,
    gridFilterModelSelector,
    GridFilterModel,
} from "@mui/x-data-grid-premium";
import Tooltip from "@mui/material/Tooltip";
import useQueryCustom from "hooks/useQueryCustom";
import getYear from "date-fns/getYear";
import DataGrid from "components/DataLists/DataGrid";
import SelectDropDown from "components/Dropdowns/SelectDropdown";
import { usePermissionGate } from "permissions/usePermissionGate";
import { useTranslation } from "react-i18next";
import { ReactComponent as PlusIcon } from 'assets/svg/plus.svg';
import { ReactComponent as MagnifierIcon } from 'assets/svg/actions_circle/magnifier.svg';
import { ReactComponent as ToliaIcon } from 'assets/svg/actions_circle/tick.svg'
import { ReactComponent as CloseIcon } from 'assets/svg/actions_circle/x.svg';
import EditTimeOffModal from "./editTimeOffModal";
import useMutationCustom from "../../../hooks/useMutationCustom";
import {useToasts} from "react-toast-notifications";
import {useQueryClient} from "react-query";
import { dateFormat } from "lib/DateFormat";
import { useSelector } from "react-redux";
import { currentUserSelector } from "redux/selectors";
import RequestTimeOffModal from "./RequestTimeOffModal";
import { IEmployeeMainInfo } from ".";

type TTimeOffListData = {
    id: number,
    note: string,
    period: {
        date_from: string,
        date_to: string
    },
    requested_days: string,
    time_off_status: {
        id: number,
        id_name: string,
        name: string
    },
    time_off_type: string
};

type TTimeOffListDataError = { errors: [{ field?: string, message: string }] };

type TimeOffValues = { id: number | undefined };

interface ICustomToolbar {
    timeOffTypesFromData: string[];
    yearPeriodsFromData: number[],
    statusesTypeFromData: string[]
};

const CustomToolbar = ({ timeOffTypesFromData, yearPeriodsFromData, statusesTypeFromData }: ICustomToolbar) => {
    const { t } = useTranslation();
    const apiRef = useGridApiContext();
    const gridFilterModelItems: GridFilterModel['items'] = gridFilterModelSelector(apiRef).items;

    const statusSelectOptions = [{ id: 1, id_name: 'all', name: t('timeOff.all_statuses') }, ...statusesTypeFromData.map(id => {
        const name = t(`enums.time_off_status.${id}`);
        return {
            id,
            id_name: name.toLocaleLowerCase(),
            name,
        }
    })];
    const typeSelectOptions = [{ id: 1, id_name: 'all', name: t('timeOff.all_time_off_types') }, ...timeOffTypesFromData.map((e, i) => {
        return {
            id: i + 2,
            id_name: e.toLocaleLowerCase(),
            name: e
        }
    })];
    const dateSelectOptions = [{ id: 1, id_name: 'all', name: t('timeOff.all_periods') }, ...yearPeriodsFromData.map((e, i) => {
        return {
            id: i + 2,
            id_name: e,
            name: e
        }
    })];

    let statusFilterGridValue = gridFilterModelItems.find(e => e.columnField === 'time_off_status')?.value;
    let statusSelectValue = statusSelectOptions.find(e => e.id === statusFilterGridValue) ?? { id: 1, id_name: 'all', name: t('timeOff.all_statuses') };

    let dateFilterGridValue = gridFilterModelItems.find(e => e.columnField === 'period.date_to')?.value;
    let dateSelectValue = dateSelectOptions.find(e => e.name === getYear(new Date(dateFilterGridValue)).toString()) ?? { id: 1, id_name: 'all', name: t('timeOff.all_periods') };

    let typeFilterGridValue = gridFilterModelItems.find(e => e.columnField === 'time_off_type')?.value;
    let typeSelectValue = typeSelectOptions.find(e => e.name === typeFilterGridValue) ?? { id: 1, id_name: 'all', name: t('timeOff.all_time_off_types') };

    const onChangeFilter = (value: any, type: string) => {
        if (type === 'status') {
            apiRef.current.upsertFilterItems([...gridFilterModelItems.filter(e => e.columnField !== 'time_off_status'), {
                columnField: 'time_off_status', value: value.id_name === 'all' ? '' : value.id, operatorValue: "equals", id: 'fltr_status'
            }]);
            if (value.id_name === 'all') apiRef.current.deleteFilterItem({ columnField: 'time_off_status', id: 'fltr_status' });
        }
        if (type === 'date') {
            apiRef.current.deleteFilterItem({ columnField: 'period.date_to', id: 'fltr_date' });

            if (value.id_name !== 'all') {
                apiRef.current.upsertFilterItems([...gridFilterModelItems.filter(e => e.columnField !== 'period.date_to'), {
                    columnField: 'period.date_to',
                    value: value.id_name === 'all' ? undefined : value.name,
                    operatorValue: "contains",
                    id: 'fltr_date',
                }]);
            }
        }
        if (type === 'type') {
            apiRef.current.upsertFilterItems([...gridFilterModelItems.filter(e => e.columnField !== 'time_off_type'), {
                columnField: 'time_off_type', value: value.id_name === 'all' ? '' : value.name, operatorValue: "equals", id: 'fltr_type'
            }]);
            if (value.id_name === 'all') apiRef.current.deleteFilterItem({ columnField: 'time_off_type', id: 'fltr_type' });
        };
    };

    return (
        <ListHeaderContainer>
            <HeaderLeftSideContainer>
                <SelectDropDown
                    options={statusSelectOptions}
                    value={statusSelectValue}
                    onChange={(_, value) => onChangeFilter(value, 'status')}
                    disableClearable
                />
                <SelectDropDown
                    options={dateSelectOptions}
                    value={dateSelectValue}
                    onChange={(_, value) => onChangeFilter(value, 'date')}
                    disableClearable
                />
                <SelectDropDown
                    options={typeSelectOptions}
                    value={typeSelectValue}
                    onChange={(_, value) => onChangeFilter(value, 'type')}
                    disableClearable
                />
            </HeaderLeftSideContainer>
        </ListHeaderContainer>
    )
};

const renderStatusCell = (params: GridRenderCellParams) => {

    if (params.row.time_off_status.id === 'pending') {
        return <StatusCellContainer color='#F6A587'>
            <div /> {params.row.time_off_status.name}
        </StatusCellContainer>
    };
    if (params.row.time_off_status.id === 'approved') {
        return <StatusCellContainer color='#5DAE85'>
            <div /> {params.row.time_off_status.name}
        </StatusCellContainer>
    };
    if (params.row.time_off_status.id === 'denied') {
        return <StatusCellContainer color='#D26E6E'>
            <div /> {params.row.time_off_status.name}
        </StatusCellContainer>
    };
    if (params.row.time_off_status.id === 'cancelled') {
        return <StatusCellContainer color='#BEBEBE'>
            <div /> {params.row.time_off_status.name}
        </StatusCellContainer>
    };
    if (params.row.time_off_status.id === 'open_date') {
        return <StatusCellContainer color='#9494FF'>
            <div /> {params.row.time_off_status.name}
        </StatusCellContainer>
    };
};

const renderDateCell = (params: GridRenderCellParams) => {
    const { date_from, date_to } = params.row.period;
    if (date_from === date_to || !date_to) {
        return dateFormat(date_from, 'shortDayAndMonthAndYear');
    };
    if (getYear(new Date(date_from)) === getYear(new Date(date_to))) {
        return dateFormat(date_from, 'shortDayAndMonth') +' - '+ dateFormat(date_to, 'shortDayAndMonthAndYear');
    };
    if (getYear(new Date(date_from)) !== getYear(new Date(date_to))) {
        return dateFormat(date_from, 'shortDayAndMonthAndYear') +' - '+ dateFormat(date_to, 'shortDayAndMonthAndYear');
    };
};

const CustomNoRowsOverlay = () => {
    const { t } = useTranslation();
    return (
        <StyledCustomNoRowsContainer>
            <p>{t('timeOff.no_time_off_request_has_been_added')}</p>
        </StyledCustomNoRowsContainer>
    )
};

type ModalState = {
    type: 'view' | 'edit'
    open: boolean;
}

export default function TimeOffRequestsList({ employeeInfo, onRefresh }: {  employeeInfo: IEmployeeMainInfo, onRefresh: any }) {
    const { role } = usePermissionGate();
    const { t } = useTranslation();

    const currentUser = useSelector(currentUserSelector);
    
    const { data: timeOffRequests = [], isLoading } = useQueryCustom<TTimeOffListData[], TTimeOffListDataError>(["time_off_requests_list", employeeInfo.id], {
        endpoint: `time_off/time_off_request?employee_id=${employeeInfo.id}`,
        options: { method: "get" },
    }, { enabled: true });

    const { addToast } = useToasts();
    const queryClient = useQueryClient();
    const [modal, setModal] = useState<ModalState>({
        type: 'view',
        open: false,
    });
    const [selectedRequest, setSelectedRequest] = useState<TTimeOffListData>();
    const timeOffTypesFromData = sortBy(uniq(timeOffRequests.map(e => e.time_off_type)));
    const yearPeriodsFromData = sortBy(uniq(timeOffRequests.map(e => {
        const from = new Date(e.period.date_from);
        const to = e.period.date_to ? new Date(e.period.date_to) : null;
        return to 
            ? [getYear(from).toString(), getYear(to).toString()] 
            : [getYear(from).toString()];
    }).flat()), (e) => +e);
    const statusesTypeFromData = sortBy(uniq(timeOffRequests.map(e => e.time_off_status.id)));

    const getYearsRange = (date: string) => {
        const startYear = new Date(date).getFullYear();
        const yearsRange = Array.from({ length: 11 }, (_, i) => startYear + i); 
        return yearsRange.join(", ");
    }

    const initialState: GridInitialState = {
        sorting: {
            sortModel: [
                { field: 'period', sort: 'desc' },
            ],
        }
    };

    const isManagerActionForSelf = () => {
        return (currentUser.employee.id === employeeInfo.id && currentUser.permissions.role === 'manager');
    }

    const { mutate: approveTimeOff } = useMutationCustom<string[], TTimeOffListDataError, TimeOffValues>(["approve_time_off"], {
        endpoint: 'time_off/time_off_request/approve', options: { method: "post" },
    }, {
        onSuccess: (_, variables) => {
            addToast(t('timeOff.successfully_approved'), { appearance: 'success', autoDismiss: true });
            queryClient.invalidateQueries('time_off_requests_list');
            onRefresh();
        },
        onError: (err) => {
            err.errors.forEach((item) => {
                addToast(item.message, { appearance: 'error', autoDismiss: true });
            });
        }
    });

    const { mutate: denyTimeOff } = useMutationCustom<string[], TTimeOffListDataError, TimeOffValues>(["deny_time_off"], {
        endpoint: 'time_off/time_off_request/deny', options: { method: "post" },
    }, {
        onSuccess: (_, variables) => {
            addToast(t('timeOff.successfully_denied'), { appearance: 'success', autoDismiss: true });
            queryClient.invalidateQueries('time_off_requests_list');
            onRefresh();
        },
        onError: (err) => {
            err.errors.forEach((item) => {
                addToast(item.message, { appearance: 'error', autoDismiss: true });
            });
        }
    });

    const columns = useMemo<GridColumns>(() => [
        {
            field: 'period',
            headerName: t('timeOff.period'),
            type: 'date',
            renderCell: renderDateCell,
            valueGetter: ({ value }) => value && new Date(value.date_from),
            minWidth: 100, flex: 1
        },
        {
            field: 'period.date_to',
            headerName: t('timeOff.period'),
            valueGetter: (params) => {
                const { row } = params;
                return row.period
                    ? row.period.date_to
                        ? row.period.date_to + ', ' + row.period.date_from
                        : getYearsRange(row.period.date_from)
                    : null;
            },
            hide: true
        },
        { field: 'time_off_type', headerName: t('timeOff.type'), minWidth: 100, flex: .7 },
        { field: 'note', headerName: t('timeOff.note'), minWidth: 100, flex: 1 },
        {
            field: 'time_off_status',
            headerName: t('timeOff.status'),
            valueGetter: ({ value }) => value && value.id,
            renderCell: renderStatusCell,
            minWidth: 100, flex: .6
        },
        {
            field: 'requested_days',
            type: 'number',
            headerName: t('timeOff.days_requested'),
            minWidth: 100,
            flex: .6,
            valueFormatter: ({ value }) => value % 1 === 0 ? parseInt(value) : value,
        },
        {
            field: 'actions',
            type: 'actions',
            width: 100,
            getActions: (params: GridRowParams) => [
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
                            type: params.row.period.date_to ? 'view' : 'edit',
                            open: true,
                        });
                    }}
                    sx={{ 
                        padding: '2px', 
                        '&:hover': { backgroundColor: 'transparent' }
                    }}
                />,
                ...params.row.time_off_status.id === 'pending' && role !== 'employee' && !isManagerActionForSelf() ? [
                    <GridActionsCellItem
                        className="actionButton"
                        icon={
                            <Tooltip title={t('timeOff.approve')} disableInteractive arrow>
                                <StyledActionIcon as={ToliaIcon} />
                            </Tooltip>
                        }
                        label={t('timeOff.approve')}
                        onClick={() => approveTimeOff({id: params.row.id})}
                        sx={{ padding: '2px', '&:hover': { backgroundColor: 'transparent' } }}
                    />,
                    <GridActionsCellItem
                        className="actionButton"
                        icon={
                            <Tooltip title={t('timeOff.deny')} disableInteractive arrow>
                                <StyledActionIcon as={CloseIcon} />
                            </Tooltip>
                        }
                        label={t('timeOff.deny')}
                        onClick={() => denyTimeOff({id: params.row.id})}
                        sx={{ padding: '2px', '&:hover': { backgroundColor: 'transparent' } }}
                    />
                ] : [],
            ]
        },
    ], [role]);

    return (
        <GridContainer>
            <DataGrid
                name="time_off_list"
                discardQueryStringSaveRestrict
                saveGridState
                components={{
                    Toolbar: CustomToolbar,
                    NoRowsOverlay: CustomNoRowsOverlay,
                }}
                componentsProps={{
                    toolbar: {
                        timeOffTypesFromData,
                        yearPeriodsFromData,
                        statusesTypeFromData
                    }
                }}
                loading={isLoading}
                rows={timeOffRequests}
                columns={columns}
                initialState={initialState}
                rowHeight={40}
                disableColumnMenu
                disableColumnFilter
            />
            {modal.open &&
                (modal.type === 'view' ? (
                    <EditTimeOffModal
                        open={modal.open}
                        onClose={() => setModal(prev => ({...prev, open: false}))}
                        requestId={selectedRequest?.id}
                        employeeId={employeeInfo.id}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <RequestTimeOffModal
                        open={modal.open}
                        onRefresh={onRefresh}
                        onClose={() => setModal(prev => ({...prev, open: false}))}
                        mode={'edit'}
                        requestId={selectedRequest!.id}
                        employeeInfo={employeeInfo}
                    />
                )
            )}
        </GridContainer>
    );
};

const GridContainer = styled.div`
    padding: 20px 15px;
    height: 580px;
`;

const ListHeaderContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
`;

const HeaderLeftSideContainer = styled.div`
    display: flex;
    flex: 1;
    max-width: 625px;
    gap: 10px;
`;

const StatusCellContainer = styled.div<{ color: string }>`
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${({ color }) => color};
    & > div {
        margin-right: 6px;
        background-color: ${({ color }) => color};
        width: 10px;
        height: 10px;
        border-radius: 50%;
    };
`;

const StyledCustomNoRowsContainer = styled.div`
    padding: 20px 30px;
    p {
        text-align: left;
        font-size: 11px;
        color: #80888D;
    };
`;

const StyledPlusIcon = styled(PlusIcon)`
    width: 13px;
    height: 13px;
    margin-right: 5px;
    path {
        fill: #FFF;
    }
`;

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