import { PropsWithChildren } from 'react';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectProps } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import styled from '@mui/system/styled';
import { default as styledComp } from 'styled-components';
import { ReactComponent as ArrowIcon } from 'assets/svg/arrow.svg';
import { ReactComponent as CloseIcon } from 'assets/svg/close-x.svg';
import { useTranslation } from "react-i18next";
type TOption = {
    id: string | number,
    name: string | undefined
};

interface IEnumDropdown extends SelectProps {
    options: TOption[],
    errorText?: string,
    placeholder?: string,
    $showClearIcon?: boolean,
};

const StyledSelect: typeof Select = styled(Select) <{ error: boolean }>`
    & .MuiOutlinedInput-notchedOutline {
        border-color: #D6D6D6;
    }
    &:hover .MuiOutlinedInput-notchedOutline {
        border-color: ${({ error }) => error ? 'var(--red)' : '#99CC33'};
    }
    &.Mui-focused .MuiOutlinedInput-notchedOutline {
        border: ${({ error }) => error ? '1px solid var(--red)' : '1px solid #99CC33'};
    }
`;

const StyledMenuItem: typeof MenuItem = styled(MenuItem)`
    color: #00101A;
    font-size: 12px;
    background-color: #FFF;
    height: 40px;
    &:hover, &:focus {
        color: #339966;
        background-color: #DCEEE5;
    }
`;

const MenuProps = {
    PaperProps: {
        style: {
            boxShadow: '0px 3px 6px #00000029',
            border: '1px solid #D6D6D6',
            borderRadius: 4,
            marginTop: 2,
            maxHeight: '35%',
        },
    },
    MenuListProps: {
        style: {
            padding: 0,
            backgroundColor: '#FFF',
        }
    },
};

const StyledHelperText = styled(FormHelperText)`
    color: var(--red);
    font-size: 10px;
    display: inline-block;
    margin-left: 0px;
`;

const CloseIconContainer = styledComp.div`
    position: absolute;
    right: 31px;
    bottom: 11px;
    cursor: pointer;
`;

function EnumDropdown({
    onChange,
    value,
    options,
    errorText,
    placeholder = 'No Selection',
    size = 'small',
    children,
    $showClearIcon = true,
    ...rest
}: PropsWithChildren<IEnumDropdown>) {
    const { t } = useTranslation();
    return (
        <FormControl fullWidth error={errorText ? true : false}>
            {!value &&
                <InputLabel
                    style={{ color: '#9C9C9C', top: size === 'small' ? -5 : 0 }}
                    shrink={false}
                    id="enum-select-label-placeholder">
                    {placeholder}
                </InputLabel>}
            <StyledSelect
                size={size}
                labelId="enum-select"
                id="enum-select"
                value={value}
                onChange={onChange}
                fullWidth
                MenuProps={MenuProps}
                IconComponent={(props: any) => <ArrowIcon {...props} style={{ marginRight: 7.8, marginTop: 1 }} />}
                error={!!errorText}
                {...rest}
            >
                {children ? children : options.map((option: TOption) => {
                    return (
                        <StyledMenuItem key={option.id} value={option.id}>{option.name}</StyledMenuItem>
                    )
                })}
            </StyledSelect>
            {value && $showClearIcon ? <CloseIconContainer
                style={{ bottom: size === 'small' ? (value && errorText ? 32.5 : 9.5) : (value && errorText ? 37.5 : 14.5) }}
                onClick={() => onChange?.({ target: { value: '' } } as any, {})}
            >
                <CloseIcon />
            </CloseIconContainer> : null}
            {errorText ? <StyledHelperText error>{errorText}</StyledHelperText> : null}
        </FormControl>
    )
};

export default EnumDropdown;