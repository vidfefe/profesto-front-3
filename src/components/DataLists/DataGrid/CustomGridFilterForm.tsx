import React from 'react';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import ToolTip from '@mui/material/Tooltip';
import { SelectChangeEvent } from '@mui/material/Select';
import { capitalize, unstable_useId as useId } from '@mui/material/utils';
import { styled } from '@mui/material/styles';
import {
    gridFilterableColumnDefinitionsSelector,
    useGridSelector,
    GridLinkOperator,
    useGridApiContext,
    GridTranslationKeys,
    useGridRootProps,
    GridColDef,
    GridFilterFormProps
} from "@mui/x-data-grid-premium";
import { useTranslation } from "react-i18next";

const GridFilterFormRoot = styled('div', {
    name: 'MuiDataGrid',
    slot: 'FilterForm',
    overridesResolver: (props, styles) => styles.filterForm,
})(({ theme }) => ({
    display: 'flex',
    padding: theme.spacing(1),
}));

const FilterFormDeleteIcon = styled(FormControl, {
    name: 'MuiDataGrid',
    slot: 'FilterFormDeleteIcon',
    overridesResolver: (_, styles) => styles.filterFormDeleteIcon,
})(({ theme }) => ({
    flexShrink: 0,
    justifyContent: 'flex-end',
    '& .MuiButtonBase-root': {
        '&:hover': { backgroundColor: '#339966', '& path': { fill: '#FFF' } },
    }
}));

const FilterFormLinkOperatorInput = styled(FormControl, {
    name: 'MuiDataGrid',
    slot: 'FilterFormLinkOperatorInput',
    overridesResolver: (_, styles) => styles.filterFormLinkOperatorInput,
})({
    minWidth: 75,
    justifyContent: 'end',
});

const FilterFormColumnInput = styled(FormControl, {
    name: 'MuiDataGrid',
    slot: 'FilterFormColumnInput',
    overridesResolver: (_, styles) => styles.filterFormColumnInput,
})({ width: 150 });

const FilterFormOperatorInput = styled(FormControl, {
    name: 'MuiDataGrid',
    slot: 'FilterFormOperatorInput',
    overridesResolver: (_, styles) => styles.filterFormOperatorInput,
})({ width: 120 });

const FilterFormValueInput = styled(FormControl, {
    name: 'MuiDataGrid',
    slot: 'FilterFormValueInput',
    overridesResolver: (_, styles) => styles.filterFormValueInput,
    
})({ width: 190 });

const getLinkOperatorLocaleKey = (linkOperator: GridLinkOperator) => {
    switch (linkOperator) {
        case GridLinkOperator.And:
            return 'filterPanelOperatorAnd';
        case GridLinkOperator.Or:
            return 'filterPanelOperatorOr';
        default:
            throw new Error('MUI: Invalid `linkOperator` property in the `GridFilterPanel`.');
    }
};

const getColumnLabel = (col: GridColDef) => col.headerName || col.field;

const collator = new Intl.Collator();

