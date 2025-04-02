import { aggregationRowHeight } from "./consts";

export const getTableStyle = (loading: boolean) => ({
  '.MuiDataGrid-toolbarContainer': {
    marginBottom: '10px !important',
  },
  '.MuiDataGrid-columnHeaders': {
    background: 'var(--gray)',
    borderBottom: '1px solid rgba(224, 224, 224, 1) !important',
    zIndex: 10,
  },
  '.MuiDataGrid-pinnedColumnHeaders': {
    background: 'var(--gray)',
  },
  '.MuiDataGrid-aggregationColumnHeaderLabel': {
    display: 'none',
  },
  '.MuiDataGrid-cell': {
    fontFamily: "'Aspira Demi', 'FiraGO Regular'",
    borderBottom: '1px solid rgba(224, 224, 224, 1) !important',
    justifyContent: 'end',
  },
  '.MuiLinearProgress-root': {
    zIndex: 10,
  },
  '.MuiDataGrid-columnSeparator--sideLeft': {
    left: '-5px',
  },
  '.MuiDataGrid-pinnedRows--bottom': {
    height: `${aggregationRowHeight}px !important`,
  },
  '.MuiDataGrid-virtualScrollerContent': {
    minHeight: `calc(100% - ${aggregationRowHeight}px) !important`,
  },
  '[data-id="auto-generated-group-footer-root"]': {
    minHeight: `${aggregationRowHeight}px !important`,
    maxHeight: `${aggregationRowHeight}px !important`,
    background: 'rgb(51, 153, 102, 0.22) !important',
    '> div': {
      minHeight: `${aggregationRowHeight}px !important`,
      maxHeight: `${aggregationRowHeight}px !important`,
    },
    ':hover': {
      background: 'rgb(51, 153, 102, 0.22) !important',
    },
    '.gray': {
      background: 'unset !important',
    },
    '.green': {
      background: 'var(--meddium-green)',
    },
    '.orange': {
      background: 'var(--meddium-orange)',
    },
    '.employee': {
      fontFamily: "'Aspira Demi', 'FiraGO Regular'",
    },
  },
  '.employee': {
    justifyContent: 'start',
    fontFamily: 'unset',
  },
  '.green': {
    background: 'rgb(51, 153, 102, 0.12)',
  },
  '.gray': {
    background: 'var(--gray)',
  },
  '.orange': {
    background: 'rgb(255, 153, 51, 0.12)',
  },
  '.headerGreen': {
    background: 'var(--meddium-green)',
  },
  '.headerOrange': {
    background: 'var(--meddium-orange)',
  },
  '.inactive': {
    pointerEvents: 'none',
  },
  pointerEvents: loading ? 'none' : 'unset',
});
