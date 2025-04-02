import { useState, useEffect, useMemo, MutableRefObject, ReactNode } from 'react';
import styled from 'styled-components';
import { isEmpty, isEqual } from 'lodash';
import { useLocation } from 'react-router-dom';
import {
    DataGridPremium,
    useGridApiRef,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarQuickFilter,
    DataGridPremiumProps,
    GridExcelExportOptions,
    gridClasses,
    GridPreferencePanelParams,
    GridToolbarExportContainer,
    useGridApiContext,
    GridExportMenuItemProps,
    GridToolbarContainerProps,
    GridScrollParams,
    GridFilterInputValueProps,
    GridFilterItem,
    GridCellParams,
    GridColTypeDef,
    getGridSingleSelectQuickFilterFn,
    getGridNumericQuickFilterFn,
    getGridStringQuickFilterFn,
} from "@mui/x-data-grid-premium";
import { GridApiPremium } from '@mui/x-data-grid-premium/models/gridApiPremium';
import Box from '@mui/material/Box';
import MenuItem from "@mui/material/MenuItem";
import Button, { ButtonProps } from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import { renderCellExpand } from './CellToExpand';
import { CustomGridFilterPanel } from './CustomFilterPanel';
import { CustomGridColumnsPanel } from './CustomColumnsPanel';
import { CheckBoxRaw } from 'components/Checkbox';
import EnumDropdown from 'components/Dropdowns/EnumDropdown';
import DatePicker from 'components/DatePickers/DatePicker';
import { saveStorageObject, getStorageObject } from 'utils/storage';
import queryString from 'query-string';
import { useTranslation } from "react-i18next";
import { ReactComponent as ArrowIcon } from 'assets/svg/arrow.svg';
import { ReactComponent as NoResultsIcon } from 'assets/svg/no-results.svg';
import { ReactComponent as MagnifierIcon } from 'assets/svg/magnifier.svg';
import { ReactComponent as CloseIcon } from 'assets/svg/close-icon.svg';
import { ReactComponent as FilterIcon } from 'assets/svg/filter-icon_circle.svg';
import { ReactComponent as ColumnsIcon } from 'assets/svg/columns-icon_circle.svg';
import { ReactComponent as ExportIcon } from 'assets/svg/export-icon_circle.svg';
import { ReactComponent as FunnelIcon } from 'assets/svg/funnel_circle.svg';
import { ReactComponent as SortAscIcon } from 'assets/svg/up-arrow-bold_circle.svg';
import { ReactComponent as DotsIcon } from 'assets/svg/dots_circle.svg';
import { ReactComponent as LineIcon } from 'assets/svg/hair_line.svg';
import { ReactComponent as DeleteIcon } from 'assets/svg/close-x.svg';
import { dataGridLocale } from 'utils/dataGridLocales';
import DateRangePicker from 'components/DatePickers/DateRangePicker';
interface IDataGridProps extends DataGridPremiumProps {
    customFilter?: ReactNode;
    enableExports?: boolean,
    excelOptions?: GridExcelExportOptions,
    withoutExportModal?: boolean,
    quickFilterPlaceholder?: string,
    quickFilterWidth?: number,
    apiRef?: MutableRefObject<GridApiPremium>;
    name?: string,
    saveGridState?: boolean,
    discardQueryStringSaveRestrict?: boolean, //override behavior when if query string available doesn't save grid state,
    rangePicker?: any
    timeOffTypeInput?: any
    benefitTypeInput?: any
    initialDates?: any
    onAdd?: () => void;
    addButtonText?: string;
    initialDatesValue?: { startDate: Date; endDate: Date };
    disableQuickFilter?: boolean;
    customButton?: ReactNode;
    noRowsOverlayText?: string;
    customExportButton?: ReactNode;
};

