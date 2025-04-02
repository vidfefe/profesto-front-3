export function dataGridLocale(t: any, i18n: any) {
    //const list = i18n?.store?.data?.[i18n.language]?.translation?.muiGrid;

    const lacalText = {
        toolbarColumns: t('toolbarColumns'),
        toolbarFilters: t('toolbarFilters'),
        toolbarExport: t('toolbarExport'),
        filterOperatorContains: t('filterOperatorContains'),
        filterOperatorEquals: t('filterOperatorEquals'),
        filterOperatorStartsWith: t('filterOperatorStartsWith'),
        filterOperatorEndsWith: t('filterOperatorEndsWith'),
        filterOperatorIs: t('filterOperatorIs'),
        filterOperatorNot: t('filterOperatorNot'),
        filterOperatorAfter: t('filterOperatorAfter'),
        filterOperatorOnOrAfter:  t('filterOperatorOnOrAfter'),
        filterOperatorBefore: t('filterOperatorBefore'),
        filterOperatorOnOrBefore:  t('filterOperatorOnOrBefore'),
        filterOperatorIsEmpty: t('filterOperatorIsEmpty'),
        filterOperatorIsNotEmpty:  t('filterOperatorIsNotEmpty'),
        filterOperatorIsAnyOf:  t('filterOperatorIsAnyOf'),
        filterValueAny: t('filterValueAny'),
        filterValueTrue: t('filterValueTrue'),
        filterValueFalse: t('filterValueFalse'),
        columnsPanelTextFieldPlaceholder: t('columnsPanelTextFieldPlaceholder'),
        filterPanelInputPlaceholder: t('filterPanelInputPlaceholder'),
        toolbarQuickFilterPlaceholder: t('toolbarQuickFilterPlaceholder'),
        toolbarQuickFilterLabel: t('toolbarQuickFilterLabel'),
        toolbarQuickFilterDeleteIconLabel: t('toolbarQuickFilterDeleteIconLabel'),
        columnMenuLabel: t('columnMenuLabel'),
        columnMenuShowColumns: t('columnMenuShowColumns'),
        columnMenuManageColumns: t('columnMenuManageColumns'),
        columnMenuFilter: t('columnMenuFilter'),
        columnMenuHideColumn: t('columnMenuHideColumn'),
        columnMenuUnsort: t('columnMenuUnsort'),
        columnMenuSortAsc: t('columnMenuSortAsc'),
        columnMenuSortDesc: t('columnMenuSortDesc'),
        pinToLeft: t('pinToLeft'),
        pinToRight: t('pinToRight'),
        unpin: t('unpin'),
        groupColumn: (name: any) => t('groupBy', {name: name}),
    }

    return lacalText;
}