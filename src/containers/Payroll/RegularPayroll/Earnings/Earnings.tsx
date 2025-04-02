import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GridColDef } from '@mui/x-data-grid-premium';
import { GridInitialStatePremium } from '@mui/x-data-grid-premium/models/gridStatePremium';
import { useParams } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { sortBy } from 'lodash';

import useQueryCustom from 'hooks/useQueryCustom';
import {
  PaymentDocumentEarning,
  PaymentDocumentType,
  PaymentEarning,
  PaymentTypeClass,
} from 'types';
import { currencyFormatter } from 'utils/number';
import { updatePaymentDocumentAdditional, updatePaymentDocumentPayType } from 'services';
import { PaymentTypeComparator } from './PaymentTypeComparator';
import { useError } from 'hooks/useError';
import { getMutationErrorPayload } from 'utils/response';
import {
  EditableCell,
  EditCell,
  HeaderProps,
  PayRateCell,
  Table,
} from 'containers/Payroll/components/Table';
import { useInfo } from '../useInfo';
import { footerRowId } from 'containers/Payroll/components/Table/consts';

const getField = ({ name, id }: { name: string; id: number }) => `${name.toLowerCase()}_${id}`;

export const Earnings = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { onError } = useError();
  const { documentStatus, info } = useInfo({ documentId: id, tableId: 'earnings' });

  const { data, isLoading } = useQueryCustom<PaymentDocumentEarning, { errors: string[] }>(
    ['payment_document_earnings', id],
    {
      endpoint: `/payment_document/${id}?page=earnings`,
      options: {
        method: 'get',
      },
    },
    {
      refetchOnWindowFocus: false,
      cacheTime: 0,
    }
  );

  const summary = useMemo(() => {
    const result: HeaderProps['summary'] = [
      {
        value: t('globaly.hours_count', { count: data?.total_working_hours || 0 }),
        title: t('payroll.payment_document.steps.earnings.total_working_hours'),
      },
      {
        value: t('globaly.hours_count', { count: data?.total_paid_time_off_hours || 0 }),
        title: t('payroll.payment_document.steps.earnings.total_paid_time_off_hours'),
      },
      {
        value: currencyFormatter({ amount: data?.total_net, currency: data?.currency }),
        title: t('payroll.payment_document.total_net'),
      },
    ];
    return result;
  }, [data, t]);

  const columns = useMemo(() => {
    const result: GridColDef[] = [
      {
        field: 'pay_rate',
        headerName: t('payroll.payment_document.pay_rate'),
        headerAlign: 'center',
        cellClassName: 'gray',
        getApplyQuickFilterFn: () => null,
        renderCell: ({ id, value }) => id !== footerRowId && <PayRateCell value={value} />,
        flex: 1,
      },
      ...(PaymentTypeComparator(data?.columns.payment_types).map((type) => {
        const isEditable = type.payment_type_class === PaymentTypeClass.PERFORMANCE;
        const result: GridColDef = {
          field: getField(type),
          headerName: type.name,
          headerAlign: 'center',
          editable: isEditable,
          cellClassName: ({ row }) => {
            const payType = (row.pay_types as PaymentEarning['pay_types'])?.find(
              (payType) => payType.payment_type_id === type.id
            );
            return payType?.changeable ? '' : 'inactive';
          },
          valueGetter: ({ row }) => {
            const payType = (row.pay_types as PaymentEarning['pay_types'])?.find(
              (payType) => payType.payment_type_id === type.id
            );
            const amount = Number(payType?.amount || 0);
            return payType?.changeable || isEditable
              ? amount
              : amount
              ? { ...payType, monthHours: row.earning.month_hours }
              : undefined;
          },
          renderCell: (params) => {
            const { value, row, id } = params;
            const payType = (row.pay_types as PaymentEarning['pay_types'])?.find(
              (payType) => payType.payment_type_id === type.id
            );
            return isEditable ? (
              <EditableCell
                currency={data?.currency}
                changeable={!!payType?.changeable}
                params={params}
              />
            ) : (
              <PayRateCell
                currency={data?.currency}
                monthHours={
                  type.payment_type_class !== PaymentTypeClass.SALARY
                    ? undefined
                    : footerRowId === id
                    ? value?.monthHours
                    : row.earning?.month_hours
                }
                value={value}
              />
            );
          },
          renderEditCell: (params) => {
            const payType = (params.row.pay_types as PaymentEarning['pay_types'])?.find(
              (payType) => payType.payment_type_id === type.id
            );
            return (
              payType && (
                <EditCell
                  onEditStop={(value) => {
                    setLoading(true);
                    updatePaymentDocumentPayType({
                      id: payType.id,
                      amount: value,
                    })
                      .then(({ data }) => {
                        queryClient.setQueryData(
                          ['payment_document_earnings', id],
                          (oldData: Partial<PaymentDocumentEarning> | undefined) => {
                            const list = oldData!.list!.map((item) => {
                              if (item.id !== params.id) return item;
                              const payTypes = item.pay_types.map((payType) => {
                                if (payType.payment_type_id !== type.id) return payType;
                                return {
                                  ...payType,
                                  amount: value.toString(),
                                };
                              });
                              const result: PaymentEarning = {
                                ...item,
                                earning: {
                                  ...item.earning,
                                  total_net: data.total_net_row,
                                },
                                pay_types: payTypes,
                              };
                              return result;
                            });
                            return {
                              ...oldData,
                              list,
                              total_net: data.total_net_document,
                            };
                          }
                        );
                      })
                      .catch((err) => onError(getMutationErrorPayload(err)))
                      .finally(() => setLoading(false));
                  }}
                  {...params}
                />
              )
            );
          },
          flex: 1,
        };
        return result;
      }) || []),
      ...(sortBy(data?.columns.time_off_types, ['name']).map((timeOff) => {
        const result: GridColDef = {
          field: getField(timeOff),
          headerName: timeOff.name,
          headerAlign: 'center',
          valueGetter: ({ row }) => {
            const currentTimeOff = (row.time_offs as PaymentEarning['time_offs'])?.find(
              (element) => element.name === timeOff.name
            );
            return Number(currentTimeOff?.amount) ? currentTimeOff : undefined;
          },
          renderCell: ({ value }) => {
            return <PayRateCell currency={data?.currency} value={value} />;
          },
          flex: 1,
        };
        return result;
      }) || []),
      ...(sortBy(data?.columns.additional_earnings, ['name']).map((additionalEarning) => {
        const result: GridColDef = {
          field: getField(additionalEarning),
          headerName: additionalEarning.name,
          headerAlign: 'center',
          editable: true,
          renderCell: (params) => <EditableCell currency={data?.currency} params={params} />,
          valueGetter: ({ row }) => {
            const additional = (row.additional as PaymentEarning['additional'])?.find(
              (additional) => additional.name === additionalEarning.name
            );
            return Number(additional?.amount || 0);
          },
          renderEditCell: (params) => (
            <EditCell
              onEditStop={(value) => {
                setLoading(true);
                updatePaymentDocumentAdditional({
                  additional_earning_id: additionalEarning.id,
                  payment_earning_id: params.id as number,
                  amount: value || null,
                })
                  .then(({ data }) => {
                    queryClient.setQueryData(
                      ['payment_document_earnings', id],
                      (oldData: Partial<PaymentDocumentEarning> | undefined) => {
                        const list = oldData!.list!.map((item) => {
                          if (item.id !== params.id) return item;
                          const additionals = item.additional.filter(
                            (additional) =>
                              additional.additional_earning_id !== additionalEarning.id
                          );
                          const result: PaymentEarning = {
                            ...item,
                            earning: {
                              ...item.earning,
                              total_net: data.total_net_row,
                            },
                            additional: [
                              ...additionals,
                              {
                                id: data.id,
                                name: additionalEarning.name,
                                amount: value.toString(),
                                additional_earning_id: additionalEarning.id,
                              },
                            ],
                          };
                          return result;
                        });
                        return {
                          ...oldData,
                          list,
                          total_net: data.total_net_document,
                        };
                      }
                    );
                  })
                  .catch((err) => onError(getMutationErrorPayload(err)))
                  .finally(() => setLoading(false));
              }}
              {...params}
            />
          ),
          flex: 1,
        };
        return result;
      }) || []),
      {
        field: 'total_net',
        cellClassName: 'green',
        type: 'number',
        headerName: t('payroll.payment_document.total_net'),
        headerAlign: 'center',
        headerClassName: 'headerGreen',
        valueFormatter: ({ value }) =>
          !value ? '-' : currencyFormatter({ currency: data?.currency, amount: value }),
        valueGetter: ({ row }) => Number(row.earning.total_net),
        flex: 1,
      },
    ];
    return result;
  }, [data, id, onError, queryClient, t]);

  const initialState = useMemo(() => {
    const result: GridInitialStatePremium = {
      aggregation: {
        model: {
          total_net: 'sum',
          ...data?.columns.payment_types.reduce(
            (accumulator, currentValue) => ({
              ...accumulator,
              [getField(currentValue)]:
                currentValue.payment_type_class === PaymentTypeClass.PERFORMANCE
                  ? 'sum'
                  : 'totalSum',
            }),
            {}
          ),
          ...data?.columns.time_off_types.reduce(
            (accumulator, currentValue) => ({
              ...accumulator,
              [getField(currentValue)]: 'totalSum',
            }),
            {}
          ),
          ...data?.columns.additional_earnings.reduce(
            (accumulator, currentValue) => ({
              ...accumulator,
              [getField(currentValue)]: 'sum',
            }),
            {}
          ),
        },
      },
      pinnedColumns: {
        right: ['total_net'],
      },
    };
    return result;
  }, [data]);

  return (
    <Table
      data={data?.list}
      dataLoading={isLoading}
      loading={loading}
      initialColumns={columns}
      initialState={initialState}
      summary={summary}
      info={info}
      documentStatus={documentStatus}
      documentType={PaymentDocumentType.REGULAR_PAYROLL}
    />
  );
};
