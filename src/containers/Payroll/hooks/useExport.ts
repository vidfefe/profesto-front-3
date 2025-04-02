import { useCallback, useMemo } from 'react';
import { GridExceljsProcessInput, useGridApiContext } from '@mui/x-data-grid-premium';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { sortBy } from 'lodash';

import {
  ExportPaymentDocumentData,
  ExportPaymentDocumentPayload,
  PaymentDocumentType,
  TupleUnion,
} from 'types';
import useMutationCustom from 'hooks/useMutationCustom';
import { useError } from 'hooks/useError';

type UseExportProps = {
  id: number | string;
  documentType: PaymentDocumentType;
};

const columnKeys: TupleUnion<keyof ExportPaymentDocumentData> = [
  'bank_account',
  'employee',
  'personal_number',
  'amount',
];

export const useExport = ({ id, documentType }: UseExportProps) => {
  const { t } = useTranslation('translation', { keyPrefix: 'payroll.export' });

  const apiRef = useGridApiContext();

  const { onError } = useError();

  const endpoint = useMemo(() => {
    switch (documentType) {
      case PaymentDocumentType.REGULAR_PAYROLL:
        return `/payment_document/${id}/export`;
      case PaymentDocumentType.ADVANCE_PAYMENT:
        return `/advance_payment_document/${id}/export`;
      default:
        return '';
    }
  }, [documentType, id]);

  const { mutate: exportDocument } = useMutationCustom<ExportPaymentDocumentPayload>(
    ['export_payment_document'],
    {
      endpoint,
      options: { method: 'get' },
    },
    {
      onSuccess: (data) => apiRef.current.exportDataAsExcel(onExport(data)),
      onError,
    }
  );

  const getConfig = useCallback(
    (data: ExportPaymentDocumentPayload) => {
      return {
        exceljsPreProcess: ({ workbook, worksheet }: GridExceljsProcessInput): any => {
          workbook.creator = 'Profesto';
          workbook.created = new Date();
          worksheet.properties.defaultRowHeight = 30;

          worksheet.columns = columnKeys.map((key) => ({
            header: t(`columns.${key}`),
            key,
            width: 20,
          }));

          worksheet.addRows(
            sortBy(data, ['employee']).map((record) => ({
              ...record,
              amount: Number(record.amount),
            }))
          );
        },
        exceljsPostProcess: ({ worksheet }: GridExceljsProcessInput): any => {
          worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'cccccc' },
          };
          worksheet.getRow(1).font = {
            size: 12,
            bold: true,
          };
          worksheet.getRow(1).alignment = {
            vertical: 'middle',
            horizontal: 'center',
          };
          worksheet.getColumn('amount').numFmt = '0.00';
        },
      };
    },
    [t]
  );

  const onExport = useCallback(
    (data: ExportPaymentDocumentPayload) => ({
      ...getConfig(data),
      getRowsToExport: () => [],
      includeHeaders: false,
      fileName: `${format(new Date(), "yyyy-MM-dd'T'HH:mm")} - Profesto - ${t('file_name')}`,
    }),
    [getConfig, t]
  );

  return {
    exportDocument,
  };
};
