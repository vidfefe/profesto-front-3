import styled from "styled-components";
import DialogModal from "components/Modal/Dialog";
import { useTranslation } from "react-i18next";
import { ReactComponent as TrashCanCircles } from 'assets/svg/trash-can_circles.svg';
// #tmp
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

const DocumentDelete = (props: any) => {
    const { t } = useTranslation();
    return (
        <DialogModal
            open={props.isOpen}
            onClose={() => props.onModalClose()}
            title={t('employee.documents.delete_document')}
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
                    <p>{t('employee.documents.delete_this_document')}</p>
                </div>
            </Wrapper>
        </DialogModal >
    );
};

export default DocumentDelete;
