import { useState, useRef, Fragment, useEffect } from "react";
import { useHistory } from 'react-router-dom';
import styled from "styled-components";
import { isEmpty } from "lodash";
import { useHotkeys } from 'react-hotkeys-hook';
import { useDebounce } from "hooks/common";
import { employeeInitials, isOverflown } from "utils/common";
import EmployeeImage from "components/Employee/Image";
import useQuery from "hooks/useQueryCustom";
import Paper from '@mui/material/Paper';
import InputBase from "@mui/material/InputBase";
import InputAdornment from '@mui/material/InputAdornment';
import MenuList from '@mui/material/MenuList';
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import Popper, { PopperProps } from "@mui/material/Popper";
import ClickAwayListener from '@mui/material/ClickAwayListener';
import CircularProgress from '@mui/material/CircularProgress';

import { ReactComponent as MagnifierIcon } from 'assets/svg/magnifier.svg';
import { ReactComponent as CloseIcon } from 'assets/svg/close-icon.svg';
import { ReactComponent as NoResultsIcon } from 'assets/svg/no-results.svg';
import { useTranslation } from "react-i18next";

type TEmployeeSearch = {
    id: number,
    first_name: string,
    last_name: string,
    middle_name: string,
    preferred_name: string,
    uuid: string,
};

function useSearch(search: string) {
    return useQuery<any>(["general_search", search], {
        endpoint: `employee_search?search=${search}`,
        options: { method: "get" },
    }, { enabled: false });
};

export default function EmployeeSearchField() {
    const { t } = useTranslation();
    useHotkeys('ctrl+k, cmd+k', (e) => { e.preventDefault(); inputRef.current.focus() });
    //No TS types for userAgentData yet.
    //@ts-ignore
    const isMacOS = navigator?.userAgentData?.platform === 'macOS';

    const history = useHistory();
    const [searchValue, setSearchValue] = useState<string>('');
    const [openSearchPanel, setOpenSearchPanel] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<PopperProps['anchorEl']>(null);
    const [isOverflownName, setIsOverflownName] = useState(false);
    const ref = useRef<any>(null);
    const inputRef = useRef<any>(null);
    const searchItemRef = useRef<any>(null);

    const debouncedSearch = useDebounce(searchValue, 300);
    const { refetch, data: searchData = [], isLoading } = useSearch(debouncedSearch);
    useEffect(() => {
        if (debouncedSearch) {
            refetch();
        }
    }, [debouncedSearch, refetch]);

    const onSearchValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
        if (!openSearchPanel) setOpenSearchPanel(true);
        if (!e.target.value) setOpenSearchPanel(false);
    };

    const onFocusSearchField = () => {
        const getBoundingClientRect = () => ref.current.getBoundingClientRect();
        setAnchorEl({ getBoundingClientRect });
    };

    const handleMouseEnter = () => {
        const isCurrentlyOverflown = isOverflown(searchItemRef.current!);
        setIsOverflownName(isCurrentlyOverflown);
    };

    const handleMouseLeave = () => {
        setIsOverflownName(false);
    };

    const onEmployeeItemClick = (employee: TEmployeeSearch) => {
        setSearchValue('');
        setOpenSearchPanel(false);
        history.push(`/employee/${employee.id}`)
    };

    return (
        <Fragment>
            <ClickAwayListener onClickAway={() => setOpenSearchPanel(false)}>
                <SearchFieldContainer ref={ref}>
                    <StyledTextField
                        inputRef={inputRef}
                        placeholder={t('headers.authorized.search_an_employee')}
                        startAdornment={<InputAdornment position="start"><MagnifierIcon /></InputAdornment>}
                        endAdornment={searchValue ? <InputAdornment position="end">
                            <StyledCloseIcon onClick={() => setSearchValue('')} />
                        </InputAdornment> : <ModifierKeySearch>{isMacOS ? '⌘K' : 'Ctrl+K'}</ModifierKeySearch>}
                        value={searchValue}
                        className="ellipsis"
                        onChange={onSearchValueChange}
                        onFocus={onFocusSearchField}
                    />
                </SearchFieldContainer>
            </ClickAwayListener>
            <Popper
                open={openSearchPanel} anchorEl={anchorEl} sx={{ zIndex: 99 }}
                modifiers={[{ name: 'offset', options: { offset: [-250, 40] } }]}
            >
                <StyledPaper>
                    {isEmpty(searchData) ? <StyledCustomNoRowsContainer>
                        {isLoading ? <CircularProgress /> : <><NoResultsIcon />
                            <p>{t('headers.authorized.no_matches_found')}</p></>}
                    </StyledCustomNoRowsContainer> : null}
                    <MenuList>
                        {searchData.map((employee: TEmployeeSearch, index: number) => {
                            return (
                                <MenuItem
                                    key={index}
                                    onClick={() => onEmployeeItemClick(employee)}
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <ImageContainer>
                                        <EmployeeImage
                                            initials={employeeInitials(`${employee.first_name} ${employee.last_name}`)}
                                            uuid={employee.uuid}
                                            fontSize={12}
                                        />
                                    </ImageContainer>
                                    {isOverflownName ? <Tooltip title={`${employee.first_name} ${employee.last_name} (#${employee.id})`}>
                                        <SearchItem ref={searchItemRef}>
                                            {`${employee.first_name} ${employee.last_name} (#${employee.id})`}
                                        </SearchItem>
                                    </Tooltip> :
                                        <SearchItem ref={searchItemRef} title={`${employee.first_name} ${employee.last_name} (#${employee.id})`}>
                                            {`${employee.first_name} ${employee.last_name} (#${employee.id})`}
                                        </SearchItem>}
                                </MenuItem>
                            )
                        })}
                    </MenuList>
                </StyledPaper>
            </Popper>
        </Fragment>
    )
};


const StyledCloseIcon = styled(CloseIcon)`
  cursor: pointer;
  width: 9px;
  height: 9px;
`;

const SearchFieldContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-right: 7px;
    & > .ellipsis {
        & > input {
            width: 100%;
            text-overflow: ellipsis;
            padding-right: 10px;
            font-size: 11px;
            padding-top: 5px;
        }
    }
    
`;

const StyledTextField = styled(InputBase)(({ theme }) => ({
    position: "absolute",
    top: 13,
    backgroundColor: "#FFF",
    height: 36,
    padding: "0 13px",
    width: "16rem",
    transition: "width 0.2s ease-in-out",
    border: "1px solid #FFF",
    borderRadius: 30,
    '&.Mui-focused': {
        width: '36rem',
        borderColor: '#99CC33'
    },
    [theme.breakpoints.down('lg')]: {
        width: 40,
        '&.Mui-focused': {
            width: 40,
        },
    },
}));

const StyledCustomNoRowsContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
    & > p {
        color: #676767;
        font-size: 10px;
    };
`;

const ImageContainer = styled.span`
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-right: 10px;
`;

const SearchItem = styled.p`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 10px;
`;

const StyledPaper = styled(Paper)`
    background-color: #FFF;
    padding: 10px 0;
    width: 36rem;
    max-height: 400px;
    overflow-y: scroll;
`;

const ModifierKeySearch = styled('p')(({ theme }) => ({
    color: '#9C9C9C',
    [theme.breakpoints.down('lg')]: {
        display: 'none'
    },
}));