import { GridAggregationFunction } from '@mui/x-data-grid-premium';
import i18n from 'i18n';

import { Employee } from 'types';

export const totalSum: GridAggregationFunction<
  { amount: number; hours: number; monthHours: number },
  object | null
> = {
  apply: ({ values }) => {
    if (!values.length) {
      return null;
    }
    const sum = values.reduce(
      (accumulator, currentValue) => {
        if (currentValue) {
          return {
            amount: accumulator!.amount + Number(currentValue.amount),
            hours: accumulator!.hours + Number(currentValue.hours),
            monthHours: accumulator!.monthHours + Number(currentValue.monthHours || 0),
          };
        }
        return accumulator;
      },
      { amount: 0, hours: 0, monthHours: 0 }
    );
    return sum;
  },
  label: 'Total Sum',
};

export const sum: GridAggregationFunction<number, number | null> = {
  apply: ({ values }) => {
    if (!values.length) {
      return null;
    }
    const sum = values.reduce(
      (accumulator, currentValue) => accumulator! + Number(currentValue || 0),
      0
    );
    return sum;
  },
  label: 'Sum',
};

export const uniq: GridAggregationFunction<Employee, string> = {
  apply: ({ values }) => {
    if (!values.length) {
      return null;
    }
    const ids = new Set(values.map((item) => item!.id));
    return i18n.language === 'ka'
      ? `სულ (${[...ids].length} თანამშრომელი)`
      : `Total (${[...ids].length} Employees)`;
  },
  label: 'Uniq',
};

export const advanceSum: GridAggregationFunction<
  { deduction_amount: number; left: number },
  object | null
> = {
  apply: ({ values }) => {
    if (!values.length) {
      return null;
    }
    const sum = values.reduce(
      (accumulator, currentValue) => {
        if (currentValue) {
          return {
            deduction_amount: accumulator!.deduction_amount + Number(currentValue.deduction_amount),
            left: accumulator!.left + Number(currentValue.left),
          };
        }
        return accumulator;
      },
      { deduction_amount: 0, left: 0 }
    );
    return sum;
  },
  label: 'Advance Sum',
};
