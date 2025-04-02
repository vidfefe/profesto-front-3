import { Fragment, useEffect } from 'react';
import styled from 'styled-components';
import { NumericFormat } from 'react-number-format';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import getDate from 'date-fns/getDate';
import getYear from 'date-fns/getYear';
import getMonth from 'date-fns/getMonth';
import startOfWeek from 'date-fns/startOfWeek';
import endOfWeek from 'date-fns/endOfWeek';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import subDays from 'date-fns/subDays';
import addDays from 'date-fns/addDays';
import isWeekend from 'date-fns/isWeekend';
import isWithinInterval from 'date-fns/isWithinInterval';
import isEqual from 'date-fns/isEqual';
import isAfter from 'date-fns/isAfter';
import differenceInDays from 'date-fns/differenceInDays';
import isValid from 'date-fns/isValid';
import { getWeekdayNames } from 'utils/common';
import { dateFormat } from 'lib/DateFormat';

type TRange = {
    id?: number,
    time_off_day: Date,
    time_off_hour: string
};

interface IPartialDateChoose {
    startDate: Date,
    endDate: Date,
    onChangeRange: (range: TRange[]) => void,
    onChangeCell?: (cell: TRange) => void,
    intervalWithHourData: TRange[],
    mode?: "view" | "dynamic";
};

const MAX_RANGE_YEAR_DAYS = 365;

const gapDates = (daysOfInterval: TRange[]) => {
    let firstDate = new Date(daysOfInterval[0].time_off_day);
    let lastDate = new Date(daysOfInterval.at(-1)?.time_off_day as Date) ?? 0;

    const startOfWeekDate = startOfWeek(firstDate);
    const endOfWeekDate = endOfWeek(lastDate);
    const gapToStart = differenceInCalendarDays(firstDate, startOfWeekDate)
    const gapToEnd = differenceInCalendarDays(endOfWeekDate, lastDate);

    const gapToStartDates = [];
    for (let i = 0; i < gapToStart; i++) {
        gapToStartDates.unshift(subDays(firstDate, i + 1));
    };

    const gapToEndDates = [];
    for (let i = 0; i < gapToEnd; i++) {
        gapToEndDates.push(addDays(lastDate, i + 1));
    };

    return [
        ...gapToStartDates.map(date => {
            return {
                time_off_day: date,
                time_off_hour: ''
            };
        }),
        ...daysOfInterval,
        ...gapToEndDates.map(date => {
            return {
                time_off_day: date,
                time_off_hour: ''
            };
        })
    ];
};

const getDateHourRangeFromTwoDate = (startDate: Date, endDate: Date) => {
    const daysOfInterval = eachDayOfInterval({ start: startDate, end: endDate });

    const daysOfIntervalWithHour = daysOfInterval.map(date => {
        const isDateWeekend = isWeekend(date);
        return {
            time_off_day: date,
            time_off_hour: isDateWeekend ? '' : '8'
        };
    });

    const addedGapDaysOfInterval = gapDates(daysOfIntervalWithHour);

    return addedGapDaysOfInterval;
};

const renderHeader = (startDate: Date, endDate: Date) => {
    if (getYear(startDate) === getYear(endDate) && getMonth(startDate) === getMonth(endDate)) return dateFormat(startDate, 'longMonthAndYear');
    return <>{dateFormat(startDate, 'longMonthAndYear')} - {dateFormat(endDate, 'longMonthAndYear')}</>
};

