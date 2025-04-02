import React, { useEffect, useState, Fragment, Dispatch } from 'react';
import { useToasts } from 'react-toast-notifications';
import { useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import { GridColumns, GridSlotsComponent, MuiEvent } from '@mui/x-data-grid-premium';
import { GridInitialStatePremium } from '@mui/x-data-grid-premium/models/gridStatePremium';

import { ReactComponent as WarningMark } from 'assets/svg/warning-mark_circles.svg';

import useQueryCustom from 'hooks/useQueryCustom';
import useMutationCustom from 'hooks/useMutationCustom';
import Text from 'components/Text';
import DataGrid from 'components/DataLists/DataGrid';
import DialogModal from 'components/Modal/Dialog';
import { DeleteModalState } from './Dictionary';

interface TemplateProps {
  disableColumnSelector?: boolean;
  columns: GridColumns;
  components?: Partial<GridSlotsComponent>;
  data?: Array<Record<string, any>>;
  deleteModalState: DeleteModalState;
  setDeleteModalState: Dispatch<React.SetStateAction<DeleteModalState>>;
  endpoint: string;
  initialState: GridInitialStatePremium;
  onAdd?: () => void;
  onEdit: ({ id, name }: { id: number; name: string }) => void;
  refreshData: () => void;
  singularTitle: string;
  title: string;
  withChecking?: boolean;
}

export const Template = ({
  disableColumnSelector,
  columns,
  components,
  data,
  deleteModalState,
  setDeleteModalState,
  endpoint,
  initialState,
  onAdd,
  onEdit,
  refreshData,
  singularTitle,
  title,
  withChecking,
}: TemplateProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [countFilteredRows, setCountFilteredRows] = useState(0);
  const { addToast } = useToasts();

  const deleteDictionaryOption = useMutationCustom<{}, { errors: string[] }>(
    ['delete_benefit'],
    {
      endpoint: endpoint + `/${deleteModalState?.id}`,
      options: { method: 'delete' },
    },
    {
      onSuccess: () => {
        setDeleteModalState(null);
        addToast(`${t('globaly.delete_success', { title: singularTitle })}`, {
          appearance: 'success',
          autoDismiss: true,
        });
        refreshData();
      },
    }
  );

  const { data: checkUsageData, refetch: refetchCheckUsage } = useQueryCustom<
    { usage: number },
    { errors: string[] }
  >(
    ['check_usage'],
    {
      endpoint: endpoint + `/check_usage/${deleteModalState?.id}`,
      options: { method: 'get' },
    },
    { cacheTime: 0, enabled: false }
  );

  useEffect(() => {
    if (deleteModalState && withChecking) {
      refetchCheckUsage();
    } else {
      queryClient.invalidateQueries('check_usage');
    }
  }, [deleteModalState]);

  return (
    <Fragment>
      <div style={{ display: 'flex', alignContent: 'center' }}>
        <div
          style={{
            width: 3,
            height: 25,
            backgroundColor: '#339966',
            float: 'left',
            marginRight: 15,
          }}
        />
        <Text type="title">
          {title} <span style={{ opacity: 0.6 }}>&nbsp;({countFilteredRows})</span>
        </Text>
      </div>
      <div
        style={{
          overflow: 'auto',
          marginTop: 20,
          flex: 1,
          backgroundColor: '#fff',
          padding: '18px 15px',
          borderRadius: 6,
        }}
      >
        <div style={{ display: 'flex', height: '100%' }}>
          {data && (
            <DataGrid
              disableColumnSelector={disableColumnSelector}
              name={`dictionary_${endpoint.replace('/', '')}`}
              saveGridState
              onRowDoubleClick={(params, event: MuiEvent<React.MouseEvent>) => {
                event.defaultMuiPrevented = true;
                onEdit({ id: params.row.id, name: params.row.name });
              }}
              components={components}
              onStateChange={(e) => setCountFilteredRows(e.pagination.rowCount)}
              rows={data}
              columns={columns}
              initialState={initialState}
              onAdd={onAdd}
            />
          )}
        </div>
      </div>

      {!!deleteModalState && (
        <DialogModal
          open={!!deleteModalState}
          title={`${t('dictionaries.delete')} ${singularTitle}`}
          onClose={() => setDeleteModalState(null)}
          actionButton={() => {
            checkUsageData && checkUsageData.usage > 0
              ? setDeleteModalState(null)
              : deleteDictionaryOption.mutate();
          }}
          withButtons
          cancelButtonText={t('globaly.cancel')}
          actionButtonText={
            checkUsageData && checkUsageData.usage > 0
              ? t('globaly.fix_it')
              : t('globaly.yes_delete')
          }
          actionLoading={deleteDictionaryOption.isLoading}
          upperPosition
          fullWidth
        >
          <Fragment>
            {((checkUsageData && checkUsageData.usage === 0) || !withChecking) && (
              <div>
                <div
                  style={{
                    paddingTop: 20,
                    paddingBottom: 26,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <WarningMark />
                </div>
                <div
                  style={{
                    paddingBottom: 30,
                    display: 'flex',
                    justifyContent: 'center',
                    paddingInline: '12%',
                    textAlign: 'center',
                  }}
                >
                  <Text type="medium">
                    {t('globaly.want_to_delete', {
                      resource: `${singularTitle} "${deleteModalState?.name}"`,
                    })}
                  </Text>
                </div>
              </div>
            )}

            {checkUsageData && checkUsageData.usage > 0 && (
              <div>
                <div
                  style={{
                    paddingTop: 40,
                    paddingBottom: 26,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <WarningMark />
                </div>
                <div
                  style={{
                    paddingBottom: 20,
                    display: 'flex',
                    justifyContent: 'center',
                    paddingInline: '12%',
                    textAlign: 'center',
                  }}
                >
                  <Text type="medium">
                    {t('settings.cant_delete_yet')}
                    <br />
                    {endpoint !== '/benefit'
                      ? t('settings.youve_got', {
                          usage: checkUsageData.usage,
                          title: singularTitle,
                        })
                      : t('settings.benefit.youve_got', { count: checkUsageData.usage })}
                  </Text>
                </div>
                <div
                  style={{
                    paddingBottom: 40,
                    display: 'flex',
                    justifyContent: 'center',
                    paddingInline: '12%',
                    textAlign: 'center',
                  }}
                >
                  <Text type="medium">
                    {endpoint !== '/benefit'
                      ? t('settings.move_them_to_another', {
                          title: singularTitle,
                        })
                      : t('settings.benefit.change_value')}
                  </Text>
                </div>
              </div>
            )}
          </Fragment>
        </DialogModal>
      )}
    </Fragment>
  );
};
