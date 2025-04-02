import { useState, useEffect } from 'react';
import styled from "styled-components";
import {
    GridColDef,
    GridExceljsProcessInput,
    GridInitialState,
    GridRenderCellParams,
    GridState,
    GridLinkOperator,
    useGridApiContext,
    GridExportMenuItemProps,
    GridPreferencePanelParams,
    GridExcelExportOptions,
    GridToolbarExportContainer,
    GridToolbarContainer,
    GridToolbarQuickFilter,
    GridToolbarFilterButton,
    GridToolbarColumnsButton,
    GridToolbarContainerProps
} from "@mui/x-data-grid-premium";
import MenuItem from '@mui/material/MenuItem';
import DataGrid from "components/DataLists/DataGrid";
import { PageHeaderTitle } from "components/DesignUIComponents";
import DatePicker from 'components/DatePickers/DatePicker';
import EmployeeCard from "components/Employee/Card";
import useQuery from "hooks/useQueryCustom";
import { isEmpty, uniqBy } from "lodash";
import format from "date-fns/format";
import { useSelector } from "react-redux";
import { currentUserSelector } from "redux/selectors";
import PermissionGate from 'permissions/PermissionGate';
import { useTranslation } from "react-i18next";

import { ReactComponent as MagnifierIcon } from 'assets/svg/magnifier.svg';
import { ReactComponent as CloseIcon } from 'assets/svg/close-icon.svg';
import { region } from 'lib/Regionalize';
import { changeColumns } from 'lib/ChnageColumns';
import { dateFormat } from 'lib/DateFormat';
interface ICustomToolbarProps extends GridToolbarContainerProps {
    setPanelsButtonEl: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>,
    date: Date,
    setDate: React.Dispatch<React.SetStateAction<any | null>>,
    openedPanelValue?: string | undefined
};

const renderAvatarCell = (params: GridRenderCellParams, type: string) => {
    return params.row[type]?.first_name ?
        <PermissionGate on='employee' properties={{ disabled: true }}>
            <EmployeeCard fontSize={12} employee={params.row[type]} />
        </PermissionGate> : ""
};

const CustomToolbar = ({ setPanelsButtonEl, date, setDate, openedPanelValue, ...rest }: ICustomToolbarProps) => {
    const { t } = useTranslation();
    const currentUser = useSelector(currentUserSelector);

    const [isFilterSelect, setIsFilterSelected] = useState<boolean>(false);
    
    const apiRef = useGridApiContext();

    useEffect(() => {
        return apiRef.current.subscribeEvent('stateChange', (
            ({ filter: { filterModel: { items } } }) => setIsFilterSelected(!isEmpty(items))
        ))
    }, [apiRef]);

    const exceljsPreProcess = ({ workbook, worksheet }: GridExceljsProcessInput): any => {
        workbook.creator = 'Profesto';
        workbook.created = new Date();
        worksheet.properties.defaultRowHeight = 30;

        worksheet.getCell('A1').value = t('reports.list.pay_change');
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
        try {
            worksheet.getColumn('prev_amount').alignment = {
                horizontal: 'right',
            };
        } catch { }
        try {
            worksheet.getColumn('current_amount').alignment = {
                horizontal: 'right',
            };
        } catch { }
    };

    const excelOptions = {
        exceljsPreProcess,
        exceljsPostProcess,
        fileName: `${format(new Date(), "yyyy-MM-dd'T'HH:mm")} Profesto - ${t('reports.list.pay_change')}`,
    };

    const ExcelExportVariantsMenuItem = (props: GridExportMenuItemProps<{}>) => {
        const apiRef = useGridApiContext();
        const { hideMenu } = props;

        const handleExport = (options: GridExcelExportOptions) => apiRef.current.exportDataAsExcel(options);

        return (
            <>
                <MenuItem onClick={() => { handleExport({ ...excelOptions, allColumns: false }); hideMenu?.(); }}>
                    Visible Columns
                </MenuItem>
                <MenuItem onClick={() => { handleExport({ ...excelOptions, allColumns: true }); hideMenu?.(); }}>
                    All Columns
                </MenuItem>
            </>
        );
    };

    const CustomExportButton = ({ ...other }) => (
        <GridToolbarExportContainer
            sx={{ "&:focus": { backgroundColor: "#DCEEE5", color: '#396 !important', circle: { fill: '#396' } } }} {...other}
        >
            <ExcelExportVariantsMenuItem />
        </GridToolbarExportContainer>
    );

    const buttonStyle = (value: string, type?: string) => {
        if (type === 'bg') {
            if (openedPanelValue === value) {
                return '#DCEEE5';
            }
            if (isFilterSelect && value !== 'columns') {
                return '#F2F2F4';
            }
            return 'transparent';
        } else {
            if (openedPanelValue === value) {
                return '#339966';
            }
        }
    };

    return (
        <GridToolbarContainer {...rest}>
            <DatePicker
                selected={date}
                onChange={setDate}
            />
            <GridToolbarQuickFilter
                sx={quickFilterStyle}
                placeholder='Search...'
                variant="outlined"
                size="small"
                debounceMs={500}
            />
            <div style={{ display: 'flex', marginLeft: 'auto', gap: 20 }}>
                <FilterButtonContainer $isFilterSelect={isFilterSelect || openedPanelValue === 'filters'}>
                    {isFilterSelect ? <StyledCloseIcon onClick={() => apiRef.current.upsertFilterItems([])} /> : null}
                    <GridToolbarFilterButton
                        ref={setPanelsButtonEl}
                        sx={{
                            paddingRight: isFilterSelect ? "30px !important" : '16px',
                            backgroundColor: buttonStyle('filters', 'bg'),
                            color: isFilterSelect || openedPanelValue === 'filters' ? "#339966 !important" : '#364852',
                        }}
                    />
                </FilterButtonContainer>
                <GridToolbarColumnsButton
                    sx={{
                        backgroundColor: buttonStyle('columns', 'bg'),
                        circle: { fill: buttonStyle('columns') },
                        color: openedPanelValue === 'columns' ? '#396 !important' : '#364852',
                    }}
                />
                <CustomExportButton />
            </div>
        </GridToolbarContainer >
    )
};

