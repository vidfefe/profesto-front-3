import { forwardRef } from "react";
import styled from "styled-components";
import InputBase, { InputBaseProps } from "@mui/material/InputBase";
import InputAdornment from '@mui/material/InputAdornment'
import { useTranslation } from "react-i18next";
import { ReactComponent as EyeIcon } from 'assets/svg/eye.svg';
import { ReactComponent as EyeCrossedIcon } from 'assets/svg/eye-negative.svg';

interface IUniversalInputProps extends InputBaseProps {
    visiblePlaceholder?: boolean,
    withEyeAdornment?: boolean,
    onEyeAdornmentClick?: () => void,
    errorText?: string | any,
    label?: string, 
    customChange?: any
};

const UniversalInput = forwardRef<HTMLInputElement, IUniversalInputProps>(({
    visiblePlaceholder = false,
    withEyeAdornment = false,
    placeholder,
    type,
    errorText,
    value,
    onEyeAdornmentClick,
    label,
    required,
    customChange,
    ...rest
}, ref) => {
    const { t } = useTranslation();
    return (
        <div>
            {label ? <StyledInputLabel>{label}{required && <sup>*</sup>}</StyledInputLabel> : null}
            <StyledInput
                placeholder={placeholder}
                value={value}
                fullWidth
                size='small'
                type={type}
                inputProps={{onChange: (e: any) => customChange ? customChange(e.target.value) : null}}
                endAdornment={
                    (visiblePlaceholder || withEyeAdornment) ? <InputAdornment position="end">
                        {visiblePlaceholder ? <VisiblePlaceholderText withMargin={withEyeAdornment}>
                            {placeholder}
                        </VisiblePlaceholderText> : null}
                        {withEyeAdornment ? <EyeAdornmentContainer onClick={onEyeAdornmentClick}>
                            {type === 'password' ? <EyeIcon /> : <EyeCrossedIcon />}
                        </EyeAdornmentContainer> : null}
                    </InputAdornment> : null
                }
                error={!!errorText}
                ref={ref}
                {...rest}
            />
            {errorText ? <StyledHelperText>{errorText}</StyledHelperText> : null}
        </div>
    )
});

export default UniversalInput;

const StyledInput = styled(InputBase)<{ error?: any }>(({ error }) => ({
    padding: '0 13px',
    borderRadius: 4,
    border: error ? '1px solid var(--red)' : '1px solid #D6D6D6',
    backgroundColor: '#FFF',
    "&:hover": {
        borderColor: error ? 'var(--red)' : '#99CC33'
    },
    "&.Mui-focused": {
        borderColor: error ? 'var(--red)' : '#99CC33'
    },
    "& input": {
        padding: 0,
    }
}));

const VisiblePlaceholderText = styled('p') <{ withMargin?: boolean }>`
    color: #9C9C9C;
    margin-right: ${({ withMargin }) => withMargin ? '10px' : 0};
`;

const EyeAdornmentContainer = styled('div')`
    display: flex;
    align-items: center;
    cursor: pointer;
`;

const StyledHelperText = styled('p')`
    font-size: 10px;
    color: #C54343;
    margin-top: 5px;
`;

const StyledInputLabel = styled.p`
    color: #000;
    margin-bottom: 5px;
    & > sup {
        color: #C54343;
    }
`;
