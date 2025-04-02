import format from "date-fns-tz/format";
import { filter } from "lodash";
import {dateFormat} from "../lib/DateFormat";

export const removeDuplicates = (arr) => {
    return arr.filter(function (item, pos) {
        return arr.indexOf(item) === pos;
    })
}


function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });

    return map;
}

export const groupFilterData = (text, directoryList, propertyName) => {
    const wordArray = text.split(' ').filter((item) => { return item !== '' })

    const filteredData = directoryList.filter((item) => {
        return item[propertyName] && wordArray.every(element => item[propertyName].toLowerCase().includes(element.toLowerCase()));
    })

    return Array.from(groupBy(filteredData, (item) => item[propertyName]), ([title, values]) => ({ title, values }))
        .sort((a, b) => { return a.title < b.title ? 1 : -1 });
}

export const calculateAge = (birthday) => {
    let today = new Date();
    let birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    let m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age > 0 ? age : 0;
};

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

export function formatDateWithSlashes(date, withHours) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        hour = d.getHours(),
        minute = d.getMinutes();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    if (hour < 10)
        hour = '0' + hour;
    if (minute < 10)
        minute = '0' + minute;

    if (withHours) {
        return [year, month, day].join('/') + ' ' + [hour, minute].join(':');
    } else {
        return [year, month, day].join('/');
    }
}

export const calculateDays = (date) => {
    const start = new Date(formatDate(new Date()));
    const end = new Date(date);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));

}

export const jobDescription = (jobInfo) => {
    return (jobInfo?.job_title?.name ? jobInfo?.job_title?.name : '')
        + (jobInfo?.department || jobInfo?.division ? ' in ' : '')
        + (jobInfo?.department ? jobInfo?.department?.name : '')
        + (jobInfo?.department && jobInfo?.division ? ', ' : '')
        + (jobInfo?.division ? jobInfo?.division?.name : '')
}

export const formatHour = (date) => {
    var d = new Date(date),
        // month = '' + (d.getMonth() + 1),
        // day = '' + d.getDate(),
        // year = d.getFullYear(),
        hour = d.getHours(),
        minute = d.getMinutes(),
        seconds = d.getSeconds();


    // if (month.length < 2)
    //     month = '0' + month;
    // if (day.length < 2)
    //     day = '0' + day;

    if (hour < 10)
        hour = '0' + hour;
    if (minute < 10)
        minute = '0' + minute;

    if (seconds < 10)
        seconds = '0' + seconds;

    return [hour, minute].join(':');
}

export const formatDateWithHours = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        hour = d.getHours(),
        minute = d.getMinutes(),
        seconds = d.getSeconds();


    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    if (hour < 10)
        hour = '0' + hour;
    if (minute < 10)
        minute = '0' + minute;

    if (seconds < 10)
        seconds = '0' + seconds;

    return [year, month, day].join('-') + ' ' + [hour, minute, seconds].join(':');
}



export const renderModalHeight = (windowHeight) => {
    if (windowHeight > 900) {
        return 710;
    } else if (windowHeight > 700) {
        return windowHeight - 120;
    } else {
        return windowHeight - 100;
    }
}



export const checkDate = (date) => {
    var varDate = new Date(date); //dd-mm-YYYY
    var today = new Date();

    if (varDate >= today) {
        return true;
    } else {
        return false;
    }
}


export const checkForObjectValues = (items) => {

    let result = !Object.values(items).every(o => o === null);

    if (result) {
        return true;
    } else {
        return false;
    }
}


export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export function numberWithCommas(x) {

    if (!x) {
        return null;
    }

    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1,$2");
    return x;
}

export function isEmpty(objectToCheck) {
    if (!objectToCheck)
        return null

    return Object.entries(objectToCheck).length === 0 ? true : false;
}

export function employeeInitials(full_name) {
    if (full_name) {
        const parts = full_name?.split(" ");    
        const firstNameInitial = parts[0]?.charAt(0);
        const lastNameInitial = parts[1]?.charAt(0);
        return firstNameInitial + lastNameInitial;
    }
    else {
        return 'PF';
    }
}

export function isOverflown(element) {
    return (
        element.scrollHeight > element.clientHeight ||
        element.scrollWidth > element.clientWidth
    );
};

export const getMonthNumber = (monthStr) => new Date(monthStr + '-1-01').getMonth() + 1;

export const getObject = (object, string) => {
    let result;
    if (typeof object !== 'object') return;
    Object.keys(object).some(v => {
        if (v === string) return result = object[v];
        return result = getObject(object[v], string);
    });
    return result;
};

export const toDataURL = (url) => fetch(url)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
    }));

export const base64StringToFile = (base64String, filename) => {
    const arr = base64String.split(','), mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    };
    return new File([u8arr], filename, { type: mime });
};

/**
 * 
 * @param weekStartsOn - 1 is monday
 * @returns weekday names Sun-Sat
 */
export const getWeekdayNames = (weekStartsOn = 1) => {
    const weekdays = [];
    for (let i = weekStartsOn; i < 8; i++) {
        const date = new Date()
        date.setDate(date.getDate() - date.getDay() + (i === 8 ? 0 : i))
        const weekday = dateFormat(date, 'shortDay')
        weekdays.push(weekday)
    };

    return weekdays
};

export const generateTypes = (item) => {
    if (item?.department_name || item?.division_name || item?.location_name) {
        const typeArray = [item?.department_name, item?.division_name, item?.location_name];
   
        const elementsString = filter(typeArray, (x) => {return x}).join(', ');
        const jsxElement = elementsString;
        return jsxElement;
    }
};

export const formatNumber = (num) => {
    let numStr = num.toString();
    let dotIndex = numStr.indexOf('.');

    if (dotIndex === -1 || (numStr.length - dotIndex - 1) <= 1 && numStr.charAt(dotIndex + 1) === '0') {
        return parseInt(numStr, 10);
    }

    if ((numStr.length - dotIndex - 1) > 2) {
        return parseFloat(numStr).toFixed(2);
    }
    return num;
}

