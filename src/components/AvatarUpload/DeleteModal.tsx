import Dialog from "components/Modal/Dialog";
import styled from "styled-components";

import { ReactComponent as TrashCanCircles } from 'assets/svg/trash-can_circles.svg';
import { useTranslation } from "react-i18next";

interface IDeleteModal {
    closeModal: () => void,
    isOpen: boolean,
    handleDelete: () => void,
    actionLoading: boolean,
};

export const DeleteAvatar = ({ closeModal, isOpen, handleDelete, actionLoading }: IDeleteModal) => {
    const { t } = useTranslation();
    return (
        <Dialog
            open={isOpen}
            onClose={() => closeModal()}
            title={t('components.avatarUpload.delete_photo')}
            withButtons
            cancelButtonText={t('globaly.cancel')}
            actionButtonText={t('components.avatarUpload.delete_photo').toUpperCase()}
            actionButton={() => handleDelete()}
            actionLoading={actionLoading}
            fullWidth
        >
            <DeleteModalContainer>
                <div>
                    <TrashCanCircles />
                    <p>{t('components.avatarUpload.ere_you_sure_you_want_delete')}</p>
                </div>
            </DeleteModalContainer>
        </Dialog>
    )
};

const DeleteModalContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    & > div {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        & > svg {
            margin-bottom: 27px;
        }
        & > p {
            color: #676767;
            font-size: 12px;
        }
    }
`;