interface ICustomToolbarProps extends GridToolbarContainerProps {
    customFilter?: ReactNode;
    enableExports: boolean,
    excelOptions: GridExcelExportOptions,
    withoutExportModal?: boolean,
    setPanelsButtonEl: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>,
    quickFilterPlaceholder?: string,
    quickFilterWidth?: number,
    openedPanelValue?: string | undefined,
    rangePicker?: any,
    timeOffTypeInput?: any,
    benefitTypeInput?: any,
    initialDates?: any,
    onAdd?: () => void;
    addButtonText?: string;
    initialDatesValue?: { startDate: Date; endDate: Date };
    disableQuickFilter?: boolean;
    customButton?: ReactNode;
    customExportButton?: ReactNode;
};

interface ICustomExportButtonProps extends ButtonProps {
    excelOptions: GridExcelExportOptions,
    withoutExportModal?: boolean,
};

interface IExcelExportVariantsMenuItem extends GridExportMenuItemProps<{}> {
    excelOptions: GridExcelExportOptions;
};

interface NoRowsOverlayProps {
    noRowsOverlayText: string;
}

const CustomNoResultsOverlay = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'components.dataGrid' });
    return (
        <StyledCustomNoResultsContainer>
            <NoResultsIcon />
            <p>{t('many_great_matches')}</p>
            <p>{t('searching_another_values')}</p>
        </StyledCustomNoResultsContainer>
    )
};

const CustomNoRowsOverlay = ({ noRowsOverlayText }: NoRowsOverlayProps) => {
    const { t } = useTranslation('translation', { keyPrefix: 'components.dataGrid' });
    return (
        <StyledCustomNoRowsContainer>
            <p>{noRowsOverlayText || t('no_entrie')}</p>
        </StyledCustomNoRowsContainer>
    )
};

const ExcelExportVariantsMenuItem = (props: IExcelExportVariantsMenuItem) => {
    const { t } = useTranslation('translation', { keyPrefix: 'components.dataGrid' });
    const apiRef = useGridApiContext();
    const { hideMenu, excelOptions } = props;

    const handleExport = (options: GridExcelExportOptions) => apiRef.current.exportDataAsExcel(options);

    return (
        <>
            <MenuItem onClick={() => { handleExport({ ...excelOptions, allColumns: false }); hideMenu?.(); }}>
                {t('visible_columns')}
            </MenuItem>
            <MenuItem onClick={() => { handleExport({ ...excelOptions, allColumns: true }); hideMenu?.(); }}>
                {t('all_columns')}
            </MenuItem>
        </>
    );
};

const ExportButton = ({ excelOptions, withoutExportModal, ...other }: ICustomExportButtonProps) => {
    const apiRef = useGridApiContext();
    const handleExport = (options: GridExcelExportOptions) => apiRef.current.exportDataAsExcel(options);
    return (
        <GridToolbarExportContainer
            sx={{ "&:focus": { backgroundColor: "#DCEEE5", color: '#396 !important', circle: { fill: '#396' } } }} {...other}
            onClick={() => { if(withoutExportModal) handleExport({ ...excelOptions, allColumns: false })}}
        >
            {withoutExportModal ? <></> : <ExcelExportVariantsMenuItem excelOptions={excelOptions} />}
        </GridToolbarExportContainer>
    );
}

