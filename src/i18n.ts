import i18n, { FormatFunction } from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './locales/en/lang.json';
import translationKA from './locales/ka/lang.json';
import _ from 'lodash';

const storedLanguage = localStorage.getItem('lang') || 'ka';

const format: FormatFunction = (value, format) => {
  if (format === 'lowerFirst') return _.lowerFirst(value);
  if (format === 'upperFirst') return _.upperFirst(value);
  return value;
};

const resources = {
  en: {
    translation: translationEN,
  },
  ka: {
    translation: translationKA,
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: storedLanguage,
    fallbackLng: 'ka',
    interpolation: {
      escapeValue: false, // react already safe from xss
      format,
    },
  });

export default i18n;
