import format from 'date-fns/format';
import { enUS, ka } from 'date-fns/locale';
import i18n from 'i18n';

export const getPeriod = (periodStart: string, periodEnd: string) => {
  const start = toFormattedDate(periodStart, 'd MMM');
  const end = toFormattedDate(periodEnd, 'd MMM, yyyy');
  const result: string = `${start} - ${end}`;
  return result;
};

export const toFormattedDate = (date: string | number | Date, dateFormat: string) => {
  return format(new Date(date), dateFormat, {
    locale: i18n.language === 'ka' ? ka : enUS,
  });
};