const CustomToolbar = ({
    customFilter,
    enableExports,
    excelOptions,
    withoutExportModal,
    rangePicker,
    initialDates,
    timeOffTypeInput,
    benefitTypeInput,
    setPanelsButtonEl,
    quickFilterPlaceholder,
    quickFilterWidth,
    openedPanelValue,
    onAdd,
    addButtonText,
    initialDatesValue,
    disableQuickFilter,
    customButton,
    customExportButton,
    ...rest
}: ICustomToolbarProps) => {
    const { t } = useTranslation();
    const [isFilterSelect, setIsFilterSelected] = useState<boolean>(false);
    const apiRef = useGridApiContext();
    
    useEffect(() => {
        return apiRef.current.subscribeEvent('stateChange', (
            ({ filter: { filterModel: { items } } }) => setIsFilterSelected(!isEmpty(items))
        ))
    }, [apiRef]);



    const buttonStyle = (value: string, type?: string) => {
        if (type === 'bg') {
            if (openedPanelValue === value) {
                return '#DCEEE5';
            }
            if (isFilterSelect && value !== 'columns') {
                return '#F2F2F4';
            }
            return 'transparent';
        } else {
            if (openedPanelValue === value) {
                return '#339966';
            }
        }
    };

    return (
        <GridToolbarContainer {...rest}>
            {rangePicker && <DateRangePicker initialDates={initialDates} onChangeDate={(e: any) => rangePicker(e)} initialValue={initialDatesValue}/>}
            {timeOffTypeInput && timeOffTypeInput()}
            {benefitTypeInput && benefitTypeInput()}
            {customFilter}
            {!disableQuickFilter &&
                <GridToolbarQuickFilter
                    sx={quickFilterStyle}
                    placeholder={quickFilterPlaceholder || t('components.dataGrid.toolbarQuickFilterPlaceholder')}
                    style={{ width: timeOffTypeInput || benefitTypeInput ? 380 : quickFilterWidth || 440 }}
                    variant="outlined"
                    size="small"
                    debounceMs={500}
                />
            }
            
            <div style={{ display: 'flex', marginLeft: 'auto', gap: 20 }}>
                {customButton}
                <FilterButtonContainer $isFilterSelect={isFilterSelect || openedPanelValue === 'filters'}>
                    {isFilterSelect ? <StyledCloseIcon onClick={() => apiRef.current.upsertFilterItems([])} /> : null}
                    <GridToolbarFilterButton
                        sx={{
                            paddingRight: isFilterSelect ? "30px !important" : '16px',
                            backgroundColor: buttonStyle('filters', 'bg'),
                            color: isFilterSelect || openedPanelValue === 'filters' ? "#339966 !important" : '#364852',
                        }}
                        ref={setPanelsButtonEl}
                    />
                </FilterButtonContainer>
                <GridToolbarColumnsButton
                    sx={{
                        backgroundColor: buttonStyle('columns', 'bg'),
                        circle: { fill: buttonStyle('columns') },
                        color: openedPanelValue === 'columns' ? '#396 !important' : '#364852',
                    }}
                    ref={setPanelsButtonEl} />
                {enableExports ? (customExportButton || <ExportButton excelOptions={excelOptions} withoutExportModal={withoutExportModal} />) : null}
                {onAdd &&
                    <AddButton
                        onClick={onAdd}
                        type="button"
                        size='large'
                        variant='contained'
                        sx={{ marginLeft: 'auto' }}
                    >
                        + {addButtonText || t('settings.new_item')}
                    </AddButton>
                }
            </div>
        </GridToolbarContainer>
    )
};

function GridFilterDateInput(props: GridFilterInputValueProps) {
    const { item, applyValue } = props;

    const handleFilterChange = (newValue: unknown) => {
        applyValue({ ...item, value: newValue });
    };

    return (
        <DatePicker
            selected={item.value ? new Date(item.value) : null}
            onChange={handleFilterChange}
        />
    );
};

function buildApplyDateFilterFn(filterItem: GridFilterItem, compareFn: (value1: number, value2: number) => boolean, showTime: boolean = false) {
    if (!filterItem.value) {
        return null;
    };

    const filterValueMs = new Date(filterItem.value).getTime();

    return ({ value }: GridCellParams<Date, any, any>): boolean => {
        if (!value) {
            return false;
        }

        // Make a copy of the date to not reset the hours in the original object
        const dateCopy = new Date(value);
        dateCopy.setHours(
            showTime ? value.getHours() : 0,
            showTime ? value.getMinutes() : 0,
            0,
            0,
        );
        const cellValueMs = dateCopy.getTime();

        return compareFn(cellValueMs, filterValueMs);
    };
};

