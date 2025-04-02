import { PropsWithChildren } from 'react';
import styled from 'styled-components';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LoadingButton from '@mui/lab/LoadingButton';
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';

import { ReactComponent as CloseIcon } from 'assets/svg/close-icon.svg';

export interface IDialogProps extends DialogProps {
    nominalHeader?: JSX.Element,
    title?: string,
    withButtons?: boolean
    withoutHeader?: boolean
    actionLoading?: boolean,
    actionButtonText?: string,
    actionButtonDisabled?: boolean,
    cancelButtonText?: string,
    actionButton?: () => void,
    hideActionButton?: boolean,
    hideCancelButton?: boolean,
    actionButtonTooltipText?: string,
    upperPosition?: boolean,
    preDefinedPadding?: boolean,
    customFooter?: JSX.Element | null,
};

export default function DialogModal({
    children,
    nominalHeader,
    title,
    withButtons,
    withoutHeader,
    actionLoading,
    actionButtonText,
    actionButtonDisabled,
    cancelButtonText,
    actionButton,
    hideActionButton,
    hideCancelButton,
    actionButtonTooltipText = '',
    onClose,
    upperPosition,
    preDefinedPadding = true,
    customFooter = null,
    ...rest
}: PropsWithChildren<IDialogProps>) {
    const { t } = useTranslation();

    return (
        <div>
            <Dialog
                scroll="paper"
                onClose={onClose}
                sx={{
                    '& .MuiDialog-scrollPaper': { display: 'flex', alignItems: upperPosition ? 'flex-start' : 'center', paddingTop: upperPosition ? 10 : 0 },
                    '& .MuiDialog-paperScrollBody': { display: 'flex', alignItems: upperPosition ? 'flex-start' : 'center', paddingTop: upperPosition ? 10 : 0 },
                }}
                {...rest}
            >
                {withoutHeader ? null : <StyledDialogTitle>
                    <MainDialogTitle>
                        {title}<StyledCloseIcon onClick={(e: any) => onClose?.(e, 'escapeKeyDown')} />
                    </MainDialogTitle>
                    {nominalHeader}
                </StyledDialogTitle>}
                <DialogContent sx={{ padding: preDefinedPadding ? '16px 24px' : 0 }} dividers={true}>{children}</DialogContent>
                {customFooter}
                {withButtons ? <DialogActions>
                    {hideCancelButton ? null : <div style={{ minWidth: 117, marginRight: 4 }}>
                        <Button
                            tabIndex={1}
                            sx={{ '&:focus': { backgroundColor: '#EAF5EB' } }}
                            onClick={(e) => onClose?.(e, 'escapeKeyDown')}
                            fullWidth
                            size='large'
                            disabled={actionLoading}
                        >
                            {cancelButtonText || t('globaly.cancel')}
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
                                {actionButtonText || t('globaly.save')}
                            </LoadingButton>
                        </div></Tooltip>
                    </div>}
                </DialogActions> : null}
            </Dialog>
        </div>
    );
};

const StyledDialogTitle = styled(DialogTitle)`
    display: flex;
    flex-direction: column;
    padding: 0;
`;

const MainDialogTitle = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 40px;
    padding: 0 20px;
    background-color: #172B37;
    color: #FFF;
    font-size: 12px;
    font-weight: 400;
    & > svg {
        margin-left: auto;
    };
`;

const StyledCloseIcon = styled(CloseIcon)`
    cursor: pointer;
    path {
        fill: #FFF;
    }
`;
