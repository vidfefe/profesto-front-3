import { useState, Fragment } from 'react';
import styled from 'styled-components';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import InputBase from '@mui/material/InputBase';
import Box from '@mui/material/Box';
import { autocompleteClasses } from '@mui/material/Autocomplete';
import SelectDropdown from '../SelectDropdown';

import { ReactComponent as ArrowIcon } from 'assets/svg/arrow.svg';

interface PopperComponentProps {
    anchorEl?: any;
    disablePortal?: boolean;
    open: boolean;
};

const StyledAutocompletePopper = styled('div')({
    [`& .${autocompleteClasses.paper}`]: {
        boxShadow: 'none',
        fontSize: 12,
        borderRadius: 0,
        border: 'none',
    },
    [`& .${autocompleteClasses.listbox}`]: {
        backgroundColor: '#FFF',
        padding: 0,
        [`& .${autocompleteClasses.option}`]: {
            color: '#00101A',
            fontSize: 12,
            backgroundColor: '#FFF',
            height: 40,
            '&[aria-selected="true"]': {
                backgroundColor: 'transparent',
            },
            [`&.${autocompleteClasses.focused}, &.${autocompleteClasses.focused}[aria-selected="true"]`]:
            {
                color: '#339966',
                backgroundColor: '#DCEEE5',
            },
        },
    },
    [`&.${autocompleteClasses.popperDisablePortal}`]: {
        position: 'relative',
    },
});

const StyledPopper = styled(Popper)({
    border: '1px solid #D6D6D6',
    boxShadow: '0px 3px 6px #00000029',
    borderRadius: 2,
    width: 300,
    backgroundColor: '#FFF',
    zIndex: 1001
});

const StyledInput = styled(InputBase)({
    padding: 10,
    width: '100%',
    borderBottom: '1px solid #D6D6D6',
    '& input': {
        borderRadius: 4,
        backgroundColor: '#FFF',
        fontSize: 12,
        '&:focus': {
        },
    },
});

export default function EndAdornmentSelect({
    inputPlaceholder = 'Find...',
    endAdornmentPlaceholder = '_',
    endAdornmentLabel = 'code',
    value,
    disabled,
    ...rest
}: any) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        if (anchorEl) {
            anchorEl.focus();
        }
        setAnchorEl(null);
    };

    function PopperComponent(props: PopperComponentProps) {
        const { disablePortal, anchorEl, open, ...other } = props;
        return <StyledAutocompletePopper {...other} />;
    };

    return (
        <Fragment>
            <Box
                component={'button'}
                type='button'
                sx={{ all: 'unset', '&:focus-visible': { '& > div > p': { color: '#77B448' } } }}
                onClick={handleClick}
                disabled={disabled}
            >
                <StyledEndAdornment isOpen={open}>
                    <p>{value?.[endAdornmentLabel] ?? endAdornmentPlaceholder}</p>
                    <StyledArrowIcon />
                </StyledEndAdornment>
            </Box>
            <StyledPopper open={open} anchorEl={anchorEl} placement="bottom-start">
                <ClickAwayListener onClickAway={handleClose}>
                    <div>
                        <SelectDropdown
                            open
                            onClose={handleClose}
                            PopperComponent={PopperComponent}
                            disabled={disabled}
                            renderInput={(params) => (
                                <StyledInput
                                    autoFocus
                                    ref={params.InputProps.ref}
                                    inputProps={params.inputProps}
                                    placeholder={inputPlaceholder}
                                />
                            )}
                            {...rest}
                        />
                    </div>
                </ClickAwayListener>
            </StyledPopper>
        </Fragment>
    );
};

const StyledArrowIcon = styled(ArrowIcon)`
  margin-left: 5px;
`;

const StyledEndAdornment = styled<any>('div')`
  font-family: 14px;
  margin: 12px 0px;
  cursor: pointer;
  display: flex; 
  align-items: center;
  border-left: 1px solid #D6D6D6;
  padding-left: 9px;
  & > p {
    width: 30px;
    display: flex;
    justify-content: center;
    color: #00101A;
  }
  ${StyledArrowIcon} {
    transform: ${({ isOpen }) => isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;