function getDateFilterOperators(): GridColTypeDef['filterOperators'] {
    return [
        {
            value: 'is',
            getApplyFilterFn: (filterItem) => {
                return buildApplyDateFilterFn(
                    filterItem,
                    (value1, value2) => value1 === value2,
                );
            },
            InputComponent: GridFilterDateInput,
        },
        {
            value: 'not',
            getApplyFilterFn: (filterItem) => {
                return buildApplyDateFilterFn(
                    filterItem,
                    (value1, value2) => value1 !== value2,
                );
            },
            InputComponent: GridFilterDateInput,
        },
        {
            value: 'after',
            getApplyFilterFn: (filterItem) => {
                return buildApplyDateFilterFn(
                    filterItem,
                    (value1, value2) => value1 > value2,
                );
            },
            InputComponent: GridFilterDateInput,
        },
        {
            value: 'onOrAfter',
            getApplyFilterFn: (filterItem) => {
                return buildApplyDateFilterFn(
                    filterItem,
                    (value1, value2) => value1 >= value2,
                );
            },
            InputComponent: GridFilterDateInput,
        },
        {
            value: 'before',
            getApplyFilterFn: (filterItem) => {
                return buildApplyDateFilterFn(
                    filterItem,
                    (value1, value2) => value1 < value2,
                );
            },
            InputComponent: GridFilterDateInput,
        },
        {
            value: 'onOrBefore',
            getApplyFilterFn: (filterItem) => {
                return buildApplyDateFilterFn(
                    filterItem,
                    (value1, value2) => value1 <= value2,
                );
            },
            InputComponent: GridFilterDateInput,
        },
        {
            value: 'isEmpty',
            getApplyFilterFn: () => {
                return ({ value }): boolean => {
                    return value == null;
                };
            },
            requiresFilterValue: false,
        },
        {
            value: 'isNotEmpty',
            getApplyFilterFn: () => {
                return ({ value }): boolean => {
                    return value != null;
                };
            },
            requiresFilterValue: false,
        },
    ];
};

//ქვიქფილტრის ტიპები
const typeToFilterLogic: any = {
    singleSelect: getGridSingleSelectQuickFilterFn,
    number: getGridNumericQuickFilterFn,
    string: getGridStringQuickFilterFn,
    undefined: getGridStringQuickFilterFn
};

//ქვიქფილტრის ლოგიკა მოძებნის მხოლოდ ხილული სვეტებში
const wrapQuickFilterLogic = (defaultGetQuickFilter: any) => (
    value: any,
    column: any,
    apiRef: any,
) => {
    const visibleFields = apiRef.current
        .getVisibleColumns()
        .map((col: any) => col.field);

    if (!visibleFields.includes(column.field)) {
        return null;
    }
    return defaultGetQuickFilter(value, column, apiRef);
};

