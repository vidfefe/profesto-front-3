import styled from "styled-components";
import DialogModal from "components/Modal/Dialog";
import EmpEditHeader from "../editHeader";

import { ReactComponent as WarningMark } from 'assets/svg/warning-mark_circles.svg'
import { useTranslation } from "react-i18next";

const Wrapper = styled.div`
    .mode-body{
        display: flex;
        flex-direction: column;
        align-items: center;

        p{
            color: #676767;
            margin: 25px 0;
        }
    }
`;

const DeleteEmployee = (props: any) => {
    const { t } = useTranslation('translation', { keyPrefix: 'leftMenuCard' });
    return (
        <DialogModal
            open={props.isOpen}
            title={t('delete_employee')}
            onClose={() => props.onModalClose()}
            actionButton={() => props.onDelete()}
            withButtons
            cancelButtonText={t('keep_this_employee')}
            actionButtonText={t('delete_this_employee')}
            actionLoading={props.loadingRequest}
            nominalHeader={
                <EmpEditHeader
                    employeeName={`${props.person.first_name} ${props.person.last_name}`}
                    avatarUuid={props.person.uuid}
                    employeeId={props.person.id}
                    jobData={props.jobData}
                />
            }
            fullWidth
            upperPosition
        >
            <Wrapper>
                <div className='delete-mode'>
                    <div className='mode-body'>
                        <WarningMark />
                        <p>{t('delete_all_information')}</p>
                    </div>
                </div>

            </Wrapper>
        </DialogModal>
    );
};

export default DeleteEmployee;
