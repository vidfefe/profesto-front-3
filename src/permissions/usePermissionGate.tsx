import { useMemo } from "react";
import { useSelector } from "react-redux";
import { currentUserSelector } from "redux/selectors";
import { getObject } from "utils/common";

type TUsePermissionGate = {
    permissionObj: { view: boolean, edit?: boolean } | undefined,
    permissions: any,
    role: string,
    isRegFinished: boolean,
    status: string
};

export const usePermissionGate = (on?: string): TUsePermissionGate => {
    const permissions = useSelector(currentUserSelector)?.permissions;
    const status = useSelector(currentUserSelector)?.status;
    const role = useSelector(currentUserSelector)?.permissions.role;
    const isRegFinished = useSelector(currentUserSelector)?.company.registration_finished;
    const permissionObj = useMemo(() => getObject(permissions, on), [on, permissions]);

    return {
        permissionObj,
        permissions,
        status,
        role,
        isRegFinished,
    };
};