function DataGrid({
    customFilter,
    enableExports = false,
    quickFilterPlaceholder = 'Search...',
    quickFilterWidth,
    components,
    componentsProps,
    withoutExportModal,
    excelOptions = {},
    columns,
    apiRef,
    name,
    saveGridState = false,
    discardQueryStringSaveRestrict = false,
    rangePicker,
    timeOffTypeInput,
    benefitTypeInput,
    initialDates,
    onAdd,
    addButtonText,
    initialDatesValue,
    disableQuickFilter,
    customButton,
    noRowsOverlayText,
    customExportButton,
    ...rest
}: IDataGridProps) {
    const { t, i18n } = useTranslation('translation', { keyPrefix: 'components.dataGrid' });
    const { search } = useLocation();
    const queryParams = queryString.parse(search);
    const [gridWholeState, setGridWholeState] = useState<any>(null);
    const [openedPanelValue, setOpenedPanelValue] = useState<string | undefined>('');
    const [panelsButtonEl, setPanelsButtonEl] = useState<HTMLButtonElement | null>(null);
    const [isGridScrolledVertical, setIsGridScrolledVertical] = useState<boolean>(false);
    const innerApiRef = useGridApiRef();
    const modifiedColumnsForExpandCell = useMemo(() => columns.map((col) => {
        if (col.type === 'date') {
            return { filterOperators: getDateFilterOperators(), renderCell: renderCellExpand, ...col }
        } else if (col.type === 'actions') {
            return { getApplyQuickFilterFn: typeToFilterLogic[col.type ?? "string"] && wrapQuickFilterLogic(typeToFilterLogic[col.type ?? "string"]), ...col }
        } else {
            return { renderCell: renderCellExpand, getApplyQuickFilterFn: typeToFilterLogic[col.type ?? "string"] && wrapQuickFilterLogic(typeToFilterLogic[col.type ?? "string"]), ...col }
        };
    }), [columns]);


    useEffect(() => {
        if (apiRef) {
            return apiRef.current.subscribeEvent('rowsScroll', (
                params: GridScrollParams) => {
                if (params.top > 0) {
                    setIsGridScrolledVertical(true);
                }
                if (params.top === 0) {
                    setIsGridScrolledVertical(false);
                }
                return;
            }
            );
        } else {
            return innerApiRef.current.subscribeEvent('rowsScroll', (
                params: GridScrollParams) => {
                if (params.top > 0) {
                    setIsGridScrolledVertical(true);
                }
                if (params.top === 0) {
                    setIsGridScrolledVertical(false);
                }
                return;
            }
            );
        }
    }, [apiRef, innerApiRef]);

    useEffect(() => {
        if (saveGridState && name && (isEmpty(queryParams) || discardQueryStringSaveRestrict)) {
            if (apiRef) {
                return apiRef.current.subscribeEvent('stateChange', () => {
                    const state = apiRef.current.exportState();
                    if (!isEqual(state, gridWholeState)) setGridWholeState(state);
                })
            } else {
                return innerApiRef.current.subscribeEvent('stateChange', () => {
                    const state = innerApiRef.current.exportState();
                    if (!isEqual(state, gridWholeState)) setGridWholeState(state);
                })
            }
        }
    }, [apiRef, innerApiRef]);

    useEffect(() => {
        if (saveGridState && name && (isEmpty(queryParams) || discardQueryStringSaveRestrict)) {
            if (apiRef) {
                const state = getStorageObject(`gridState-${name}`);
                if (state) {
                    delete state.filter?.filterModel?.quickFilterValues;
                    apiRef.current.restoreState(state)
                }
            } else {
                const state = getStorageObject(`gridState-${name}`);
                if (state) {
                    delete state.filter?.filterModel?.quickFilterValues;
                    innerApiRef.current.restoreState(state)
                }
            }
        }
    }, []);

    useEffect(() => () => {
        if (gridWholeState) {
            let state = gridWholeState;
            delete state.preferencePanel;
            delete state.pagination;
            if (!isEqual(gridWholeState, getStorageObject(`gridState-${name}`))) {
                saveStorageObject(`gridState-${name}`, state);
            }
        }
    }, [gridWholeState]);
    
    return (
        <Box sx={actionButtonsStyle}>
            <StyledDataGrid
                apiRef={apiRef ?? innerApiRef}
                $enableHeaderShadow={isGridScrolledVertical}
                columns={modifiedColumnsForExpandCell}
                rowHeight={60}
                localeText={dataGridLocale(t, i18n)}
                checkboxSelection={false}
                hideFooter={true}
                hideFooterRowCount={false}
                hideFooterPagination
                onPreferencePanelClose={() => setOpenedPanelValue('')}
                onPreferencePanelOpen={(e: GridPreferencePanelParams) => setOpenedPanelValue(e.openedPanelValue)}
                components={{
                    Toolbar: CustomToolbar,
                    LoadingOverlay: LinearProgress,
                    NoResultsOverlay: CustomNoResultsOverlay,
                    NoRowsOverlay: CustomNoRowsOverlay,
                    QuickFilterClearIcon: CloseIcon,
                    QuickFilterIcon: MagnifierIcon,
                    OpenFilterButtonIcon: FilterIcon,
                    ColumnSelectorIcon: ColumnsIcon,
                    ExportIcon: ExportIcon,
                    ColumnFilteredIcon: FunnelIcon,
                    ColumnSortedAscendingIcon: SortAscIcon,
                    ColumnSortedDescendingIcon: SortDescIcon,
                    ColumnMenuIcon: DotsIcon,
                    ColumnResizeIcon: LineIcon,
                    ColumnsPanel: CustomGridColumnsPanel,
                    BaseSwitch: CheckBoxRaw,
                    BaseSelect: EnumDropdown,
                    FilterPanelDeleteIcon: StyledDeleteIcon,
                    FilterPanel: CustomGridFilterPanel,
                    ...components
                }}
                componentsProps={{
                    panel: {
                        anchorEl: panelsButtonEl,
                        placement: 'bottom-end',
                    },
                    baseSelect: {
                        native: false,
                        $showClearIcon: false,
                        label: ''
                    },
                    toolbar: {
                        setPanelsButtonEl,
                        withoutExportModal,
                        enableExports,
                        excelOptions,
                        quickFilterPlaceholder,
                        quickFilterWidth,
                        openedPanelValue,
                        rangePicker: rangePicker,
                        timeOffTypeInput: timeOffTypeInput,
                        benefitTypeInput: benefitTypeInput,
                        initialDates: initialDates,
                        onAdd,
                        addButtonText,
                        initialDatesValue,
                        customFilter,
                        disableQuickFilter,
                        customButton,
                        customExportButton,
                    },
                    noRowsOverlay: {
                        noRowsOverlayText
                    },
                    baseTextField: {
                        variant: 'outlined',
                        size: 'small',
                        label: '',
                        SelectProps: {
                            IconComponent: StyledArrowIcon
                        }
                    },
                    filterPanel: {
                        sx: {
                            maxWidth: "100vw"
                        }
                    },
                    ...componentsProps
                }}
                {...rest}
            />
        </Box>
    );
};

