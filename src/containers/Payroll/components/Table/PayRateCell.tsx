import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { currencyFormatter } from 'utils/number';

type PayRateCellProps = {
  monthHours?: number;
  currency?: string;
  value?: {
    amount: string | number;
    hours?: number;
    period?: string;
    currency?: string;
  };
  showZero?: boolean;
};

export const PayRateCell = ({
  value,
  monthHours,
  currency,
  showZero,
}: PayRateCellProps): ReactElement | null => {
  const { t } = useTranslation();

  return (
    <Container>
      {!value || (!showZero && !Number(value.amount)) ? (
        '-'
      ) : (
        <>
          <div
            className={'amount'}
            style={{ color: Number(value.amount) < 0 ? 'var(--red)' : undefined }}
          >
            {currencyFormatter({ amount: value.amount, currency: currency || value.currency })}
          </div>
          <div className={'hours'}>
            {value.period ||
              (monthHours
                ? `${t('globaly.hours_count', { count: value.hours })} / ${t(
                    'globaly.hours_count',
                    {
                      count: monthHours,
                    }
                  )}`
                : t('globaly.hours_count', {
                    count: value.hours,
                  }))}
          </div>
        </>
      )}
    </Container>
  );
};

const Container = styled.div`
  text-align: end;
  .amount {
    font-family: 'Aspira Demi', 'FiraGO Regular';
  }
  .hours {
    font-family: 'Aspira Regular', 'FiraGO Regular';
    font-size: 10px;
    color: var(--dark-gray);
  }
`;
