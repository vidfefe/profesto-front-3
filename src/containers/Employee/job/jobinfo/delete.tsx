import styled from "styled-components";
import DialogModal from "components/Modal/Dialog";

import { ReactComponent as TrashCanCircles } from 'assets/svg/trash-can_circles.svg';
import { useTranslation } from "react-i18next";

const Wrapper = styled.div`
    .mode-body{
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 40px;

        p{
            color: #676767;
            margin: 25px 0;
        }
    }
`;

const JobInfoHistoryDelete = (props: any) => {
    const { t } = useTranslation();
    return (
        <DialogModal
            open={props.isOpen}
            onClose={() => props.onModalClose()}
            title={t('jobInfo.delete_job_information')}
            actionButton={() => props.onDelete()}
            withButtons
            cancelButtonText={t('globaly.cancel')}
            actionButtonText={t('globaly.delete')}
            disableAutoFocus
            actionLoading={props.loadingRequest}
            fullWidth
            upperPosition
        >
            <Wrapper>
                <div className='mode-body'>
                    <TrashCanCircles />
                    <p>{t('jobInfo.want_to_delete_information')}</p>
                </div>
            </Wrapper>
        </DialogModal >
    );
};

export default JobInfoHistoryDelete;
