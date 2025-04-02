import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import useQueryCustom from 'hooks/useQueryCustom';
import { getPeriod, toFormattedDate } from 'utils/date';
import { HeaderProps } from '../components/Table';
import { PaymentDocument } from 'types';

type UseInfoProps = {
  documentId: string | number;
  tableId: 'earnings' | 'benefits_deductions' | 'review_submit';
};

export const useInfo = ({ documentId, tableId }: UseInfoProps) => {
  const { t } = useTranslation();

  const { data } = useQueryCustom<PaymentDocument, { errors: string[] }>(
    ['payment_document', documentId],
    {
      endpoint: `/payment_document/${documentId}`,
      options: {
        method: 'get',
      },
    },
    {
      enabled: false,
      refetchOnWindowFocus: false,
    }
  );

  const info = useMemo(() => {
    const result: HeaderProps['info'] = !data
      ? []
      : [
          {
            className: 'title',
            style: { textTransform: 'uppercase' },
            value: `${t('payroll.export.file_name')}: ${getPeriod(
              data.period_start,
              data.period_end
            )}`,
          },
          {
            value: `${t('payroll.pay_date')}: ${toFormattedDate(data.payment_date, 'd MMM, yyyy')}`,
          },
          !data.currency_rates.length
            ? {}
            : {
                value: `${t('payroll.payment_document.exchange_rate')}: ${data.currency_rates
                  .map((rate) => `${rate.code} - ${Number(rate.rate).toFixed(2)}`)
                  .join('; ')}`,
              },
          {
            className: 'title',
            value: t(`payroll.payment_document.notes.${tableId}`),
          },
        ];
    return result;
  }, [data, t, tableId]);

  return {
    documentStatus: data?.payment_document_status.id,
    info,
  };
};
