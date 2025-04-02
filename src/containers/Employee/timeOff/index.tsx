import { Fragment, useEffect, useState } from "react";
import styled from "styled-components";
import RequestTimeOffModal from "./RequestTimeOffModal";
import TimeOffRequestsList from "./TimeOffRequestsList";
import UsedHoursBox from "./UsedHoursBox";
import { useTranslation } from "react-i18next";
import { isEmpty } from "lodash";
import EditBalanceModal from "./EditBalanceModal";
import useQueryCustom from "hooks/useQueryCustom";
import { Manager } from "types";
type TTypeObject = {
    id: number,
    name: string,
    id_name?: string
} | null;

interface IActiveJobDetails {
    department: TTypeObject,
    division: TTypeObject,
    effective_date: string | Date | null,
    effective_time: string | Date | null,
    employment_status: TTypeObject,
    hiring_date: string | Date | null,
    id: number,
    job_title: TTypeObject,
    location: TTypeObject,
    manager?: Manager,
};

interface IEmployeeContactInfo {
    facebook: string | null,
    home_phone: string | null,
    id: number,
    linkedin: string | null,
    mobile_phone: string | null,
    personal_email: string | null,
    twitter: string | null,
    work_email: string | null,
    work_phone: string | null,
    work_phone_ext: string | null,
};

interface IEmployeeEmploymentDetails {
    contact_end_date: string | Date | null,
    experience: string | null,
    hire_date: string | Date | null,
    id: number,
    probation_end_date: string | Date | null,
};

type TSubordinates = {
    employee_photo: string | null,
    first_name: string | null,
    id: number,
    last_name: string | null,
    middle_name: string | null,
    preferred_name: string | null,
    uuid: string | null,
};

export interface IEmployeeMainInfo {
    active_job_detail: IActiveJobDetails,
    employee_contact_info: IEmployeeContactInfo,
    employee_employment_detail: IEmployeeEmploymentDetails,
    first_name: string | null,
    future_operation: string | null,
    id: number,
    last_name: string | null,
    middle_name: string | null,
    other_last_name: string | null,
    preferred_name: string | null,
    role: Required<TTypeObject>,
    status: string,
    subordinates: TSubordinates[]
    uuid: string,
    onCloseModal?: any
};

interface ITimeOff {
    disabled: boolean,
    employeeInfo: IEmployeeMainInfo
};

export default function TimeOff({ disabled, employeeInfo }: ITimeOff) {
    const { t } = useTranslation();
    const [timeOffRequestModal, setTimeOffRequestModal] = useState<boolean>(false);
    const [timeOffType, setTimeOffType] = useState<any>(null);
    const [types, setTypes] = useState<any>(null);

    useEffect(() => {
        refetch();
    }, []);

    const { data: userHours, refetch } = useQueryCustom<any>(["show_time_hours", employeeInfo?.id], {
        endpoint: `time_off/used_time_off?employee_id=${employeeInfo?.id}`,
        options: { method: "get" },
    }, { enabled: false });



    useEffect(() => {
        if (!isEmpty(timeOffType)) {
            setTimeOffRequestModal(true)
        }
    }, [timeOffType]);

    return (
        <Fragment>
            <UsedHoursBox 
                employeeId={employeeInfo.id} 
                requestTimeOff={(type: any) => setTimeOffType(type)} 
                openTimeOffModal={setTimeOffRequestModal}
                openEditBalanceModal={(type: any) => setTypes(type)}
                userHours={userHours}
            ></UsedHoursBox>

            <Section>
                <SectionHeader>{t('timeOff.time_off_requests')}</SectionHeader>
                <TimeOffRequestsList
                    employeeInfo={employeeInfo}
                    onRefresh={() => refetch()}
                />
            </Section>

            <RequestTimeOffModal
                open={timeOffRequestModal}
                timeOffType={timeOffType}
                onRefresh={() => refetch()}
                onClose={() => {
                    setTimeOffRequestModal(false);
                    setTimeOffType(null);
                    setTypes(null);
                }}
                employeeInfo={employeeInfo}
            />
            <EditBalanceModal
                open={types ? true : false}
                types={types}
                onRefresh={() => refetch()}
                onClose={() => setTypes(null)}
                employeeInfo={employeeInfo}
            />
        </Fragment>
    )
};

const Section = styled.div`
    border: 1px solid #EEEEEE;
    border-radius: 5px;
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #C3E1D2;
    border-radius: 4px 4px 0 0;
    padding: 9px 15px;
    font-size: 11px;
`;