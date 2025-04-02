import { useState, Fragment, useEffect, forwardRef, Ref, CSSProperties } from 'react';
import Autocomplete, { autocompleteClasses, AutocompleteProps } from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Popper from '@mui/material/Popper'
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import styled from '@mui/system/styled';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
import { default as styledComp } from 'styled-components';
import EmployeeImage from "../Employee/Image";
import { ReactComponent as ArrowIcon } from 'assets/svg/arrow.svg';
import { ReactComponent as CloseIcon } from 'assets/svg/close-x.svg';
import { ReactComponent as PlusIcon } from 'assets/svg/plus.svg';
import { useTranslation } from "react-i18next";
import { employeeInitials as nameInitials } from "utils/common";
import { AxiosResponse } from 'axios';

interface ISelectDropdown<
    T,
    Multiple extends boolean | undefined,
    DisableClearable extends boolean | undefined,
    FreeSolo extends boolean | undefined
> extends Partial<AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>> {
    inputPlaceholder?: string,
    loadRemoteData?: () => Promise<AxiosResponse<any>>,
    withPic?: boolean,
    errorText?: string | any,
    errorWithoutText?: boolean,
    label?: string,
    required?: boolean,
    onAddItem?: () => void,
    optionLabelField?: string;
    inputStyle?: CSSProperties;
};

const ImageContainer = styledComp.span`
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-right: 10px
`;

const StyledOption = styledComp.p`
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
`;

const StyledAddOption = styledComp.p`
    display: flex;
    align-items: center;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    color: #339966;
    font-size: 12px;
    background-color: #FFF;
    height: 40px;
    padding: 0 13px;
    cursor: pointer;
    border-top: 1px solid #D6D6D6;
    &:hover {
        background-color: #DCEEE5;
    }
`;

const StyledInputLabel = styledComp(InputLabel)`
    color: #000;
    margin-bottom: 5px;
    & > sup {
        color: #C54343;
    }
`;

const StyledAutocomplete: typeof Autocomplete = styled(Autocomplete)`
    .${autocompleteClasses.popupIndicator} {
        background-color: transparent;
    }
    .${autocompleteClasses.clearIndicator} {
        background-color: transparent;
        visibility: visible;
    }
    .${autocompleteClasses.endAdornment} {
        margin: 4px;
    }
    .${autocompleteClasses.inputRoot} {
        background-color: #FFF;
        color: #00101A;
        height: ${({ size }) => size === 'small' ? '40px' : '50px'};
        & .MuiOutlinedInput-notchedOutline {
            /* border-color: #D6D6D6; */
        }
        &:hover .MuiOutlinedInput-notchedOutline {
            border-color: #99CC33;
        }
        &.Mui-focused .MuiOutlinedInput-notchedOutline {
            border: 1px solid #99CC33;
        }
         &.Mui-disabled .MuiOutlinedInput-notchedOutline {
            border: 1px solid #D6D6D6;
        }
    }
`;

const StyledAutocompletePopper = styled(Popper)`
    & .${autocompleteClasses.paper} {
        margin-top: 2px;
    }
    & .${autocompleteClasses.listbox} {
        padding: 0 0;
        background-color: #FFF;
    }
    & .${autocompleteClasses.option} {
        color: #00101A;
        font-size: 12px;
        background-color: #FFF;
        height: 40px;
        &:hover, &.Mui-focused{
            color: #339966;
            background-color: #DCEEE5;
        }
        &[aria-selected="true"] {
            background-color: transparent;
        }
    }
`;

const CustomPaperComponent = ({ onClick, children, ...rest }: any) => {
    const { t, i18n } = useTranslation('translation', { keyPrefix: 'components.autocomplete' });
    return (
        <Paper {...rest}>
            {children}
            <StyledAddOption onMouseDown={e => e.preventDefault()} onClick={onClick}>
                <PlusIcon style={{ marginRight: 8 }} />{t('add_item')}
            </StyledAddOption>
        </Paper>
    );
};

