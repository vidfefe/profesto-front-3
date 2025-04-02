import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import styled from 'styled-components';
import {
    GridColumnsPanelProps,
    useGridSelector,
    gridColumnDefinitionsSelector,
    gridColumnVisibilityModelSelector,
    GridPanelWrapper,
    GridPanelHeader,
    GridPanelContent,
    GridPanelFooter,
    useGridApiContext
} from "@mui/x-data-grid-premium";
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import { CheckBoxRaw } from 'components/Checkbox';
import { useTranslation } from "react-i18next";
import { ReactComponent as MagnifierIcon } from 'assets/svg/magnifier.svg';

function CustomGridColumnsPanel(props: GridColumnsPanelProps) {
    const { t } = useTranslation('translation', { keyPrefix: 'components.dataGrid' });
    const apiRef = useGridApiContext();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const columns = useGridSelector(apiRef, gridColumnDefinitionsSelector);
    const columnVisibilityModel = useGridSelector(apiRef, gridColumnVisibilityModelSelector);
    const [searchValue, setSearchValue] = useState('');

    const toggleColumn = (event: React.MouseEvent<HTMLButtonElement>) => {
        const { name: field } = event.target as HTMLInputElement;
        apiRef.current.setColumnVisibility(field, columnVisibilityModel[field] === false);
    };

    const toggleAllColumns = useCallback((isVisible: boolean) => {
        if (isVisible) {
            return apiRef.current.setColumnVisibilityModel({});
        };
        return apiRef.current.setColumnVisibilityModel(
            Object.fromEntries(
                columns.filter((col) => col.hideable !== false).map((col) => [col.field, false]),
            ),
        );
    }, [apiRef, columns]);

    const handleSearchValueChange = useCallback((event) => {
        setSearchValue(event.target.value);
    }, []);

    const currentColumns = useMemo(() => {
        if (!searchValue) {
            return columns;
        }
        const searchValueToCheck = searchValue.toLowerCase();
        return columns.filter((column) =>
            (column.headerName || column.field).toLowerCase().indexOf(searchValueToCheck) > -1,
        );
    }, [columns, searchValue]);

    useEffect(() => {
        searchInputRef.current!.focus();
    }, []);

    return (
        <GridPanelWrapper {...props}>
            <GridPanelHeader sx={{ padding: 2 }}>
                <TextField
                    placeholder={apiRef!.current.getLocaleText('columnsPanelTextFieldPlaceholder')}
                    inputRef={searchInputRef}
                    value={searchValue}
                    onChange={handleSearchValueChange}
                    variant="outlined"
                    fullWidth
                    size='small'
                    InputLabelProps={{
                        shrink: false
                    }}
                    InputProps={{
                        endAdornment: <InputAdornment position="end"><MagnifierIcon /></InputAdornment>
                    }}
                />
            </GridPanelHeader>
            <GridPanelFooter sx={{ padding: '10px 15px 15px 15px' }}>
                <ColsSelectorButton onClick={() => toggleAllColumns(true)} color="primary">
                    {t('select_all')}
                </ColsSelectorButton>
                <ColsSelectorButton onClick={() => toggleAllColumns(false)} color="primary">
                    {t('clear_all')}
                </ColsSelectorButton>
            </GridPanelFooter>
            <Divider variant="fullWidth" />
            <GridPanelContent sx={{ marginBottom: 2 }}>
                <ColsListContainer>
                    {currentColumns.map((column) => (
                        <div key={column.field}>
                            <StyledFormControlLabel
                                $isChecked={columnVisibilityModel[column.field] !== false}
                                control={
                                    <CheckBoxRaw
                                        disabled={column.hideable === false}
                                        checked={columnVisibilityModel[column.field] !== false}
                                        onClick={toggleColumn}
                                        name={column.field}
                                        size="medium"
                                    />
                                }
                                label={column.headerName || column.field}
                            />
                        </div>
                    ))}
                </ColsListContainer>
            </GridPanelContent>
        </GridPanelWrapper>
    );
};

const ColsSelectorButton = styled.span`
    font-size: 12px;
    color: #FF9933;
    text-decoration: underline;
    cursor: pointer;
`;

const ColsListContainer = styled.div`
    padding: 10px 15px;
    width: 400px;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const StyledFormControlLabel = styled(FormControlLabel) <{ $isChecked: boolean }>`
    margin-left: 0;
    color: ${({ $isChecked }) => $isChecked ? '#339966' : '#000'};
    & .MuiFormControlLabel-label { 
        margin-left: 10px;
    };
`;

export { CustomGridColumnsPanel };