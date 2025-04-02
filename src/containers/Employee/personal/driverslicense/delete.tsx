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

const DriverInformationDelete = (props: any) => {
    const { t } = useTranslation();
    return (
        <DialogModal
            open={props.isOpen}
            onClose={() => props.onModalClose()}
            title={t('myInfo.driver.delete_drivers_license')}
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
                    <p>{t('myInfo.driver.alert_delete_license')}</p>
                </div>
            </Wrapper>
        </DialogModal>
    );
};

export default DriverInformationDelete;
