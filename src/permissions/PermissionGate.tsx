import { PropsWithChildren, cloneElement, ReactElement, useMemo } from "react";
import { useSelector } from "react-redux";
import { currentUserSelector } from "redux/selectors";
import { getObject } from 'utils/common';

interface IPermissionGate {
    on: string,
    shouldVisible?: boolean,
    action?: 'view' | 'edit' | 'sync',
    fallback?: JSX.Element | string,
    properties?: Object,
};

/**
 * @param on permission identifier
 * @param shouldVisible set explicit visibility for children
 * @param action permission type
 * @param fallback render custom `JSX` if no permission
 * @param properties custom props for children component
 * @returns `JSX` Element
 */
function PermissionGate({ action = 'view', on, shouldVisible, fallback, properties, children }: PropsWithChildren<IPermissionGate>) {
    const permissions = useSelector(currentUserSelector).permissions;
    const permissionValue = useMemo(() => getObject(permissions, on)?.[action], [action, on, permissions]);

    if (permissionValue || permissions.role === 'owner') {
        return <>{children}</>;
    };
    if (!permissionValue && shouldVisible) {
        if (properties) return cloneElement(children as ReactElement, { ...properties });
        return <>{children}</>;
    }
    if (!permissionValue && properties) {
        return cloneElement(children as ReactElement, { ...properties });
    };
    if (!permissionValue && fallback) {
        return <>{fallback}</>;
    };
    return <></>;
};

export default PermissionGate;