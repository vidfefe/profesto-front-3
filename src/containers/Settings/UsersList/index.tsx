import React, { useEffect, useState } from 'react';
import { changeUserRole, deactivateUser, getUserList } from "services";
import { GridInitialState } from "@mui/x-data-grid-pro";
import {
    GridActionsCellItem,
    GridColumns,
    GridRenderCellParams, GridState
} from "@mui/x-data-grid-premium";
import { useToasts } from "react-toast-notifications";
import Tooltip from '@mui/material/Tooltip';
import { isEmpty } from "lodash";
import Text from 'components/Text';
import DataGrid from "components/DataLists/DataGrid";
import EmployeeCard from "components/Employee/Card";
import { WarningDialog } from "components/DesignUIComponents";
import { currentUserSelector } from "redux/selectors";
import InviteModal from "./InviteModal";
import styled from "styled-components";

import { ReactComponent as InviteIcon } from 'assets/svg/invite.svg';
import { ReactComponent as ResendIcon } from 'assets/svg/resend.svg';
import { ReactComponent as RoleChangeIcon } from 'assets/svg/role_change.svg';
import { ReactComponent as DisableIcon } from 'assets/svg/disable.svg';
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { dateFormat } from 'lib/DateFormat';

const StyledIcon = styled.svg`
    width: 22px;
    height: 22px;
    &:hover {
        & * circle {
            fill: #396
        }
        #Invite_head {
            fill: #FFF;
        }
        path {
            fill: #FFF;
        }
    }
`;

const DisabledStyledIcon = styled(StyledIcon)`
    &:hover {
        path {
            fill: #FFF;
            stroke: #FFF;
        }
    }
`;

