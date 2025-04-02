import { Fragment } from 'react';
import styled from 'styled-components';
import DialogModal from 'components/Modal/Dialog';
import Text from 'components/Text';

import { ReactComponent as WarningMark } from 'assets/svg/warning-mark_circles.svg';

interface IWarningDialogProps {
    title: string
    isOpen: boolean
    onClose: () => void
    onAction?: () => void
    cancelButtonText?: string
    actionButtonText?: string
    warningText: any,
    withButtons?: boolean,
    actionLoading?: boolean
};

const ImageWrapper = styled.div`
    padding-top: 20px;
    padding-bottom: 26px;
    display: flex; 
    justify-content: center;
`

const WarningWrapper = styled.div`
    padding-bottom: 30px;
    display: flex;
    justify-content: center; 
    padding-inline: 10%;
    text-align: center; 
`

export const WarningDialog = ({
    title,
    isOpen,
    onClose,
    onAction,
    cancelButtonText,
    actionButtonText,
    warningText,
    withButtons = true,
    ...rest
}: IWarningDialogProps) => {
    return (
        <DialogModal
            open={isOpen}
            title={title}
            onClose={onClose}
            actionButton={onAction}
            withButtons={withButtons}
            cancelButtonText={cancelButtonText}
            actionButtonText={actionButtonText}
            upperPosition
            fullWidth
            {...rest}
        >
            <Fragment>
                <ImageWrapper>
                    <WarningMark />
                </ImageWrapper>
                <WarningWrapper>
                    <Text type="medium">
                        {warningText}
                    </Text>
                </WarningWrapper>
            </Fragment>
        </DialogModal>
    )
};