import { formatInTimeZone } from 'date-fns-tz';
import { ka, enUS } from "date-fns/locale";
import { find } from 'lodash';
import { getStorageObject } from 'utils/storage';
type DateFormat = 
    | 'longDate' // suggests 'dd MMMM yyyy'
    | 'longDateAndTime' // suggests 'dd MMMM yyyy HH:mm'
    | 'shortDate' // suggests 'dd/MM/yyyy'
    | 'shortMonthDay' // 'MMM dd'
    | 'shortDateAndTime' // suggests 'dd/MM/yyyy HH:mm'
    | 'shortMonthAndDay' // suggests 'dd MMM yyyy'
    | 'shortMonthAndTime' // suggests 'dd MMM yyyy HH:mm'
    | 'shortTime' // suggests 'dd MMM yyyy HH:mm'
    | 'longTime' // suggests 'HH:mm:ss'
    | 'longDayAndMontn' // suggests 'EEEE dd yyyy',
    | 'shortDayAndMonthAndYear' // suggests 'EEE dd yyyy',
    | 'shortMonthAndYear' //suggests 'MMM dd yyyy',
    | 'longMonthAndYear' //suggests 'MMMM yyyy',
    | 'shortDay' //suggests 'EEE',
    | 'shortDayNumber' // suggests 'd',
    | 'longMonthDay' // suggests 'MMMM d'
    | 'shortMonth'
    | 'shortDayAndMonth'
    | 'timeOffRequest'


const regionMappings: { [key: string]: { [key: string]: string } } = {
    EUR: {
        shortMonthDay: 'dd MMM',
        shortDate: 'dd/MM/yyyy',
        shortDateAndTime: 'dd/MM/yyyy HH:mm',
        shortMonthAndDay: 'dd MMM yyyy',
        shortMonthAndTime: 'dd MMM yyyy HH:mm',
        shortTime: 'HH:mm',
        shortMonthAndYear: 'MMM, yyyy',
        shortDay: 'EEE',
        shortDayNumber: 'dd',
        shortMonth: 'MMM',
        longMonthDay: 'd MMMM',
        longMonthAndYear: 'MMMM yyyy',
        longDate: 'dd MMMM yyyy',
        longDateAndTime: 'dd MMMM yyyy HH:mm',
        longTime: 'HH:mm:ss',
        longDayAndMontn: 'EEEE, dd MMMM, yyyy',
        shortDayAndMonthAndYear: 'EEE, dd MMM yyyy',
        shortDayAndMonth: 'EEE, dd MMM',
        timeOffRequest: 'EEEE, dd MMM yyyy - HH:mm'
    },
    USA: {
        shortMonthDay: 'MMM dd',
        shortDate: 'mm/dd/yyyy',
        shortDateAndTime: 'mm/dd/yyyy HH:mm',
        shortMonthAndDay: 'MMM dd yyyy',
        shortMonthAndTime: 'MMM dd yyyy HH:mm',
        shortTime: 'HH:mm',
        shortMonthAndYear: 'MMM, yyyy',
        shortDay: 'EEE',
        shortDayNumber: 'd',
        shortMonth: 'MMM',
        longMonthDay: 'MMMM d',
        longMonthAndYear: 'MMMM yyyy',
        longDate: 'MMMM dd yyyy',
        longDateAndTime: 'MMMM dd yyyy HH:mm',
        longTime: 'HH:mm:ss',
        longDayAndMontn: 'EEEE, MMMM dd, yyyy',
        shortDayAndMonthAndYear: 'EEE, dd MMM yyyy',
        shortDayAndMonth: 'EEE, dd',
        timeOffRequest: 'EEEE, dd MMM yyyy at HH:mm'
    }
};

export const dateFormat = (date: any, formatStr: DateFormat = 'shortDate') => {
    const locale = getStorageObject('lang', 'string');
    const selectedRegion: any = find(Object.keys(regionMappings), (region: any) => region === process.env.REACT_APP_DATEFORMAT);

    let format = regionMappings[selectedRegion][formatStr];
    if (!format) {
        format = formatStr;
    }

    return formatInTimeZone(new Date(date), Intl.DateTimeFormat().resolvedOptions().timeZone, format, { locale: locale === 'ka' ? ka : enUS });
};



export const placeholderFormat = (placeholder = true, t: any) => {
    if (process.env.REACT_APP_DATEFORMAT === 'EUR') {
        return placeholder ? t('placeholder') : 'dd/MM/yyyy';
    }
    else if (process.env.REACT_APP_DATEFORMAT === 'USA') {
        return placeholder ? 'mm/dd/yyyy' : 'MM/dd/yyyy';
    }
}