export default function PayChangeReport() {
    const { t } = useTranslation();
    const [openedPanelValue, setOpenedPanelValue] = useState<string | undefined>('');
    const [panelsButtonEl, setPanelsButtonEl] = useState<HTMLButtonElement | null>(null);
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
            field: 'status', headerName: t('employee.status'),
            type: 'singleSelect',
            valueOptions: [t('employee.statuses.hiring'), t('employee.statuses.active'), t('employee.statuses.terminated')],
            valueGetter: ({ value }) => value && t('employee.statuses.'+value),
            minWidth: 100, flex: 1
        },
        {
            field: 'hire_date',
            headerName: t('employee.job.hire_date'),
            type: 'date',
            valueGetter: ({ value }) => value && new Date(value),
            valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDate'),
            minWidth: 100, flex: 0.6
        },
        {
            field: 'termination_date',
            headerName: t('employee.job.termination_date'),
            type: 'date',
            valueGetter: ({ value }) => value && new Date(value),
            valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDate'),
            minWidth: 100, flex: 0.6
        },
        { field: 'job_title', headerName:  t('employee.job.job_title'), minWidth: 100, flex: 1 },
        { field: 'employment_status', headerName: t('employee.short_status'), minWidth: 100, flex: 1 },
        { field: 'work_type', headerName: t('employee.job.work_type'), minWidth: 100, flex: 1 },
        { field: 'department', headerName: t('employee.job.department'), minWidth: 100, flex: 1 },
        { field: 'division', headerName: t('employee.job.division'), minWidth: 100, flex: 1 },
        { field: 'location', headerName: t('employee.address.location'), minWidth: 100, flex: 1 },
        {
            field: 'pension_status', headerName: t('jobInfo.pension_status'),
            type: 'singleSelect',
            valueOptions: [t('jobInfo.not_involved'), t('jobInfo.mandatory'), t('jobInfo.voluntary')],
            valueGetter: ({ value }) => value && t(value),
            minWidth: 100, flex: 1
        },
        { field: 'bank_account', headerName: t('jobInfo.bank_account'), minWidth: 100, flex: 1 },

        { field: 'previous_rate', headerName: t('employee.job.previous_pay'), minWidth: 100, flex: 1 },
        { field: 'prev_currency', headerName: t('employee.job.previous_pay_currency'), minWidth: 100, flex: 1 },
        {
            field: 'prev_amount',
            headerName: t('employee.job.previous_pay_amount'),
            type: 'number',
            valueGetter: ({ value }) => Number(value).toFixed(2),
            minWidth: 100, flex: 1,
        },
        { field: 'prev_payment_period', headerName: t('employee.job.previous_pay_period'), minWidth: 100, flex: 1 },
        { field: 'prev_payment_type', headerName: t('employee.job.previous_pay_type'), minWidth: 100, flex: 1 },
        { field: 'prev_payment_schedule', headerName: t('employee.job.previous_pay_schedule'), minWidth: 100, flex: 1 },
        { field: 'prev_overtime', headerName: t('employee.job.previous_overtime'), minWidth: 100, flex: 1 },
        { field: 'current_rate', headerName: t('employee.job.current_pay'), minWidth: 100, flex: 1 },
        { field: 'current_currency', headerName: t('employee.job.current_pay_currency'), minWidth: 100, flex: 1 },
        {
            field: 'current_amount',
            headerName: t('employee.job.current_pay_amount'),
            type: 'number',
            valueGetter: ({ value }) => Number(value).toFixed(2),
            minWidth: 100, flex: 1,
        },
        { field: 'current_payment_period', headerName: t('employee.job.current_pay_period'), minWidth: 100, flex: 1 },
        { field: 'current_payment_type', headerName: t('employee.job.current_pay_type'), minWidth: 100, flex: 1 },
        { field: 'current_payment_schedule', headerName: t('employee.job.current_pay_schedule'), minWidth: 100, flex: 1 },
        {
            field: 'change_date',
            headerName: t('employee.job.date_of_change'),
            type: 'date',
            valueGetter: ({ value }) => value && new Date(value),
            valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDate'),
            minWidth: 100, flex: 0.6
        },
        { field: 'change_reason', headerName: t('employee.job.reason_of_change'), minWidth: 100, flex: 1 },
    ])
    const [date, setDate] = useState<any>(new Date());
   
    useEffect(() => {
        if (region(['eng'])) {
            const newColumns = changeColumns(['personal_number', 'pension_status', 'bank_account'], columns);

            setColumns(newColumns);
        }
    }, []);


    const { data: payChangeReportData = [], isLoading } = useQuery<any>(["pay_change_report", date], {
        endpoint: 'reports/pay_change',
        options: {
            body: { report_date: date },
            method: "post"
        },
    }, { enabled: true });

    const initialState: GridInitialState = {
        sorting: {
            sortModel: [
                { field: 'employee', sort: 'asc' },
            ],
        },
        filter: {
            filterModel: {
                items: [{ id: 1, columnField: 'status', operatorValue: 'isAnyOf', value: ['Hiring', 'Active'] }],
                linkOperator: GridLinkOperator.And,
                quickFilterLogicOperator: GridLinkOperator.And,
            },
        },
        columns: {
            columnVisibilityModel: {
                hire_date: false,
                termination_date: false,
                prev_currency: false,
                prev_amount: false,
                prev_payment_period: false,
                prev_payment_type: false,
                prev_payment_schedule: false,
                prev_overtime: false,
                current_currency: false,
                current_amount: false,
                current_payment_period: false,
                current_payment_type: false,
                current_payment_schedule: false,
                change_reason: false,
                pension_status: false,
                bank_account: false
            }
        }
    };

    const onGridStateChange = ({ filter: { filteredRowsLookup }, rows: { idRowsLookup } }: GridState) => {
        if (!isEmpty(filteredRowsLookup)) {
            const filteredRowsIds = Object.keys(filteredRowsLookup).filter(key => filteredRowsLookup[key]);
            let rows = Object.keys(idRowsLookup).map((key) => filteredRowsIds.includes(key) && idRowsLookup[key]).filter((row => row));
            let numberOfEmployees = uniqBy(rows, 'employee_id').length;
            setNumberOfEmployees(numberOfEmployees)
        } else {
            let numberOfEmployees = uniqBy(payChangeReportData, 'employee_id').length;
            setNumberOfEmployees(numberOfEmployees)
        }
    };

    return (
        <>
            <PageHeaderTitle title={t('reports.pay_change', {count: numberOfEmployees, empl: t('employee.employee')})} />
            <div style={{ display: 'flex', height: '85%', margin: '20px 50px', flexDirection: 'column' }}>
                <DataGrid
                    name="pay_change_report"
                    saveGridState
                    disableRowGrouping
                    onStateChange={onGridStateChange}
                    loading={isLoading}
                    rows={payChangeReportData}
                    columns={columns}
                    initialState={initialState}
                    onPreferencePanelClose={() => setOpenedPanelValue('')}
                    onPreferencePanelOpen={(e: GridPreferencePanelParams) => setOpenedPanelValue(e.openedPanelValue)}
                    components={{
                        Toolbar: CustomToolbar,
                        QuickFilterClearIcon: CloseIcon,
                        QuickFilterIcon: MagnifierIcon
                    }}
                    componentsProps={{
                        panel: {
                            anchorEl: panelsButtonEl,
                            placement: 'bottom'
                        },
                        toolbar: {
                            setPanelsButtonEl,
                            date,
                            setDate,
                            openedPanelValue
                        },
                    }}
                />
            </div>
        </>
    )
};

const StyledCloseIcon = styled(CloseIcon)`
    position: relative;
    z-index: 2;
    right: -130px;
    top: 1px;
    width: 8px;
    height: 8px;
    cursor: pointer;
    & path {
        fill: #868686;
    }
`;

const FilterButtonContainer = styled.div<{ $isFilterSelect: boolean }>`
    ${StyledCloseIcon}:hover + .MuiButtonBase-root{
        background-color: #DCEEE5;
    }
    & circle { 
        fill: ${({ $isFilterSelect }) => $isFilterSelect ? '#339966' : '#b5b5b5'}
    }
`;

const quickFilterStyle = {
    padding: 0,
    width: 440,
    marginLeft: 1,
    '& input': { padding: '10px 5px' },
    '.MuiButtonBase-root': {
        padding: '5px !important',
        '&:hover': {
            backgroundColor: 'transparent !important',
            'path': { fill: '#636363 !important' }
        },
    },
};
