import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GridColumns,
  GridRenderCellParams,
  GridValueFormatterParams,
} from '@mui/x-data-grid-premium';
import { GridInitialStatePremium } from '@mui/x-data-grid-premium/models/gridStatePremium';
import { useHistory, useParams } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { useToasts } from 'react-toast-notifications';
import styled from 'styled-components';

import useQueryCustom from 'hooks/useQueryCustom';
import {
  AdvancePaymentDocument,
  ErrorPayload,
  PaymentDocumentStatus,
  PaymentDocumentType,
} from 'types';
import { currencyFormatter } from 'utils/number';
import {
  ColumnHeader,
  EditableCell,
  EditCell,
  HeaderProps,
  PayRateCell,
  Table,
} from '../components/Table';
import { updateAdvancePayment } from 'services';
import { Footer } from '../components/Footer';
import useMutationCustom from 'hooks/useMutationCustom';
import { useError } from 'hooks/useError';
import { toFormattedDate } from 'utils/date';
import { Actions } from './Actions';
import { AddEmployee } from './modals/AddEmployee';
import { footerRowId } from '../components/Table/consts';
import { getMutationErrorPayload } from 'utils/response';

export const AdvancePayment = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const queryClient = useQueryClient();
  const { addToast } = useToasts();

  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const { onError } = useError();

  const { data, isLoading } = useQueryCustom<AdvancePaymentDocument, ErrorPayload>(
    ['advance_payment_document', id],
    {
      endpoint: `/advance_payment_document/${id}`,
      options: {
        method: 'get',
      },
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const { mutate: submitDocument } = useMutationCustom<{}, {}, { id: number }>(
    ['submit_payment_document'],
    {
      endpoint: '/advance_payment_document/approve',
      options: { method: 'post' },
    },
    {
      onSuccess: () => {
        addToast(t('payroll.advance_payment.toast.submit'), {
          appearance: 'success',
          autoDismiss: true,
        });
        history.push('/payroll');
      },
      onError,
    }
  );

  const isDraft = data?.status === PaymentDocumentStatus.DRAFT;

  const summary = useMemo(() => {
    const result: HeaderProps['summary'] = [
      {
        value: currencyFormatter({
          amount: data?.advance_payment_amount,
          currency: data?.currency,
        }),
        title: t('payroll.advance_payment.title'),
      },
      {
        value: currencyFormatter({ amount: data?.total_cost, currency: data?.currency }),
        style: {
          color: Number(data?.total_cost) < 0 ? 'var(--red)' : undefined,
          background: 'rgb(255, 153, 51, 0.12)',
        },
        title: t('payroll.history_block.total_cost'),
      },
    ];
    return result;
  }, [data, t]);

  const info = useMemo(() => {
    const result: HeaderProps['info'] = [
      {
        className: 'title',
        style: { textTransform: 'uppercase' },
        value: t('payroll.advance_payment.title'),
      },
      {
        value: `${t('payroll.pay_date')}: ${
          data?.payment_date ? toFormattedDate(data.payment_date, 'd MMM, yyyy') : ''
        }`,
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

  const renderCell = useCallback((params: GridRenderCellParams) => {
    return (
      <div style={{ color: Number(params.value || 0) < 0 ? 'var(--red)' : '' }}>
        {params.formattedValue}
      </div>
    );
  }, []);

  const columns = useMemo(() => {
    const result: GridColumns = [
      {
        field: 'pay_rate',
        headerName: t('payroll.payment_document.pay_rate'),
        headerAlign: 'center',
        cellClassName: 'gray',
        renderCell: ({ id, value }) => id !== footerRowId && <PayRateCell value={value} />,
        flex: 1,
      },
      {
        field: 'total_net_amount',
        headerName: t('payroll.advance_payment.title'),
        headerAlign: 'center',
        editable: true,
        valueGetter: ({ value }) => Number(value),
        renderCell: (params) => <EditableCell currency={data?.currency} params={params} />,
        renderEditCell: (params) => (
          <EditCell
            allowNegative={false}
            onEditStop={(value) => {
              setLoading(true);
              updateAdvancePayment({
                id: params.id as number,
                amount: value,
              })
                .then(({ data }) => {
                  queryClient.setQueryData(
                    ['advance_payment_document', id],
                    (oldData: Partial<AdvancePaymentDocument> | undefined) => {
                      const advance_payments = oldData!.advance_payments!.map((advance_payment) => {
                        if (advance_payment.id !== data.id) return advance_payment;
                        return data.row;
                      });
                      return {
                        ...oldData,
                        advance_payments,
                        total_cost: data.total_cost,
                        advance_payment_amount: data.advance_payments,
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
      },
      {
        field: 'income_tax_amount',
        type: 'number',
        headerName: t('payroll.payment_document.steps.review_submit.income_tax'),
        headerAlign: 'center',
        valueFormatter,
        renderCell,
        flex: 1,
      },
      {
        field: 'pension_fund_employee_pays',
        type: 'number',
        renderHeader: () => (
          <ColumnHeader
            title={t('payroll.payment_document.steps.review_submit.pension_fund')}
            subtitle={t('payroll.payment_document.steps.review_submit.employee')}
          />
        ),
        headerAlign: 'center',
        valueFormatter,
        renderCell,
        flex: 1,
      },
      {
        field: 'pension_fund_company_pays',
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
        field: 'total_gross_amount',
        type: 'number',
        headerName: t('payroll.payment_document.steps.review_submit.total_gross'),
        headerAlign: 'center',
        valueFormatter,
        renderCell,
        flex: 1,
      },
      {
        field: 'total_cost_amount',
        type: 'number',
        headerName: t('payroll.history_block.total_cost'),
        headerAlign: 'center',
        cellClassName: 'orange',
        headerClassName: 'headerOrange',
        valueFormatter,
        renderCell,
        flex: 1,
      },
    ];
    if (isDraft) {
      result.push({
        field: 'action',
        type: 'actions',
        headerName: t('globaly.action'),
        renderHeader: () => <></>,
        getActions: ({ id, row }) => {
          return id === footerRowId ? [] : [<Actions row={row} />];
        },
      });
    }
    return result;
  }, [data?.currency, id, isDraft, onError, queryClient, renderCell, t, valueFormatter]);

  const initialState = useMemo(() => {
    const result: GridInitialStatePremium = {
      aggregation: {
        model: {
          total_net_amount: 'sum',
          income_tax_amount: 'sum',
          pension_fund_employee_pays: 'sum',
          pension_fund_company_pays: 'sum',
          total_gross_amount: 'sum',
          total_cost_amount: 'sum',
        },
      },
      pinnedColumns: {
        right: ['total_cost_amount', 'action'],
      },
    };
    return result;
  }, []);

  return (
    <Container>
      <Table
        data={data?.advance_payments}
        dataLoading={isLoading}
        loading={loading}
        initialColumns={columns}
        initialState={initialState}
        summary={summary}
        info={info}
        documentStatus={data?.status}
        documentType={PaymentDocumentType.ADVANCE_PAYMENT}
        addButtonConfig={
          isDraft
            ? {
                action: () => setOpenModal(true),
                title: t('payroll.advance_payment.add_employee'),
              }
            : undefined
        }
      />
      <Footer
        onClose={() => history.push('/payroll')}
        onSubmit={isDraft ? () => submitDocument({ id: Number(id) }) : undefined}
      />
      {openModal && <AddEmployee documentId={id} onClose={() => setOpenModal(false)} />}
    </Container>
  );
};

const Container = styled.div`
  display: grid;
  grid-template-rows: 1fr;
  padding: 25px 30px 10px 30px;
`;
