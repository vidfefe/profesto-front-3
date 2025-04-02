import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GridColDef,
  GridRenderCellParams,
  GridValueFormatterParams,
} from '@mui/x-data-grid-premium';
import { GridInitialStatePremium } from '@mui/x-data-grid-premium/models/gridStatePremium';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import useQueryCustom from 'hooks/useQueryCustom';
import { PaymentDocumentSummary, PaymentDocumentType } from 'types';
import { currencyFormatter } from 'utils/number';
import { ColumnHeader, HeaderProps, PayRateCell, Table } from '../../components/Table';
import { useInfo } from '../useInfo';

export const Summary = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const { documentStatus, info } = useInfo({ documentId: id, tableId: 'benefits_deductions' });

  const { data, isLoading } = useQueryCustom<PaymentDocumentSummary, { errors: string[] }>(
    ['payment_document_summary', id],
    {
      endpoint: `/payment_document/${id}?page=review_and_submit`,
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
        value: currencyFormatter({ amount: data?.company_pays, currency: data?.currency }),
        title: t('payroll.previous_cost.company_pays'),
      },
      {
        value: currencyFormatter({ amount: data?.employee_pays, currency: data?.currency }),
        style: {
          color: Number(data?.employee_pays) < 0 ? 'var(--red)' : undefined,
        },
        title: t('payroll.previous_cost.employee_pays'),
      },
      {
        value: currencyFormatter({ amount: data?.take_to_home, currency: data?.currency }),
        style: {
          color: Number(data?.take_to_home) < 0 ? 'var(--red)' : undefined,
        },
        title: t('payroll.payment_document.take_to_home'),
      },
      {
        value: currencyFormatter({ amount: data?.total_payroll_cost, currency: data?.currency }),
        style: {
          color: Number(data?.total_payroll_cost) < 0 ? 'var(--red)' : undefined,
          background: 'rgb(255, 153, 51, 0.12)',
        },
        title: t('payroll.payment_document.steps.review_submit.total_payroll'),
      },
    ];
    return result;
  }, [data, t]);

  const valueFormatter = useCallback(
    (params: GridValueFormatterParams) => {
      const { value } = params;
      const result = !Number(value)
        ? '-'
        : currencyFormatter({ currency: data?.currency, amount: value });
      return result;
    },
    [data?.currency]
  );

  const renderCell = useCallback(({ formattedValue, value }: GridRenderCellParams) => {
    return (
      <div style={{ color: Number(value || 0) < 0 ? 'var(--red)' : '' }}>{formattedValue}</div>
    );
  }, []);

  const columns = useMemo(() => {
    const result: GridColDef[] = [
      {
        field: 'total_net_amount',
        type: 'number',
        headerName: t('payroll.payment_document.total_net'),
        headerAlign: 'center',
        valueFormatter,
        renderCell,
      },
      {
        field: 'benefits_company_pays',
        type: 'number',
        renderHeader: () => (
          <ColumnHeader
            title={t('payroll.payment_document.benefits')}
            subtitle={t('payroll.previous_cost.company_pays')}
          />
        ),
        headerAlign: 'center',
        valueFormatter,
        renderCell,
        flex: 1,
      },
      {
        field: 'total_gross_amount',
        type: 'number',
        headerName: t('payroll.payment_document.steps.review_submit.total_gross'),
        headerAlign: 'center',
        valueFormatter,
        renderCell,
        flex: 1,
      },
      {
        field: 'pension_fund_employee',
        type: 'number',
        renderHeader: () => (
          <ColumnHeader
            title={t('payroll.payment_document.steps.review_submit.pension_fund')}
            subtitle={t('payroll.payment_document.steps.review_submit.employee')}
          />
        ),
        headerAlign: 'center',
        valueGetter: ({ value }) => -value,
        valueFormatter,
        renderCell,
        flex: 1,
      },
      {
        field: 'income_tax',
        type: 'number',
        headerName: t('payroll.payment_document.steps.review_submit.income_tax'),
        headerAlign: 'center',
        valueGetter: ({ value }) => -value,
        valueFormatter,
        renderCell,
        flex: 1,
      },
      {
        field: 'benefits_total_cost',
        type: 'number',
        renderHeader: () => (
          <ColumnHeader
            title={t('payroll.payment_document.benefits')}
            subtitle={t('settings.benefit.total_cost')}
          />
        ),
        headerAlign: 'center',
        valueFormatter,
        renderCell,
        flex: 1,
      },
      {
        field: 'deductions',
        type: 'number',
        headerName: t('payroll.payment_document.deductions'),
        headerAlign: 'center',
        valueFormatter,
        renderCell,
        flex: 1,
      },
      {
        field: 'take_to_home',
        type: 'number',
        headerName: t('payroll.payment_document.take_to_home'),
        headerAlign: 'center',
        cellClassName: 'green',
        headerClassName: 'headerGreen',
        valueFormatter,
        renderCell,
        flex: 1,
      },
      {
        field: 'pension_fund_company',
        type: 'number',
        renderHeader: () => (
          <ColumnHeader
            title={t('payroll.payment_document.steps.review_submit.pension_fund')}
            subtitle={t('payroll.payment_document.steps.review_submit.company')}
          />
        ),
        headerAlign: 'center',
        valueFormatter,
        renderCell,
        flex: 1,
      },
      {
        field: 'total_payroll_cost',
        type: 'number',
        headerName: t('payroll.payment_document.steps.review_submit.total_payroll'),
        cellClassName: 'orange',
        headerClassName: 'headerOrange',
        headerAlign: 'center',
        valueFormatter,
        renderCell,
        flex: 1,
      },
    ];
    if (data?.advance_payment) {
      result.splice(2, 0, {
        field: 'advance_payment_deduction',
        headerName: t('payroll.payment_document.advance_deduction'),
        headerAlign: 'center',
        renderCell: (params) => {
          return params.value ? (
            <AdvancePayment>
              <PayRateCell
                value={{
                  amount: -params.value?.deduction_amount,
                  period: ' ',
                }}
                currency={data?.currency}
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
  }, [data?.advance_payment, data?.currency, renderCell, t, valueFormatter]);

  const initialState = useMemo(() => {
    const result: GridInitialStatePremium = {
      aggregation: {
        model: {
          total_net_amount: 'sum',
          benefits_company_pays: 'sum',
          advance_payment_deduction: 'advanceSum',
          income_tax: 'sum',
          pension_fund_employee: 'sum',
          total_gross_amount: 'sum',
          benefits_total_cost: 'sum',
          deductions: 'sum',
          take_to_home: 'sum',
          pension_fund_company: 'sum',
          total_payroll_cost: 'sum',
        },
      },
      pinnedColumns: {
        right: ['take_to_home', 'pension_fund_company', 'total_payroll_cost'],
      },
    };
    return result;
  }, []);

  return (
    <Table
      data={data?.list}
      dataLoading={isLoading}
      initialColumns={columns}
      initialState={initialState}
      summary={summary}
      info={info}
      documentStatus={documentStatus}
      documentType={PaymentDocumentType.REGULAR_PAYROLL}
    />
  );
};

const AdvancePayment = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  width: 100%;
`;
