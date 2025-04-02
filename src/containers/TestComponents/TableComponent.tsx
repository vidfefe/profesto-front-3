import { GridColDef, GridInitialState, GridLinkOperator, GridRenderCellParams } from "@mui/x-data-grid-pro";
import DataGrid from "components/DataLists/DataGrid";
import EmployeeCard from "components/Employee/Card";
import useQuery from "hooks/useQueryCustom";

export default function DataGridTestComponent() {
    const { data: jobHistoryData = [], isLoading } = useQuery<any>(["job_history_report"], {
        endpoint: 'reports/job_history',
        options: { method: "post" },
    }, { enabled: true });

    const initialState: GridInitialState = {
        filter: {
            filterModel: {
                items: [{ id: 1, columnField: 'status', operatorValue: 'is', value: 'Active' }],
                linkOperator: GridLinkOperator.And,
                quickFilterLogicOperator: GridLinkOperator.And,
            },
        },
        sorting: {
            sortModel: [
                { field: 'employee', sort: 'asc' },
                { field: 'effective_date', sort: 'desc' },
            ],
        }
    };

    const renderAvatarCell = (params: GridRenderCellParams, type: string) => {
        return params.row[type].first_name ? <EmployeeCard employee={params.row[type]} /> : "-"
    };

    const columns: GridColDef[] = [
        {
            field: 'employee', headerName: 'Employee',
            renderCell: (params) => renderAvatarCell(params, 'employee'),
            valueGetter: ({ value }) => `${value.first_name} ${value.last_name}`,
            width: 250
        },
        { field: 'employee_id', headerName: 'Emp. #' },
        {
            field: 'status', headerName: 'Status',
            type: 'singleSelect',
            valueOptions: ['Active', 'Inactive']
        },
        { field: 'effective_date', headerName: 'Date', type: 'date' },
        { field: 'emp_status', headerName: 'Emp. Status' },
        { field: 'job_title', headerName: 'Job Title', width: 150 },
        { field: 'department', headerName: 'Department' },
        { field: 'division', headerName: 'Division', width: 200 },
        { field: 'location', headerName: 'Location', width: 200 },
        {
            field: 'manager', headerName: 'Manager',
            renderCell: (params) => renderAvatarCell(params, 'manager'),
            valueGetter: ({ value }) => `${value.first_name} ${value.last_name}`,
            width: 250
        },
        { field: 'reason', headerName: 'Reason' },
    ];

    return (
        <div style={{ display: 'flex', height: '75vh' }}>
            <DataGrid
                name='test_grid'
                loading={isLoading}
                rows={jobHistoryData}
                columns={columns}
                initialState={initialState}
            />
        </div>
    )
};
