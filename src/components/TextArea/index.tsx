import { Fragment, ReactElement } from 'react';
import styled from '@mui/system/styled';
import TextareaAutosize, { TextareaAutosizeProps } from '@mui/material/TextareaAutosize';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';

interface ITextArea extends TextareaAutosizeProps {
    label?: ReactElement | string,
    errorText?: ReactElement | string,
}

export default function MaxHeightTextarea({ required, label, errorText, ...props }: ITextArea) {
    return (
        <Fragment>
            {label ? <StyledInputLabel>{label}{required && <sup>*</sup>}</StyledInputLabel> : null}
            <StyledTextArea
                minRows={3}
                required={required}
                error={errorText}
                {...props}
            />
            {errorText ? <StyledHelperText>{errorText}</StyledHelperText> : null}
        </Fragment>
    );
};

const StyledTextArea = styled<any>(TextareaAutosize)`
    border: ${({ error }) => error ? '1px solid #C54343' : '1px solid #D6D6D6'};
    width: 100%;
    color: #000;
    font-size: 12px;
    border-radius: 4px;
    padding: 12px;
    font-family: 'Aspira Regular', 'FiraGO Regular';
    &:hover, &:focus {
        border-color: #99CC33;
        outline: none;
    }
    &::placeholder {
        color: #9C9C9C;
    }
`;

const StyledInputLabel = styled(InputLabel)`
    color: #000;
    margin-bottom: 5px;
    & > sup {
        color: #C54343;
    }
`;

const StyledHelperText = styled(FormHelperText)`
    font-size: 10px;
    color: #C54343;
    margin-top: 0px;
    line-height: initial;
`;