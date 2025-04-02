import { useEffect, useState } from "react";
import DialogModal from "components/Modal/Dialog";
import EmployeeCard from "components/Employee/Card";
import { getEmployeeSubordinates } from "services";
import PermissionGate from "permissions/PermissionGate";
import { useTranslation } from "react-i18next";

const EmployeeDirectReportList = ({ id, isOpen, setOpen, person }: any) => {
    const [directReports, setDirectReports] = useState([]);
    const { t } = useTranslation();

    useEffect(() => {
        isOpen && getEmployeeSubordinates(100, 1, id).then(res => {
            setDirectReports(res.data.list);
        });
    }, [isOpen]);

    return (
        <DialogModal
            open={isOpen}
            title={`${directReports.length} ${t('employee.job.direct_reports')}`}
            onClose={() => { setOpen(false) }}
            fullWidth
            upperPosition
        >
            <div style={{ height: 500 }}>
                {directReports.map((item: any, index: number) => {
                    return <div key={index} style={{ marginBottom: 10 }}>
                        <PermissionGate on="employee" shouldVisible properties={{ disabled: id !== person.id }}>
                            <EmployeeCard key={item.id} employee={item} bottomBorder={true} imageSize={58}
                                fullJobInfo={true}
                                imageFontSize={16} fontSize={14} />
                        </PermissionGate>
                    </div>
                })}
            </div>
        </DialogModal>
    );
};

export default EmployeeDirectReportList;
