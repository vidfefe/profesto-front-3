import React from 'react';
import { useTranslation } from 'react-i18next';
import { useToasts } from 'react-toast-notifications';

import { ReactComponent as WarningMark } from 'assets/svg/warning-mark_circles.svg';

import DialogModal from 'components/Modal/Dialog';
import useMutationCustom from 'hooks/useMutationCustom';
import Text from 'components/Text';
import useQueryCustom from 'hooks/useQueryCustom';

interface DeleteModalProps {
  onModalClose: () => void;
  name?: string;
  recordId: number;
  title: string;
  endpoint: string;
  refreshData: () => void;
  resource: string;
  withChecking?: boolean;
}

export const DeleteModal = ({
  onModalClose,
  name,
  recordId,
  title,
  endpoint,
  refreshData,
  resource,
  withChecking,
}: DeleteModalProps) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();

  const deleteOption = useMutationCustom<{}, { errors: string[] }>(
    ['delete_option'],
    {
      endpoint: `${endpoint}/${recordId}`,
      options: { method: 'delete' },
    },
    {
      onSuccess: () => {
        onModalClose();
        addToast(`${t('globaly.delete_success', { title: resource })}`, {
          appearance: 'success',
          autoDismiss: true,
        });
        refreshData();
      },
    }
  );

  const { data: checkUsageData } = useQueryCustom<{ usage: number }, { errors: string[] }>(
    ['check_usage'],
    {
      endpoint: endpoint + `/check_usage/${recordId}`,
      options: { method: 'get' },
    },
    { cacheTime: 0, enabled: !!withChecking }
  );

  return (
    <DialogModal
      open={true}
      onClose={onModalClose}
      title={title}
      cancelButtonText={t('globaly.cancel')}
      actionButtonText={checkUsageData?.usage ? t('globaly.fix_it') : t('globaly.yes_delete')}
      actionButton={() => {
        checkUsageData?.usage ? onModalClose() : deleteOption.mutate();
      }}
      actionLoading={deleteOption.isLoading}
      fullWidth
      upperPosition
      withButtons
    >
      <div>
        {checkUsageData?.usage ? (
          <>
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
                {t('benefits.modal.youve_got', { count: checkUsageData.usage })}
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
              <Text type="medium">{t('benefits.modal.change_value')}</Text>
            </div>
          </>
        ) : (
          <>
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
                paddingInline: '10%',
                textAlign: 'center',
              }}
            >
              <Text type="medium">
                {endpoint === '/employee_dependent'
                  ? t('globaly.want_to_delete', { resource: name })
                  : t('globaly.you_want', { action: title })}
              </Text>
            </div>
          </>
        )}
      </div>
    </DialogModal>
  );
};