const GridFilterForm = React.forwardRef<HTMLDivElement, GridFilterFormProps>(
    function GridFilterForm(props, ref) {
        const {
            item,
            hasMultipleFilters,
            deleteFilter,
            applyFilterChanges,
            multiFilterOperator,
            showMultiFilterOperators,
            disableMultiFilterOperator,
            applyMultiFilterOperatorChanges,
            focusElementRef,
            linkOperators = [GridLinkOperator.And, GridLinkOperator.Or],
            columnsSort,
            deleteIconProps = {},
            linkOperatorInputProps = {},
            operatorInputProps = {},
            columnInputProps = {},
            valueInputProps = {},
            children,
            ...other
        } = props;
        const { t } = useTranslation('translation', { keyPrefix: 'components.dataGrid' });
        const apiRef = useGridApiContext();
        const filterableColumns = useGridSelector(apiRef, gridFilterableColumnDefinitionsSelector);
        const columnSelectId = useId();
        const columnSelectLabelId = useId();
        const operatorSelectId = useId();
        const operatorSelectLabelId = useId();
        const rootProps = useGridRootProps();
        const valueRef = React.useRef<any>(null);
        const filterSelectorRef = React.useRef<HTMLInputElement>(null);

        const hasLinkOperatorColumn: boolean = hasMultipleFilters && linkOperators.length > 0;

        const baseFormControlProps = rootProps.componentsProps?.baseFormControl || {};

        const baseSelectProps = rootProps.componentsProps?.baseSelect || {};
        const isBaseSelectNative = baseSelectProps.native ?? true;
        const OptionComponent = isBaseSelectNative ? 'option' : MenuItem;

        const { InputComponentProps, ...valueInputPropsOther } = valueInputProps;

        const sortedFilterableColumns = React.useMemo(() => {
            switch (columnsSort) {
                case 'asc':
                    return filterableColumns.sort((a, b) =>
                        collator.compare(getColumnLabel(a), getColumnLabel(b)),
                    );

                case 'desc':
                    return filterableColumns.sort(
                        (a, b) => -collator.compare(getColumnLabel(a), getColumnLabel(b)),
                    );

                default:
                    return filterableColumns;
            }
        }, [filterableColumns, columnsSort]);

        const currentColumn = item.columnField ? apiRef.current.getColumn(item.columnField) : null;

        const currentOperator = React.useMemo(() => {
            if (!item.operatorValue || !currentColumn) {
                return null;
            }

            return currentColumn.filterOperators?.find(
                (operator) => operator.value === item.operatorValue,
            );
        }, [item, currentColumn]);

        const changeColumn = React.useCallback(
            (event: SelectChangeEvent) => {
                const columnField = event.target.value as string;
                const column = apiRef.current.getColumn(columnField)!;

                if (column.field === currentColumn!.field) {
                    // column did not change
                    return;
                }

                // try to keep the same operator when column change
                const newOperator =
                    column.filterOperators!.find((operator) => operator.value === item.operatorValue) ||
                    column.filterOperators![0];

                // Erase filter value if the input component is modified
                const eraseItemValue =
                    !newOperator.InputComponent ||
                    newOperator.InputComponent !== currentOperator?.InputComponent;

                applyFilterChanges({
                    ...item,
                    columnField,
                    operatorValue: newOperator.value,
                    value: eraseItemValue ? undefined : item.value,
                });
            },
            [apiRef, applyFilterChanges, item, currentColumn, currentOperator],
        );

        const changeOperator = React.useCallback(
            (event: SelectChangeEvent) => {
                const operatorValue = event.target.value as string;

                const newOperator = currentColumn?.filterOperators!.find(
                    (operator) => operator.value === operatorValue,
                );

                const eraseItemValue =
                    !newOperator?.InputComponent ||
                    newOperator?.InputComponent !== currentOperator?.InputComponent;

                applyFilterChanges({
                    ...item,
                    operatorValue,
                    value: eraseItemValue ? undefined : item.value,
                });
            },
            [applyFilterChanges, item, currentColumn, currentOperator],
        );

        const changeLinkOperator = React.useCallback(
            (event: SelectChangeEvent) => {
                const linkOperator =
                    (event.target.value as string) === GridLinkOperator.And.toString()
                        ? GridLinkOperator.And
                        : GridLinkOperator.Or;
                applyMultiFilterOperatorChanges(linkOperator);
            },
            [applyMultiFilterOperatorChanges],
        );

        const handleDeleteFilter = () => {
            if (rootProps.disableMultipleColumnsFiltering) {
                if (item.value === undefined) {
                    deleteFilter(item);
                } else {
                    // TODO v6: simplify the behavior by always remove the filter form
                    applyFilterChanges({ ...item, value: undefined });
                }
            } else {
                deleteFilter(item);
            }
        };

        React.useImperativeHandle(
            focusElementRef,
            () => ({
                focus: () => {
                    if (currentOperator?.InputComponent) {
                        valueRef?.current?.focus();
                    } else {
                        filterSelectorRef.current!.focus();
                    }
                },
            }),
            [currentOperator],
        );

        const transilate = (args: any) => {
            return t(args.toLowerCase());
        }

        return (
            <GridFilterFormRoot sx={{ alignItems: 'center', gap: 1 }} ref={ref} {...other}>
                {showMultiFilterOperators ?
                    <FilterFormLinkOperatorInput
                        variant="standard"
                        as={rootProps.components.BaseFormControl}
                        {...baseFormControlProps}
                        {...linkOperatorInputProps}
                        sx={{
                            display: hasLinkOperatorColumn ? 'flex' : 'none',
                            visibility: showMultiFilterOperators ? 'visible' : 'hidden',
                            ...(baseFormControlProps.sx || {}),
                            ...(linkOperatorInputProps.sx || {}),
                        }}
                    >
                        <rootProps.components.BaseSelect
                            inputProps={{
                                'aria-label': apiRef.current.getLocaleText('filterPanelLinkOperator'),
                            }}
                            value={multiFilterOperator}
                            onChange={changeLinkOperator}
                            disabled={!!disableMultiFilterOperator || linkOperators.length === 1}
                            native={isBaseSelectNative}
                            {...rootProps.componentsProps?.baseSelect}
                        >
                            {linkOperators.map((linkOperator) => (
                                <OptionComponent key={linkOperator.toString()} value={linkOperator.toString()}>
                                    {transilate(apiRef.current.getLocaleText(getLinkOperatorLocaleKey(linkOperator)))}
                                </OptionComponent>
                            ))}
                        </rootProps.components.BaseSelect>
                    </FilterFormLinkOperatorInput> : <FilterStartText>{t('where')}</FilterStartText>}
                <FilterFormColumnInput
                    variant="standard"
                    as={rootProps.components.BaseFormControl}
                    {...baseFormControlProps}
                    {...columnInputProps}
                >
                    <InputLabel htmlFor={columnSelectId} id={columnSelectLabelId}>
                        {apiRef.current.getLocaleText('filterPanelColumns')}
                    </InputLabel>
                    <rootProps.components.BaseSelect
                        labelId={columnSelectLabelId}
                        id={columnSelectId}
                        label={apiRef.current.getLocaleText('filterPanelColumns')}
                        value={item.columnField || ''}
                        onChange={changeColumn}
                        native={isBaseSelectNative}
                        {...rootProps.componentsProps?.baseSelect}
                    >
                        {sortedFilterableColumns.map((col) => (
                            <OptionComponent key={col.field} value={col.field}>
                                {getColumnLabel(col)}
                            </OptionComponent>
                        ))}
                    </rootProps.components.BaseSelect>
                </FilterFormColumnInput>
                <FilterFormOperatorInput
                    variant="standard"
                    as={rootProps.components.BaseFormControl}
                    {...baseFormControlProps}
                    {...operatorInputProps}
                >
                    <InputLabel htmlFor={operatorSelectId} id={operatorSelectLabelId}>
                        {apiRef.current.getLocaleText('filterPanelOperators')}
                    </InputLabel>
                    <rootProps.components.BaseSelect
                        labelId={operatorSelectLabelId}
                        label={apiRef.current.getLocaleText('filterPanelOperators')}
                        id={operatorSelectId}
                        value={item.operatorValue}
                        onChange={changeOperator}
                        native={isBaseSelectNative}
                        inputRef={filterSelectorRef}
                        {...rootProps.componentsProps?.baseSelect}
                    >
                        {currentColumn?.filterOperators?.map((operator) => (
                            <OptionComponent key={operator.value} value={operator.value}>
                                {operator.label || apiRef.current.getLocaleText(`filterOperator${capitalize(operator.value)}` as GridTranslationKeys)}
                            </OptionComponent>
                        ))}
                    </rootProps.components.BaseSelect>
                </FilterFormOperatorInput>
                <FilterFormValueInput
                    variant="standard"
                    as={rootProps.components.BaseFormControl}
                    {...baseFormControlProps}
                    {...valueInputPropsOther}
                >
                    
                    {currentOperator?.InputComponent ? (
                        <currentOperator.InputComponent
                            apiRef={apiRef}
                            item={item}
                            applyValue={applyFilterChanges}
                            
                            focusElementRef={valueRef}
                            {...currentOperator.InputComponentProps}
                            {...InputComponentProps}
                        />
                    ) : null}
                </FilterFormValueInput>
                <FilterFormDeleteIcon
                    variant="standard"
                    as={rootProps.components.BaseFormControl}
                    {...baseFormControlProps}
                    {...deleteIconProps}
                >
                    <IconButton
                        aria-label={apiRef.current.getLocaleText('filterPanelDeleteIconLabel')}
                        title={apiRef.current.getLocaleText('filterPanelDeleteIconLabel')}
                        onClick={handleDeleteFilter}
                        size="small"
                    >
                        <ToolTip title='Delete' enterDelay={300} enterNextDelay={1000} disableInteractive>
                            <rootProps.components.FilterPanelDeleteIcon fontSize="small" />
                        </ToolTip>
                    </IconButton>
                </FilterFormDeleteIcon>
            </GridFilterFormRoot>
        );
    },
);

export { GridFilterForm };

const FilterStartText = styled('span')`
    width: 75px;
    font-size: 12px; 
    color: #000;
`;
