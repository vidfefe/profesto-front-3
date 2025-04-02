import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GridColDef } from '@mui/x-data-grid-premium';
import { GridInitialStatePremium } from '@mui/x-data-grid-premium/models/gridStatePremium';
import { useParams } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { sortBy } from 'lodash';
import styled from 'styled-components';

import useQueryCustom from 'hooks/useQueryCustom';
import { ErrorPayload, PaymentBenefit, PaymentDocumentBenefit, PaymentDocumentType } from 'types';
import { currencyFormatter } from 'utils/number';
import { updateAdvanceDeduction, updatePaymentDocumentDeduction } from 'services';
import { useError } from 'hooks/useError';
import { getMutationErrorPayload } from 'utils/response';
import {
  ColumnHeader,
  EditableCell,
  EditCell,
  HeaderProps,
  PayRateCell,
  Table,
} from 'containers/Payroll/components/Table';
import { useInfo } from '../useInfo';
import { WarningModal } from 'containers/Payroll/components/WarningModal';

const getField = ({ name, id }: { name: string; id: number }) => `${name.toLowerCase()}_${id}`;

export const Benefits = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const { onError } = useError();
  const { documentStatus, info } = useInfo({ documentId: id, tableId: 'benefits_deductions' });

  const { data, isLoading } = useQueryCustom<PaymentDocumentBenefit, { errors: string[] }>(
    ['payment_document_benefits', id],
    {
      endpoint: `/payment_document/${id}?page=benefits_and_deductions`,
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
        value: currencyFormatter({ amount: data?.benefits, currency: data?.currency }),
        style: {
          color: Number(data?.benefits) < 0 ? 'var(--red)' : undefined,
        },
        title: t('payroll.payment_document.benefits'),
      },
      {
        value: currencyFormatter({ amount: data?.deductions, currency: data?.currency }),
        style: {
          color: Number(data?.deductions) < 0 ? 'var(--red)' : undefined,
        },
        title: t('payroll.payment_document.deductions'),
      },
      {
        value: currencyFormatter({ amount: data?.take_to_home, currency: data?.currency }),
        title: t('payroll.payment_document.take_to_home'),
      },
    ];
    return result;
  }, [data, t]);

  const columns = useMemo(() => {
    const result: GridColDef[] = [
      {
        field: 'total_net_amount',
        type: 'number',
        headerName: t('payroll.payment_document.total_net'),
        headerAlign: 'center',
        valueFormatter: ({ value }) =>
          !Number(value) ? '-' : currencyFormatter({ currency: data?.currency, amount: value }),
        flex: 1,
      },
      ...(sortBy(data?.columns.benefits, ['name'])
        .map((benefit) => {
          const result: GridColDef[] = [
            {
              field: `${benefit.name.toLowerCase()}_company`,
              renderHeader: () => (
                <ColumnHeader
                  title={benefit.name}
                  subtitle={t('payroll.previous_cost.company_pays')}
                />
              ),
              headerAlign: 'center',
              valueGetter: ({ row }) => {
                const currentBenefit = (row.benefits as PaymentBenefit['benefits'])?.find(
                  (element) => element.name === benefit.name
                );
                return Number(currentBenefit?.company_pays);
              },
              renderCell: ({ value }) => {
                const isNegative = value < 0;
                return (
                  <span style={{ color: isNegative ? 'var(--red)' : undefined }}>
                    {!value ? '-' : currencyFormatter({ currency: data?.currency, amount: value })}
                  </span>
                );
              },
              flex: 1,
            },
            {
              field: `${benefit.name.toLowerCase()}_total`,
              renderHeader: () => (
                <ColumnHeader title={benefit.name} subtitle={t('settings.benefit.total_cost')} />
              ),
              headerAlign: 'center',
              valueGetter: ({ row }) => {
                const currentBenefit = (row.benefits as PaymentBenefit['benefits'])?.find(
                  (element) => element.name === benefit.name
                );
                return Number(currentBenefit?.total_cost);
              },
              renderCell: ({ value }) => {
                const isNegative = value < 0;
                return (
                  <span style={{ color: isNegative ? 'var(--red)' : undefined }}>
                    {!value ? '-' : currencyFormatter({ currency: data?.currency, amount: value })}
                  </span>
                );
              },
              flex: 1,
            },
          ];
          return result;
        })
        .flat() || []),
      ...(sortBy(data?.columns.deductions, ['name']).map((deduction) => {
        const result: GridColDef = {
          field: getField(deduction),
          headerName: deduction.name,
          headerAlign: 'center',
          editable: true,
          renderCell: (params) => <EditableCell currency={data?.currency} params={params} />,
          valueGetter: ({ row }) => {
            const currentDeduction = (row.deductions as PaymentBenefit['deductions'])?.find(
              (el) => el.deduction_id === deduction.id
            );
            return Number(currentDeduction?.amount || 0);
          },
          renderEditCell: (params) => (
            <EditCell
              onlyNegative
              onEditStop={(value) => {
                setLoading(true);
                updatePaymentDocumentDeduction({
                  payment_employment_compensation_id: params.id as number,
                  deduction_id: deduction.id,
                  amount: value || null,
                })
                  .then(({ data }) => {
                    queryClient.setQueryData(
                      ['payment_document_benefits', id],
                      (oldData: Partial<PaymentDocumentBenefit> | undefined) => {
                        const list = oldData!.list!.map((item) => {
                          if (item.id !== params.id) return item;
                          const deductions = item.deductions.filter(
                            (item) => item.deduction_id !== deduction.id
                          );
                          const result: PaymentBenefit = {
                            ...item,
                            take_to_home: data.take_to_home_row,
                            deductions: [
                              ...deductions,
                              {
                                id: data.id,
                                deduction_id: deduction.id,
                                amount: value.toString(),
                              },
                            ],
                          };
                          return result;
                        });
                        return {
                          ...oldData,
                          list,
                          deductions: data.deductions_document,
                          take_to_home: data.take_to_home_document,
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
        field: 'take_to_home',
        cellClassName: 'green',
        type: 'number',
        headerName: t('payroll.payment_document.take_to_home'),
        headerAlign: 'center',
        headerClassName: 'headerGreen',
        valueFormatter: ({ value }) =>
          !Number(value) ? '-' : currencyFormatter({ currency: data?.currency, amount: value }),
        flex: 1,
      },
    ];
    if (data?.columns.advance_payment) {
      result.splice(result.length - 1, 0, {
        field: 'advance_payment_deduction',
        headerName: t('payroll.payment_document.advance_deduction'),
        headerAlign: 'center',
        editable: true,
        cellClassName: (params) => (!params.value ? 'inactive' : ''),
        renderCell: (params) => {
          return params.value ? (
            <AdvancePayment>
              <EditableCell
                currency={data?.currency}
                params={{ ...params, value: -params.value?.deduction_amount }}
              />
              /
              <PayRateCell
                value={{
                  amount: params.value?.left,
                  period: t('payroll.payment_document.remains'),
                }}
                currency={data?.currency}
                showZero
              />
            </AdvancePayment>
          ) : null;
        },
        renderEditCell: (params) => (
          <AdvancePayment style={{ paddingRight: 10 }}>
            <EditCell
              allowNegative={false}
              onEditStop={(value) => {
                setLoading(true);
                updateAdvanceDeduction({
                  payment_document_id: Number(id),
                  employee_id: params.row?.employee?.id,
                  amount: value,
                })
                  .then(({ data }) => {
                    queryClient.setQueryData(
                      ['payment_document_benefits', id],
                      (oldData: Partial<PaymentDocumentBenefit> | undefined) => {
                        const list = oldData!.list!.map((item) => {
                          if (item.id !== params.id) return item;
                          const result: PaymentBenefit = {
                            ...item,
                            take_to_home: data.take_to_home_row,
                            advance_payment_deduction: {
                              left: data.left,
                              deduction_amount: data.deduction_amount,
                            },
                          };
                          return result;
                        });
                        return {
                          ...oldData,
                          list,
                          deductions: data.deductions_document,
                          take_to_home: data.take_to_home_document,
                        };
                      }
                    );
                  })
                  .catch((err) => {
                    const error = getMutationErrorPayload(err);
                    if ('field' in (error as ErrorPayload).errors[0]) {
                      setError(true);
                      queryClient.invalidateQueries(['payment_document_benefits', id]);
                    } else {
                      onError(getMutationErrorPayload(err));
                    }
                  })
                  .finally(() => setLoading(false));
              }}
              value={params.value?.deduction_amount}
              custom
            />
            /
            <PayRateCell
              value={{
                amount: params.value?.left,
                period: t('payroll.payment_document.remains'),
              }}
              currency={data?.currency}
              showZero
            />
          </AdvancePayment>
        ),
        valueGetter: ({ value }) => {
          return value
            ? {
                left: Number(value?.left || 0),
                deduction_amount: Number(value?.deduction_amount || 0),
              }
            : null;
        },
        flex: 2,
      });
    }
    return result;
  }, [t, data, queryClient, id, onError]);

  const initialState = useMemo(() => {
    const result: GridInitialStatePremium = {
      aggregation: {
        model: {
          total_net_amount: 'sum',
          ...data?.columns.benefits.reduce(
            (accumulator, currentValue) => ({
              ...accumulator,
              [`${currentValue.name.toLowerCase()}_company`]: 'sum',
              [`${currentValue.name.toLowerCase()}_total`]: 'sum',
            }),
            {}
          ),
          ...data?.columns.deductions.reduce(
            (accumulator, currentValue) => ({
              ...accumulator,
              [getField(currentValue)]: 'sum',
            }),
            {}
          ),
          advance_payment_deduction: 'advanceSum',
          take_to_home: 'sum',
        },
      },
      pinnedColumns: {
        right: ['take_to_home'],
      },
    };
    return result;
  }, [data]);

  return (
    <>
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
      <div style={{ display: 'none' }}>
        {error && (
          <WarningModal
            onClose={() => setError(false)}
            subtitle={t('payroll.advance_payment.modal.deduct_error.subtitle')}
            title={t('payroll.advance_payment.modal.deduct_error.title')}
          />
        )}
      </div>
    </>
  );
};

const AdvancePayment = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  width: 100%;
`;
