import { PropsWithChildren } from 'react';
import styled from 'styled-components';
import Modal, { ModalProps } from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Tooltip from '@mui/material/Tooltip';

import { ReactComponent as CloseIcon } from 'assets/svg/close-icon.svg';

export interface IModalProps extends ModalProps {
    withButtons?: boolean,
    withoutHeader?: boolean,
    title?: string,
    cancelButtonText?: string,
    actionButtonText?: string,
    actionButton?: () => void,
    hideActionButton?: boolean,
    hideCancelButton?: boolean,
    actionButtonDisabled?: boolean,
    actionLoading?: boolean,
    actionButtonTooltipText?: string,
    upperPosition?: boolean,
};

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#FFF',
    boxShadow: 2,
    borderRadius: 1,
    outline: 'none',
    maxHeight: '99vh',
};

const modalStyle = {
    backgroundColor: 'rgba(0,0,0, 0.55)',
}

const headerContainer = {
    display: "flex",
    backgroundColor: '#172B37',
    height: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 2,
    borderRadius: 1,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    margin: -0.1
};

const buttons = {
    p: 2, display: 'flex',
    justifyContent: 'flex-end',
};

const StyledCloseIcon = styled(CloseIcon)`
    cursor: pointer;
    path {
        fill: #FFF;
    }
`;

const StyledHeaderText = styled.p`
    color: #FFF;
    text-align: left;
    font-size: 13px;
`;

export default function BasicModal({
    withButtons,
    withoutHeader,
    children,
    onClose,
    title,
    cancelButtonText = 'CANCEL',
    actionButtonText = 'SAVE',
    actionButton,
    hideActionButton = false,
    hideCancelButton = false,
    actionButtonDisabled = false,
    actionLoading,
    actionButtonTooltipText = '',
    upperPosition,
    ...rest
}: PropsWithChildren<IModalProps>) {
    return (
        <Modal
            {...rest}
            sx={modalStyle}
            onClose={onClose}
        >
            <Box component='div' sx={{ ...style, top: upperPosition ? '43%' : '50%' }}>
                {withoutHeader ? null : <Box component='div' sx={headerContainer}>
                    <StyledHeaderText>
                        {title}
                    </StyledHeaderText>
                    <StyledCloseIcon onClick={(e) => onClose?.(e, 'escapeKeyDown')} />
                </Box>}
                <Box component='div'>
                    {children}
                </Box>
                <Divider sx={{ ml: 2, mr: 2 }} />
                {withButtons ? <Box sx={buttons} component='div'>
                    {hideCancelButton ? null : <div style={{ minWidth: 117, marginRight: 4 }}>
                        <Button
                            tabIndex={1}
                            sx={{ '&:focus': { backgroundColor: '#EAF5EB' } }}
                            onClick={(e) => onClose?.(e, 'escapeKeyDown')}
                            fullWidth
                            size='large'
                            disabled={actionLoading}
                        >
                            {cancelButtonText}
                        </Button>
                    </div>}
                    {hideActionButton ? null : <div style={{ minWidth: 117 }}>
                        <Tooltip title={actionButtonTooltipText} placement="top" arrow><div>
                            <LoadingButton
                                tabIndex={0}
                                type="submit"
                                disabled={actionButtonDisabled}
                                onClick={() => actionButton?.()}
                                fullWidth
                                size='large'
                                variant='contained'
                                loading={actionLoading}
                            >
                                {actionButtonText}
                            </LoadingButton>
                        </div></Tooltip>
                    </div>}
                </Box> : null}
            </Box>
        </Modal>
    )
};
