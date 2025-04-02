import styled from "styled-components";
import DialogModal from "components/Modal/Dialog";
import { useTranslation } from "react-i18next";
import { ReactComponent as TrashCanCircles } from 'assets/svg/trash-can_circles.svg';

const Wrapper = styled.div`
    .mode-body{
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 40px;

        p{
            color: #676767;
            margin: 20px 0;
        } 
    }
`;

const EmergencyContactDelete = (props: any) => {
    const { t } = useTranslation();
    return (
        <DialogModal
            open={props.isOpen}
            onClose={() => props.onModalClose()}
            title={t('emergency.delete_emergency_contact')}
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
                    <p>{t('emergency.you_sure_delete')}</p>
                </div>
            </Wrapper>
        </DialogModal>
    );
};

export default EmergencyContactDelete;