export default DataGrid;

const StyledDataGrid = styled(DataGridPremium)<{ $enableHeaderShadow: boolean, $enableRowShadow?: boolean }>(({ theme, $enableHeaderShadow }) => ({
    border: 'none',
    '.MuiDataGrid-toolbarContainer': {
        padding: 0,
        marginBottom: 18,
        '& > div': {
            '.MuiButtonBase-root': {
                fontSize: 12,
                textTransform: 'capitalize',
                color: '#364852',
                fontWeight: 'inherit',
                padding: '7px 16px',
                [theme.breakpoints.down('md')]: {
                    fontSize: 0,
                },
                '&:hover, &:focus-visible': {
                    color: '#396',
                    backgroundColor: '#DCEEE5',
                    '& circle': {
                        fill: '#396',
                    },
                    'path': {
                        fill: '#FFF',
                    },
                },
                '.MuiBadge-badge': {
                    height: 12,
                    width: 12,
                    minWidth: 12,
                    fontSize: 7,
                    backgroundColor: '#FFF',
                    color: '#339966',
                    top: 1,
                    right: 4,
                },
            },
        },
    },
    '.MuiDataGrid-cell': {
        borderBottom: '1px solid #F8F8F8',
        fontSize: 12,
    },
    '.MuiDataGrid-columnHeaders': {
        borderBottom: '1px solid #F8F8F8',
        boxShadow: $enableHeaderShadow ? '0px 3px 6px #00000029' : 'none',
        transition: 'box-shadow 0.2s ease-in-out',
    },
    /* '.MuiDataGrid-main': {
        boxShadow: $enableRowShadow ? 'inset 3px 0px 3px 0px #00000029' : 'none',
        clipPath: 'inset(10px 0px 10px 0px)',
        transition: 'box-shadow 0.2s ease-in-out',
    } */
    '.MuiDataGrid-actionsCell': {
        gridGap: 0,
    },
    '.MuiDataGrid-columnHeaderTitleContainerContent': {
        fontSize: 12,
        fontFamily: "'Aspira Demi', 'FiraGo Medium'",
    },
    '.MuiDataGrid-iconButtonContainer': {
        '.MuiButtonBase-root': {
            backgroundColor: 'transparent',
            '&:hover': {
                '& circle': {
                    fill: '#339966',
                },
                '& path:last-of-type': {
                    fill: '#FFF',
                },
            },
        },
        '.MuiBadge-badge': {
            height: 12,
            width: 12,
            minWidth: 12,
            fontSize: 8,
            backgroundColor: '#E7F3ED',
            color: '#339966',
            top: 7,
            right: 7,
        },
    },
    '.MuiDataGrid-menuIcon': {
        '.MuiButtonBase-root': {
            backgroundColor: 'transparent',
            '&:hover': {
                '& #bgCircle': {
                    fill: '#339966',
                },
                '& circle:not(#bgCircle)': {
                    fill: '#FFF'
                },
            },
        },
    },
    '.MuiDataGrid-columnHeader:focus': {
        backgroundColor: '#F2F2F4',
        outline: 'none',
    },
    '.MuiDataGrid-columnSeparator': {
        width: 9,
        margin: '0 4px',
        '&:hover': {
            '& rect': {
                fill: '#339966'
            },
        },
    },
}));

const StyledCustomNoResultsContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    p:first-of-type {
        text-align: left;
        color: #676767;
        font-size: 13px;
        font-family: 'Aspira Demi', 'FiraGO Regular';
    };
    p:last-of-type {
        text-align: left;
        color: #676767;
        font-size: 12px;
    };

`;

const StyledCustomNoRowsContainer = styled.div`
    padding: 20px 30px;
    p {
        text-align: left;
        font-size: 11px;
        color: #80888D;
    };
`;

const StyledCloseIcon = styled(CloseIcon)`
    position: relative;
    z-index: 2;
    right: -130px;
    top: 1px;
    width: 8px;
    height: 8px;
    cursor: pointer;
    & path {
        fill: #868686;
    }
`;

const StyledDeleteIcon = styled(DeleteIcon)`
    width: 14px;
    height: 14px;
`;

const SortDescIcon = styled(SortAscIcon)`
    transform: rotate(180deg);
`;

const FilterButtonContainer = styled.div<{ $isFilterSelect: boolean }>`
    ${StyledCloseIcon}:hover + .MuiButtonBase-root{
        background-color: #DCEEE5;
    }
    & circle { 
        fill: ${({ $isFilterSelect }) => $isFilterSelect ? '#339966' : '#b5b5b5'}
    }
`;

const StyledArrowIcon = styled(ArrowIcon)`
    margin-top: 1.5px;
    margin-right: 7px;
`;

const actionButtonsStyle = {
    width: '100%',
    height: '100%',
    '& .actionButton': {
        display: 'none',
    },
    [`&`]: {
        '.MuiDataGrid-row.Mui-hovered .actionButton': {
            display: 'flex',
        },
    },
    [`& .${gridClasses.row}:hover`]: {
        '.actionButton': {
            display: 'flex',
        },
    },
};

const quickFilterStyle = {
    padding: 0,
    '& input': { padding: '10px 5px' },
    '.MuiButtonBase-root': {
        padding: '5px !important',
        '&:hover': {
            backgroundColor: 'transparent !important',
            'path': { fill: '#636363 !important' }
        },
    },
};

const AddButton = styled(Button)`
    color: white !important;
    background-color: #339966 !important;
    &:hover {
        background-color: #236B47 !important
    }
`;
