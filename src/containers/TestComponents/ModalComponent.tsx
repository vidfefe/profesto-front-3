import React from 'react';
import Modal from "components/Modal";
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export const ModalComponent = () => {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    return (
        <div>
            <Button variant='contained' onClick={handleOpen}>Open modal</Button>
            <Modal
                open={open}
                onClose={handleClose}
                title={'This is header'}
                withButtons
                cancelButtonText='CANCEL'
                actionButtonText='SAVE'
            >
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Text in a modal
                </Typography>
            </Modal>
        </div>
    )
};