const SelectDropdown = forwardRef(function SelectDropdown<
    T,
    Multiple extends boolean | undefined,
    DisableClearable extends boolean | undefined,
    FreeSolo extends boolean | undefined
>(props: ISelectDropdown<T, Multiple, DisableClearable, FreeSolo>, ref: Ref<unknown>) {
    const {
        inputPlaceholder = 'No Selection',
        loadRemoteData,
        errorText,
        errorWithoutText,
        options: staticOptions,
        withPic,
        freeSolo,
        size = 'small',
        open: openFromProps,
        label,
        required,
        onAddItem,
        optionLabelField,
        inputStyle,
        ...rest
    } = props;

    const [open, setOpen] = useState<boolean | undefined>(openFromProps ?? false);
    const [options, setOptions] = useState<T[]>([]);
    const loading = open && loadRemoteData && options.length === 0;
    const [reqLoading, setReqLoading] = useState<boolean>(false);

    useEffect(() => {
        let active = true;
        if (loadRemoteData) {
            if (!loading) return undefined;
            (async () => {
                setReqLoading(true);
                const res: any = await loadRemoteData?.();
                setReqLoading(false);
                if (active && res) {
                    setOptions([...res.data.list]);
                }
            })();
        }
        return () => { active = false; }
    }, [loadRemoteData, loading]);

    useEffect(() => {
        if (!open) setOptions([]);
    }, [open]);

    return (
        <Fragment>
            {label ? <StyledInputLabel>{label}{required && <sup>*</sup>}</StyledInputLabel> : null}
            <StyledAutocomplete
                size={size}
                isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                getOptionLabel={!freeSolo ? (option: any) =>
                    optionLabelField && (optionLabelField in option)
                    ? option[optionLabelField]
                    : option.name ?? option :
                        (option: any) => {
                            if (typeof option === 'string') {
                                return option;
                            }
                            if (option.inputValue) {
                                return option.inputValue;
                            }
                            if (optionLabelField && (optionLabelField in option)) {
                                return option[optionLabelField];
                            }
                            return option.name;
                        }
                }
                onKeyDown={(event: any) => {
                    if (event.key === 'Enter') {
                        setOpen(true);
                    }
                }}
                open={open}
                options={loadRemoteData ? options : staticOptions || []}
                onOpen={() => openFromProps === true || openFromProps === false ? null : setOpen(true)}
                onClose={() => openFromProps === true || openFromProps === false ? null : setOpen(false)}
                loading={loading && reqLoading}
                id="select_dropdown"
                handleHomeEndKeys
                forcePopupIcon
                fullWidth
                autoHighlight
                PopperComponent={StyledAutocompletePopper}
                PaperComponent={freeSolo ? CustomPaperComponent : Paper}
                componentsProps={{ paper: { onClick: freeSolo ? onAddItem : () => null } }}
                popupIcon={<ArrowIcon />}
                clearIcon={<CloseIcon />}
                renderOption={(props: any, option: any) => (
                    <Box component="li" {...props}
                        style={{ paddingLeft: 13 }}
                        key={option.id ?? props.key}
                    >
                        {withPic ? <ImageContainer>
                            <EmployeeImage
                                initials={nameInitials(option.name)}
                                uuid={option.uuid}
                                fontSize={11}
                            />
                        </ImageContainer> : null}
                        <StyledOption>{option.name}</StyledOption>
                    </Box>
                )}
                freeSolo={freeSolo}
                renderInput={(params: any) => (
                    <TextField
                        error={errorText ? true : false}
                        helperText={!errorWithoutText && errorText}
                        inputRef={ref}
                        {...params}
                        placeholder={inputPlaceholder}
                        FormHelperTextProps={{
                            style: {
                                marginLeft: 0,
                                marginTop: 5,
                                color: 'var(--red)',
                                fontSize: 10,
                                lineHeight: 'initial'
                            }
                        }}
                        InputProps={{
                            ...params.InputProps,
                            style: inputStyle,
                            endAdornment: (
                                <Fragment>
                                    {loading && reqLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </Fragment>
                            ),
                        }}
                    />
                )}
                {...rest}
            />
        </Fragment>
    )
});

export default SelectDropdown;