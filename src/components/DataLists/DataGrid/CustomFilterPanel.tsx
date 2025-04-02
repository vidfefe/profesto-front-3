import React from 'react';
import styled from 'styled-components';
import {
    GridFilterItem,
    GridLinkOperator,
    useGridApiContext,
    GridAddIcon,
    GridPanelContent,
    GridPanelFooter,
    GridPanelWrapper,
    useGridRootProps,
    useGridSelector,
    gridFilterModelSelector,
    gridFilterableColumnDefinitionsSelector,
    GridFilterPanelProps
} from "@mui/x-data-grid-premium";
import Divider from '@mui/material/Divider'
import { GridFilterForm } from './CustomGridFilterForm';
import { useTranslation } from "react-i18next";

const CustomGridFilterPanel = React.forwardRef<HTMLDivElement, GridFilterPanelProps>(
    function GridFilterPanel(props, ref) {
        const { t } = useTranslation('translation', { keyPrefix: 'components.dataGrid' });
        const apiRef = useGridApiContext();
        const rootProps = useGridRootProps();
        const filterModel = useGridSelector(apiRef, gridFilterModelSelector);
        const filterableColumns = useGridSelector(apiRef, gridFilterableColumnDefinitionsSelector);
        const lastFilterRef = React.useRef<any>(null);

        const {
            linkOperators = [GridLinkOperator.And, GridLinkOperator.Or],
            columnsSort,
            filterFormProps,
            children,
            ...other
        } = props;

        const applyFilter = React.useCallback(
            (item: GridFilterItem) => {
                apiRef.current.upsertFilterItem(item);
            },
            [apiRef],
        );

        const applyFilterLinkOperator = React.useCallback(
            (operator: GridLinkOperator) => {
                apiRef.current.setFilterLinkOperator(operator);
            },
            [apiRef],
        );

        const getDefaultItem = React.useCallback((): GridFilterItem | null => {
            const firstColumnWithOperator = filterableColumns.find(
                (colDef) => colDef.filterOperators?.length,
            );

            if (!firstColumnWithOperator) {
                return null;
            }

            return {
                columnField: firstColumnWithOperator.field,
                operatorValue: firstColumnWithOperator.filterOperators![0].value,
                id: Math.round(Math.random() * 1e5),
            };
        }, [filterableColumns]);

        const items = React.useMemo<GridFilterItem[]>(() => {
            if (filterModel.items.length) {
                return filterModel.items;
            }

            const defaultItem = getDefaultItem();

            return defaultItem ? [defaultItem] : [];
        }, [filterModel.items, getDefaultItem]);

        const hasMultipleFilters = items.length > 1;

        const addNewFilter = () => {
            const defaultItem = getDefaultItem();
            if (!defaultItem) {
                return;
            }
            apiRef.current.upsertFilterItems([...items, defaultItem]);
        };

        const deleteFilter = React.useCallback(
            (item: GridFilterItem) => {
                const shouldCloseFilterPanel = items.length === 1;
                apiRef.current.deleteFilterItem(item);
                if (shouldCloseFilterPanel) {
                    apiRef.current.hideFilterPanel();
                }
            },
            [apiRef, items.length],
        );

        React.useEffect(() => {
            if (
                linkOperators.length > 0 &&
                filterModel.linkOperator &&
                !linkOperators.includes(filterModel.linkOperator)
            ) {
                applyFilterLinkOperator(linkOperators[0]);
            }
        }, [linkOperators, applyFilterLinkOperator, filterModel.linkOperator]);

        React.useEffect(() => {
            if (items.length > 0) {
                lastFilterRef.current!.focus();
            }
        }, [items.length]);

        return (
            <GridPanelWrapper ref={ref} {...other}>
                <FilterPanelHeaderText>{t('filters')}</FilterPanelHeaderText>
                <GridPanelContent sx={{ padding: '10px 10px' }}>
                    {items.map((item, index) => (
                        <GridFilterForm
                            key={item.id == null ? index : item.id}
                            item={item}
                            applyFilterChanges={applyFilter}
                            deleteFilter={deleteFilter}
                            hasMultipleFilters={hasMultipleFilters}
                            showMultiFilterOperators={index > 0}
                            multiFilterOperator={filterModel.linkOperator}
                            disableMultiFilterOperator={index !== 1}
                            applyMultiFilterOperatorChanges={applyFilterLinkOperator}
                            focusElementRef={index === items.length - 1 ? lastFilterRef : null}
                            linkOperators={linkOperators}
                            columnsSort={columnsSort}
                            {...filterFormProps}
                        />
                    ))}
                </GridPanelContent>
                <Divider />
                {!rootProps.disableMultipleColumnsFiltering && (
                    <GridPanelFooter sx={{ padding: 2, alignItems: 'center' }}>
                        <rootProps.components.BaseButton
                            onClick={addNewFilter}
                            startIcon={<GridAddIcon />}
                            variant='contained'
                            size="large"
                            {...rootProps.componentsProps?.baseButton}
                        >
                            {t('add_filter')}
                        </rootProps.components.BaseButton>
                        <ClearAllButton
                            onClick={() => apiRef.current.upsertFilterItems([])}
                        >
                            {t('filter_clear_all')}
                        </ClearAllButton>
                    </GridPanelFooter>
                )}
            </GridPanelWrapper>
        );
    },
);

export { CustomGridFilterPanel };

const ClearAllButton = styled.span`
    font-size: 12px;
    color: #FF9933;
    text-decoration: underline;
    cursor: pointer;
`;

const FilterPanelHeaderText = styled.span`
    color: #172B37;
    font-size: 16px;
    font-weight: 500;
    margin: 20px 18px 0 18px;
`;