export default function PartialDateChoose({ startDate, endDate, onChangeRange, onChangeCell, intervalWithHourData, mode = 'dynamic' }: IPartialDateChoose) {
    const weekdays = getWeekdayNames();
    const isReadyToRenderCalendar = mode === 'dynamic' && (isValid(startDate) && isValid(endDate)) && !isAfter(startDate, endDate) && !(differenceInDays(endDate, startDate) >= MAX_RANGE_YEAR_DAYS);

    useEffect(() => {
        if (intervalWithHourData.length === 0 && isReadyToRenderCalendar) {
            const daysOfIntervalWithHour = getDateHourRangeFromTwoDate(startDate, endDate);
            onChangeRange(daysOfIntervalWithHour);
        };
    }, [intervalWithHourData]);

    useEffect(() => {
        if (!!startDate && !!endDate && isReadyToRenderCalendar) {
            const daysOfIntervalWithHour = getDateHourRangeFromTwoDate(startDate, endDate);
            const mergedArray = daysOfIntervalWithHour.map((elem) => {
                const isDateWeekend = isWeekend(elem.time_off_day);
                const match = intervalWithHourData.find((elem2) => isEqual(elem2.time_off_day, elem.time_off_day) && isWithinInterval(elem.time_off_day, { start: startDate, end: endDate }));

                return match ? match : { ...elem, time_off_hour: isDateWeekend ? '' : '8' };
            });

            onChangeRange(mergedArray);
        };
    }, [startDate, endDate]);

    if (!(isValid(startDate) && isValid(endDate)) || isAfter(startDate, endDate)) return <span style={{ color: '#C54343' }}>Date To must be greater than Date From</span>;
    if (differenceInDays(endDate, startDate) >= MAX_RANGE_YEAR_DAYS) return <span style={{ color: '#C54343' }}>Time Off Period should not exceed one year</span>;

    return (
        <Container>
            <CalendarHeaderContainer>{renderHeader(startDate, endDate)}</CalendarHeaderContainer>
            <table>
                <thead>
                    <tr>
                        {weekdays.map((day, i) => (
                            <CustomTh key={i}>{day}</CustomTh>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {(mode === 'dynamic' ? intervalWithHourData : gapDates(intervalWithHourData)).map((_, i) => {
                        if (i % 7 === 0) {
                            return (
                                <Fragment key={i}>
                                    <CustomTr>
                                        {(mode === 'dynamic' ? intervalWithHourData : gapDates(intervalWithHourData)).slice(i, i + 7).map((item, j) => {
                                            return <td key={j}>{dateFormat(new Date(item.time_off_day), 'shortMonth')} {getDate(new Date(item.time_off_day))}</td>;
                                        })}
                                    </CustomTr>
                                    <CustomInputTr>
                                        {(mode === 'dynamic' ? intervalWithHourData : gapDates(intervalWithHourData)).slice(i, i + 7).map((item, j) => {
                                            if (!isWithinInterval(new Date(item.time_off_day), { start: startDate, end: endDate }) && mode === 'dynamic') {
                                                return <td key={j}><input disabled /></td>;
                                            };
                                            return <td key={j}>
                                                <NumericFormat
                                                    onBlur={(e) => onChangeCell?.({ time_off_day: item.time_off_day, time_off_hour: e.target.value })}
                                                    disabled={mode === 'view'}
                                                    decimalSeparator="."
                                                    decimalScale={2}
                                                    valueIsNumericString
                                                    //if hour equal zero -> show empty string, if hour is decimal with zero -> show without zero, otherwise with decimal point
                                                    value={item.time_off_hour === '0' ? '' : +item.time_off_hour % 1 === 0 ? parseInt(item.time_off_hour) : item.time_off_hour}
                                                    isAllowed={(values) => {
                                                        const { value } = values;
                                                        return +value <= 24;
                                                    }}
                                                    placeholder={'-'}
                                                />
                                            </td>;
                                        })}
                                    </CustomInputTr>
                                </Fragment>
                            );
                        };
                        return null;
                    })}
                </tbody>
            </table>
        </Container>
    )
};

const Container = styled.div`
    table {
        border-collapse: collapse;
        width: 100%;
    }

    & tr:last-child td:first-child {
        & > input {
            border-bottom-left-radius: 4px;
        };
    }
            
    & tr:last-child td:last-child {
        & > input {
            border-bottom-right-radius: 4px;
        };
    }
`;

const CalendarHeaderContainer = styled.div`
    display: flex; 
    flex: 1;
    justify-content: center;
    background-color: #172B37;
    color: #FFF;
    border-radius: 4px 4px 0 0;
    padding: 4px;
`;

const CustomTh = styled.th`
    border-inline: 1px solid #ddd;
    color: #00101A;
    font-size: 10px;
    padding: 5px;
    text-align: center;
    background-color: #FFF;
`;

const CustomTr = styled.tr`
    background-color: #E8F4EE;
    & > td {
        border-inline: 1px solid #ddd;
        color: #00101A;
        font-size: 11px;
        padding: 5px;
        text-align: center;
    }
`;

const CustomInputTr = styled.tr`
    & > td {
        & > input {
            width: 100%;
            height: 50px;
            background-color: #FFF;
            border: 0.5px solid #ddd;
            text-align: center;
            font-size: 13px;
            color: #00101A;
            &:focus, &:hover {
                border: 1px solid #99CC33;
            }
            &:disabled {
                background-color: #F3F3F3;
                border: 0.5px solid #ddd;
            }
        }
    }
`;