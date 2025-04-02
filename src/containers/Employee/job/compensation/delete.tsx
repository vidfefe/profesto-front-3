import styled from "styled-components";
import DialogModal from "components/Modal/Dialog";
import { useTranslation } from "react-i18next";
import { ReactComponent as TrashCanCircles } from 'assets/svg/trash-can_circles.svg';

const Wrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    & > div {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        margin-top: 40px;
        & > p {
            color: #676767;
            font-size: 12px;
            margin: 25px 0;
        }
    }
`;

const EmploymentHistoryDelete = ({ onModalClose, isOpen, onDelete, loadingRequest }: any) => {
    const { t } = useTranslation();
    return (
        <DialogModal
            withButtons
            open={isOpen}
            onClose={onModalClose}
            title={t('myInfo.compensation.delete_row')}
            cancelButtonText={t('globaly.cancel')}
            actionButtonText={t('globaly.delete')}
            actionButton={onDelete}
            actionLoading={loadingRequest}
            fullWidth
            upperPosition
        >
            <Wrapper>
                <div>
                    <TrashCanCircles />
                    <p>{t('myInfo.compensation.delete_row_text')}</p>
                </div>
            </Wrapper>
        </DialogModal >
    );
};

export default EmploymentHistoryDelete;
