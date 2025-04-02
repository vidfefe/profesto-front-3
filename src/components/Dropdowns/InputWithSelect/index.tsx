import { Fragment, useEffect, useState } from 'react';
import InputBase, { InputBaseProps } from "@mui/material/InputBase";
import InputLabel from '@mui/material/InputLabel';
import styled from '@mui/system/styled';
import FormHelperText from '@mui/material/FormHelperText';
import { AutocompleteProps } from "@mui/material/Autocomplete";
import { AxiosResponse } from "axios";
import EndAdornment from "./EndAdornment";

interface IInputSelectProps<
    T,
    Multiple extends boolean | undefined,
    DisableClearable extends boolean | undefined,
    FreeSolo extends boolean | undefined
> extends Partial<AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>> {
    inputPlaceholder?: string,
    endAdornmentPlaceholder?: string,
    endAdornmentLabel?: 'code' | 'name' | 'symbol' | string,
    loadRemoteData?: () => Promise<AxiosResponse<any>>,
    withPic?: boolean,
    errorText?: string | any,
};

interface IInputWithSelectProps<
    T,
    Multiple extends boolean | undefined,
    DisableClearable extends boolean | undefined,
    FreeSolo extends boolean | undefined
> {
    required?: boolean,
    label?: string,
    errorText?: string | any,
    size?: "small" | "medium" | undefined,
    selectProps?: IInputSelectProps<T, Multiple, DisableClearable, FreeSolo>
    inputProps?: InputBaseProps,
    onChange: (props: { inputValue: string, selectValue: any }) => void,
    value: { inputValue: string | null, selectValue: any } | null,
    validateToDecimal?: boolean
};

function InputWithSelect<
    T,
    Multiple extends boolean | undefined,
    DisableClearable extends boolean | undefined,
    FreeSolo extends boolean | undefined
>({
    selectProps,
    inputProps,
    onChange,
    value = { inputValue: '', selectValue: null },
    required,
    label,
    errorText,
    size = 'small',
    validateToDecimal = false,
}: IInputWithSelectProps<T, Multiple, DisableClearable, FreeSolo>) {
    const [inputValue, setInputValue] = useState(value?.inputValue ?? '');
    const [selectValue, setSelectValue] = useState(value?.selectValue ?? null);

    useEffect(() => {
        if (value?.inputValue || value?.selectValue) {
            setInputValue(value?.inputValue ?? '');
            setSelectValue(value?.selectValue ?? null);
        }
    }, [value]);

    const validateInputValueNumber = (str: string) => {
        let t = str.replace(/[^0-9.]/g, '');
        return str = (t.indexOf(".") >= 0) ? (t.substr(0, t.indexOf(".")) + t.substr(t.indexOf("."), 3)) : t;
    };

    const onChangeSelect = (_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
        setSelectValue(newValue);
        onChange({ inputValue: inputValue, selectValue: newValue });
    };

    const onChangeInput = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const letValidate = validateToDecimal ? validateInputValueNumber(event.target.value) : event.target.value;
        setInputValue(letValidate);
        onChange({ inputValue: letValidate, selectValue: selectValue });
    };

    return (
        <Fragment>
            {label ? <StyledInputLabel>{label}{required && <sup>*</sup>}</StyledInputLabel> : null}
            <StyledInput
                fullWidth
                endAdornment={<EndAdornment {...selectProps} onChange={onChangeSelect} value={value?.selectValue || null} />}
                {...inputProps}
                value={value?.inputValue ?? ""}
                onChange={onChangeInput}
                size={size}
                $errorText={errorText}
            />
            {errorText ? <StyledHelperText>{errorText}</StyledHelperText> : null}
        </Fragment>
    )
};

export default InputWithSelect;

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
    margin-top: 5px;
    line-height: initial;
`;

const StyledInput = styled(InputBase)<{ size: string, $errorText: string }>(({ size, $errorText }) => ({
    height: size === 'small' ? 40 : 50,
    padding: '0px 13px',
    borderRadius: 4,
    border: $errorText ? '1px solid var(--red)' : '1px solid #D6D6D6',
    "&:hover": {
        borderColor: $errorText ? 'var(--red)' : '#99CC33'
    },
    "&.Mui-focused": {
        borderColor: $errorText ? 'var(--red)' : '#99CC33'
    },
    "& input": {
        padding: 0
    }
}));