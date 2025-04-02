import React, { useMemo, useState } from 'react';
import { PieChart, PieValueType } from '@mui/x-charts';
import { MakeOptional } from '@mui/x-charts/models/helpers';
import { useTranslation } from 'react-i18next';

import useQueryCustom from 'hooks/useQueryCustom';
import { PayrollMonthData, TupleUnion } from 'types';
import { currencyFormatter } from 'utils/number';
import { Section } from '../components/Section';

type LegendFields = keyof Omit<PayrollMonthData, 'total_cost'>;

const currency = 'GEL';
const legendFields: TupleUnion<LegendFields> = ['net_pay', 'company_pays', 'employee_pays'];
const colorMapping: Record<LegendFields, string> = {
  net_pay: '#A373D6',
  company_pays: '#97CCA8',
  employee_pays: '#E9B177',
};

export const Chart = () => {
  const { t } = useTranslation();

  const [max, setMax] = useState(0);

  const { data } = useQueryCustom<PayrollMonthData, { errors: string[] }>(
    ['month_data'],
    {
      endpoint: '/payment_document/month_data',
      options: {
        method: 'get',
      },
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const legend = useMemo(() => {
    if (!data) return [];

    const lengths: number[] = [];
    const result: MakeOptional<PieValueType, 'id'>[] = legendFields.map((field, index) => {
      const total = Number(data.total_cost);
      const amount = Number(data[field]);
      const percent = total ? (Math.abs(amount) / total) * 100 : !index ? 1 : 0;
      const label = currencyFormatter({ amount, currency });

      if (label!.length - 10 > 0) lengths.push(label!.length - 10);

      return {
        id: index,
        value: percent,
        color: colorMapping[field],
        label: `${label}\n ${t(`payroll.previous_cost.${field}`)}`,
      };
    });
    setMax(lengths.length ? Math.max(...lengths) : 0);
    return result;
  }, [data, t]);

  return (
    <Section
      title={t('payroll.previous_cost.title')}
      amount={currencyFormatter({ amount: data?.total_cost, currency })}
    >
      <PieChart
        series={[
          {
            data: legend,
            innerRadius: 50,
          },
        ]}
        sx={{
          rect: {
            ry: '50%',
            transform: 'translateY(-8px)',
          },
          text: {
            textAnchor: 'end',
          },
          '.MuiChartsLegend-root': {
            transform: `translate(${240 - max * 8}px, 0)`,
            'g:nth-child(1)': {
              transform: 'translate(0px, 50px)',
            },
            'g:nth-child(2)': {
              transform: 'translate(0px, 100px)',
            },
            'g:nth-child(3)': {
              transform: 'translate(0px, 150px)',
            },
          },
          'text tspan:not(:first-child)': {
            fontSize: 10,
            fontFamily: '"Aspira Regular", "FiraGo Regular"',
            fill: '#9F9F9F',
          },
        }}
        margin={{
          left: -50,
        }}
        slotProps={{
          legend: {
            labelStyle: {
              fontSize: 13,
              fontFamily: 'Aspira Demi',
            },
            itemGap: 20,
            markGap: 77 + max * 8,
            itemMarkHeight: 12,
            itemMarkWidth: 12,
          },
        }}
        tooltip={{ trigger: 'none' }}
        width={343}
        height={200}
      />
    </Section>
  );
};
