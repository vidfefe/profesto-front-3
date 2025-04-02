import { useState } from "react";
import InputBase from "@mui/material/InputBase";
import styled from '@mui/system/styled';
import { isEmpty } from "lodash";
import DialogModal from "components/Modal/Dialog";
import { useToasts } from "react-toast-notifications";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

function DictionaryModal({ open, setOpen, name, inputText, onValueChange, createRequest, setInputText }: any) {
    const { t } = useTranslation();
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const { addToast } = useToasts();
    const [reqLoading, setReqLoading] = useState<boolean>(false);

    const onSubmit = (data: any) => {
        setReqLoading(true);
        createRequest(data.name).then((res: any) => {
            setReqLoading(false);
            setOpen(false);
            onValueChange(res.data)
            addToast(`${t('globaly.add_success', {title: name})}`, { appearance: 'success', autoDismiss: true });
        }).catch((err: any) => {
            setReqLoading(false);
            addToast(err.response.data.errors[0].message, { appearance: 'error', autoDismiss: true });
        })
    };

    return (
        <DialogModal
            open={open}
            onClose={() => { setOpen(false); reset(); }}
            title={`${t('dictionaries.add')} ${name}`}
            actionButton={handleSubmit(onSubmit)}
            actionLoading={reqLoading}
            withButtons
            cancelButtonText={t('globaly.cancel')}
            actionButtonText={t('globaly.save')}
            disableAutoFocus
            upperPosition
        >
            <ModalContentContainer>
                <InputTitle>{name}<sup>*</sup></InputTitle>
                <StyledInput
                    autoFocus
                    placeholder={t('dictionaries.placeholder', { title: name })}
                    value={inputText}
                    errors={errors}
                    {...register("name", { required: true, onChange: (e) => setInputText(e.target.value) })}
                />
                {errors.name &&
                    <span style={{ marginTop: 5, color: '#C54343', fontSize: 9, textTransform: 'capitalize' }}>{t('validations.is_required', { attribute: name })}</span>}
            </ModalContentContainer>
        </DialogModal>
    )

}
export default DictionaryModal;

const StyledInput = styled(InputBase)<{ errors: any }>(({ errors }) => ({
    width: 500,
    height: 40,
    padding: '0 8px',
    borderRadius: 4,
    border: !isEmpty(errors) ? '1px solid var(--red)' : '1px solid #D6D6D6',
    "&:hover": {
        borderColor: !isEmpty(errors) ? 'var(--red)' : '#99CC33'
    },
    "&.Mui-focused": {
        borderColor: !isEmpty(errors) ? 'var(--red)' : '#99CC33'
    }
}));

const ModalContentContainer = styled('div')`
    padding-block: 10px;
    display: flex;
    flex-direction: column;
`;

const InputTitle = styled('p')`
    margin-bottom: 8px;
    text-transform: capitalize;
    & > sup {
        color: #C54343;
    }
`;