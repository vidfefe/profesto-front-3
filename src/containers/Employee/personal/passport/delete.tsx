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
            margin: 20px 0;
        } 
    }
`;

const PassportInformationDelete = (props: any) => {
    const { t } = useTranslation();

    const renderAlert = () => {
        return t('myInfo.passport.alert_delete', {documentType: t('myInfo.passport.identification_document')});
    }

    const renderModalTitle = () => {
        return t('myInfo.passport.remove_identification_document');
    }

    return (
        <DialogModal
            open={props.isOpen}
            onClose={() => props.onModalClose()}
            title={renderModalTitle()}
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
                    <p>{renderAlert()}</p>
                </div>
            </Wrapper>
        </DialogModal>
    );
};

export default PassportInformationDelete;
