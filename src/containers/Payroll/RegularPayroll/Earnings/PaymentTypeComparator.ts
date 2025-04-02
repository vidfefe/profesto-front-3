import { sortBy } from 'lodash';

import { PaymentDocumentEarning, PaymentTypeClass } from 'types';

export const PaymentTypeComparator = (list?: PaymentDocumentEarning['columns']['payment_types']) => {
  if (!list) return [];
  const salary = sortBy(
    list.filter((el) => el.payment_type_class === PaymentTypeClass.SALARY),
    ['name']
  );
  const hourly = sortBy(
    list.filter((el) => el.payment_type_class === PaymentTypeClass.HOURLY),
    ['name']
  );
  const performance = sortBy(
    list.filter((el) => el.payment_type_class === PaymentTypeClass.PERFORMANCE),
    ['name']
  );
  const overtime = sortBy(
    list.filter((el) => el.payment_type_class === PaymentTypeClass.OVERTIME),
    ['name']
  );
  const night = sortBy(
    list.filter((el) => el.payment_type_class === PaymentTypeClass.NIGHT),
    ['name']
  );
  const holiday = sortBy(
    list.filter((el) => el.payment_type_class === PaymentTypeClass.HOLIDAY),
    ['name']
  );
  const result = [...salary, ...hourly, ...performance, ...overtime, ...night, ...holiday];
  return result;
};