export const UsersList = () => {
    const { t } = useTranslation();
    const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
    const [userList, setUserList] = useState<any>();
    const [employeeId, setEmployeeId] = useState<number>(0);
    const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
    const { addToast } = useToasts();
    const [disableAccessOpen, setDisableAccessOpen] = useState<boolean>(false);
    const [formErrors, setFormErrors] = useState<any>([]);
    const [numberOfRecords, setNumberOfRecords] = useState<number>(0);
    const [reInvite, setReInvite] = useState<boolean>(false);
    const [roleChange, setRoleChange] = useState<boolean>(false);
    const currentUser = useSelector(currentUserSelector)

    useEffect(() => {
        refreshData()
    }, [])

    useEffect(() => {
        setFormErrors([])
    }, [editModalOpen])

    const refreshData = () => {
        getUserList().then(res => setUserList(res.data))
    }

    const initialState: GridInitialState = {
        sorting: {
            sortModel: [
                { field: 'employee', sort: 'asc' }
            ],
        },
        columns: {
            columnVisibilityModel: {}
        }
    };

    const clickNoAccess = (employee_id: number) => {
        setEmployeeId(employee_id)
        setDisableAccessOpen(true)
    }

    const clickRoleChange = (employee_id: number) => {
        setEmployeeId(employee_id)
        setRoleChange(true)
        setReInvite(false)
        setEditModalOpen(true)
    }

    const clickInvite = (employee_id: number) => {
        setEmployeeId(employee_id)
        setReInvite(false)
        setRoleChange(false)
        setEditModalOpen(true)
    }

    const clickReInvite = (employee_id: number) => {
        setEmployeeId(employee_id)
        setReInvite(true)
        setRoleChange(false)
        setEditModalOpen(true)
    }

    const handleNoAccess = () => {
        setLoadingRequest(true);
        deactivateUser(employeeId).then(res => {
            setLoadingRequest(false);
            if (res.status === 200) {
                addToast(<div>{t('leftMenuCard.inviteModal.system_updated_successfully')}</div>, {
                    appearance: 'success',
                    autoDismiss: true
                });
                refreshData()
                setDisableAccessOpen(false)
            }
        }).catch(err => {
            setLoadingRequest(false);
            addToast(<div>{err.response.data.errors[0].message}</div>, {
                appearance: 'error',
                autoDismiss: true
            });
        })
    }

    const handleInvite = (data: any) => {
        setLoadingRequest(true);
        changeUserRole(data, employeeId, roleChange).then(res => {
            setLoadingRequest(false);
            if (res.status === 200) {
                addToast(<div>{t('leftMenuCard.inviteModal.system_updated_successfully')}</div>, {
                    appearance: 'success',
                    autoDismiss: true
                });
                refreshData()
                setEditModalOpen(false)
            }
        }).catch(err => { setLoadingRequest(false); setFormErrors(err.response.data.errors) });
    }

    const onGridStateChange = ({ filter: { filteredRowsLookup }, rows: { idRowsLookup } }: GridState) => {
        if (!isEmpty(filteredRowsLookup)) {
            const filteredRowsIds = Object.keys(filteredRowsLookup).filter(key => filteredRowsLookup[key]);
            let rows = Object.keys(idRowsLookup).map((key) => filteredRowsIds.includes(key) && idRowsLookup[key]).filter((row => row));
            setNumberOfRecords(rows.length)
        } else {
            setNumberOfRecords(userList.length)
        }
    };

    const renderAvatarCell = (params: GridRenderCellParams, type: string) => {
        return <>
            <EmployeeCard fontSize={12} employee={params.row[type]} />
            {params.row.role_id_name !== 'owner' && params.row.id !== currentUser.employee.id && <div style={{ display: 'flex', marginLeft: 10 }}>
                {(!params.row.status || params.row.status?.id === 'inactive') &&
                    <GridActionsCellItem
                        className="actionButton"
                        icon={
                            <Tooltip title={t('leftMenuCard.inviteModal.invite_user')} disableInteractive arrow>
                                <StyledIcon as={InviteIcon} />
                            </Tooltip>
                        }
                        label={t('leftMenuCard.inviteModal.invite')}
                        onClick={() => { clickInvite(params.row.id) }}
                        sx={{ padding: '3.5px', '&:hover': { backgroundColor: 'transparent' } }}
                    />
                }
                {params.row.status?.id === 'invited' &&
                    <GridActionsCellItem
                        className="actionButton"
                        icon={
                            <Tooltip title={t('leftMenuCard.inviteModal.resend_invitation')} disableInteractive arrow>
                                <StyledIcon as={ResendIcon} />
                            </Tooltip>
                        }
                        label={t('leftMenuCard.inviteModal.resend')}
                        onClick={() => clickReInvite(params.row.id)}
                        sx={{ padding: '3.5px', '&:hover': { backgroundColor: 'transparent' } }}
                    />
                }
                {(params.row.status?.id === 'invited' || params.row.status?.id === 'active') &&
                    <GridActionsCellItem
                        className="actionButton"
                        icon={
                            <Tooltip title={t('leftMenuCard.inviteModal.role_change')} disableInteractive arrow>
                                <StyledIcon as={RoleChangeIcon} />
                            </Tooltip>
                        }
                        label={t('leftMenuCard.inviteModal.role_change')}
                        onClick={() => clickRoleChange(params.row.id)}
                        sx={{ padding: '3.5px', '&:hover': { backgroundColor: 'transparent' } }}
                    />
                }
                {(params.row.status?.id === 'invited' || params.row.status?.id === 'active') &&
                    <GridActionsCellItem
                        className="actionButton"
                        icon={
                            <Tooltip title={t('leftMenuCard.inviteModal.disable_access')} disableInteractive arrow>
                                <DisabledStyledIcon as={DisableIcon} />
                            </Tooltip>
                        }
                        label={t('leftMenuCard.inviteModal.disable')}
                        onClick={() => clickNoAccess(params.row.id)}
                        sx={{ padding: '3.5px', '&:hover': { backgroundColor: 'transparent' } }}
                    />
                }
            </div>}
        </>
    };

    const columns = React.useMemo<GridColumns<any>>(() => [
        {
            field: 'employee', headerName: t('leftMenuCard.inviteModal.gridColumns.employee'),
            renderCell: (params) => renderAvatarCell(params, 'employee'),
            valueGetter: ({ value }) => `${value.first_name} ${value.last_name}`,
            flex: 1.5
        },
        {
            field: 'status',
            headerName: t('leftMenuCard.inviteModal.gridColumns.user_status'),
            valueGetter: ({ value }) => value?.name,
            flex: 1
        },
        { 
            field: 'role_name',
            headerName: t('leftMenuCard.inviteModal.gridColumns.user_role'),
            valueGetter: ({ row }) => row.role_id_name ? t(`enums.roles.${row.role_id_name}`) : '',
            flex: 1 
        },
        {
            field: 'last_login_date',
            headerName: t('leftMenuCard.inviteModal.gridColumns.last_login'),
            type: 'date',
            valueGetter: ({ value }) => value && new Date(value),
            valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDate'),
            flex: 1
        },
        {
            field: 'join_date',
            headerName: t('leftMenuCard.inviteModal.gridColumns.date_of_joining'),
            type: 'date',
            valueGetter: ({ value }) => value && new Date(value),
            valueFormatter: ({ value }) => value && dateFormat(new Date(value), 'shortDate'),
            flex: 1
        }
    ], []);

    return (
        <>
            <div style={{ display: 'flex', alignContent: 'center' }}>
                <div style={{ width: 3, height: 25, backgroundColor: '#339966', float: 'left', marginRight: 15, }} />
                <Text type="title">{t('leftMenuCard.inviteModal.employees')} <span style={{ opacity: 0.6 }}>&nbsp;({numberOfRecords})</span></Text>
            </div>

            <div style={{ marginTop: 20, flex: 1, backgroundColor: '#fff', padding: '18px 15px', borderRadius: 6 }}>
                <div style={{ display: 'flex', height: '100%' }}>
                    {userList &&
                        <DataGrid
                            name='user_list'
                            saveGridState
                            onStateChange={onGridStateChange}
                            rows={userList}
                            columns={columns}
                            initialState={initialState}
                        />}
                </div>
            </div>

            {disableAccessOpen && <WarningDialog
                title={t('leftMenuCard.inviteModal.disable_access')}
                isOpen={disableAccessOpen}
                onClose={() => setDisableAccessOpen(false)}
                onAction={handleNoAccess}
                cancelButtonText={t('leftMenuCard.inviteModal.keep_current')}
                actionButtonText={t('leftMenuCard.inviteModal.yes_dis_access')}
                warningText={t('leftMenuCard.inviteModal.disable_access_for_employee')}
                actionLoading={loadingRequest}
            />}

            {editModalOpen && <InviteModal
                isOpen={editModalOpen}
                onModalClose={() => setEditModalOpen(false)}
                employeeId={employeeId}
                formErrors={formErrors}
                onSubmit={handleInvite}
                reInvite={reInvite}
                roleChange={roleChange}
                loadingRequest={loadingRequest}
            />}
        </>
    )
}
