import { Fragment, useEffect, useState } from 'react';
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
import { isEmpty, map } from 'lodash';
import { ReactComponent as HolidayIcon } from 'assets/svg/holiday.svg';

type TRange = {
    id?: number;
    day: Date;
    hours: string;
    time_off?: string,
    active?: boolean,
};

const MAX_RANGE_YEAR_DAYS = 365;

const gapDates = (daysOfInterval: TRange[]): TRange[] => {
    let firstDate = new Date(daysOfInterval[0].day);
    let lastDate = new Date(daysOfInterval.at(-1)?.day as Date) ?? 0;

    const startOfWeekDate = startOfWeek(firstDate, { weekStartsOn: 1 });
    const endOfWeekDate = endOfWeek(lastDate, { weekStartsOn: 1 });

    const gapToStart = differenceInCalendarDays(firstDate, startOfWeekDate);
    const gapToEnd = differenceInCalendarDays(endOfWeekDate, lastDate);

    const gapToStartDates = [];
    for (let i = 0; i < gapToStart; i++) {
        gapToStartDates.unshift(subDays(firstDate, i + 1));
    }

    const gapToEndDates = [];
    for (let i = 0; i < gapToEnd; i++) {
        gapToEndDates.push(addDays(lastDate, i + 1));
    }

    return [
        ...gapToStartDates.map(date => ({ day: date, hours: '' })),
        ...daysOfInterval,
        ...gapToEndDates.map(date => ({ day: date, hours: '' }))
    ];
};

const getDateHourRangeFromTwoDate = (
    startDate: Date,
    endDate: Date,
    timeOffHours: TRange[]
): TRange[] => {
    const daysOfInterval = eachDayOfInterval({ start: startDate, end: endDate });

    const daysOfIntervalWithHour = daysOfInterval.map(date => {
        const record = timeOffHours.find(item =>
            isEqual(new Date(item.day), date)
        );

        return {
            day: date,
            hours: record ? record.hours : ''
        };
    });

    return gapDates(daysOfIntervalWithHour);
};

const renderHeader = (startDate: Date, endDate: Date) => {
    if (startDate && endDate) {
        if (getYear(startDate) === getYear(endDate) && getMonth(startDate) === getMonth(endDate)) return dateFormat(startDate, 'longMonthAndYear');
        return <>{dateFormat(startDate, 'longMonthAndYear')} - {dateFormat(new Date(endDate.setHours(4, 0, 0, 0)), 'longMonthAndYear')}</>
    }
};

const isDateHoliday = (holidays: Array<{date: string, name: string, reegions: String[]}>, date: Date): boolean => {
    return holidays?.filter((holiday: {date: string, name: string, reegions: String[]}) => 
        new Date(holiday.date).toDateString() === date.toDateString()
    ).length > 0
}

export default function PartialDate({
    borderRadius = 4,
    timesheet,
    holidays = [],
    isDinamic = true,
    showCalendarHeader = true
}: any) {
    const weekdays = getWeekdayNames();

    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [dates, setDates] = useState<TRange[]>([]);
    const [isReady, setIsReady] = useState(false);
    const [originalDates, setOriginalDates] = useState<TRange[]>([]);
    const [timesheetData, setTimesheetData] = useState<TRange[]>([]);

    useEffect(() => {
        if (timesheet?.length) {
            const data = timesheet?.map((timesheetDay: any): TRange => {
                return {
                    id: timesheetDay.id,
                    day: timesheetDay.day ?? timesheetDay.time_off_day,
                    hours: timesheetDay.work_hours ?? timesheetDay.time_off_hour,
                    active: timesheetDay.active,
                    time_off: timesheetDay.time_off,
                }
            });

            let firstRecord = data[0].day;
            let lastRecord =data[data.length - 1].day;

            let stDate = new Date(firstRecord);
            let enDate = new Date(lastRecord);
            const modifiedStartDate = new Date(stDate.setHours(0, 0, 0, 0));
            const modifiedEndDate = new Date(enDate.setHours(0, 0, 0, 0));

            setStartDate(modifiedStartDate);
            setEndDate(modifiedEndDate);

            const convertedDates = data.map((item: any) => {
                let itemDate = new Date(item.day || item.time_off_day);
                return {
                    ...item,
                    day: new Date(itemDate.setHours(0, 0, 0, 0))
                };
            });

            setDates(convertedDates);
            setTimesheetData(data)

            const readyToRenderCalendar =
                isValid(modifiedStartDate) &&
                isValid(modifiedEndDate) &&
                !isAfter(modifiedStartDate, modifiedEndDate) &&
                !(differenceInDays(modifiedEndDate, modifiedStartDate) >= MAX_RANGE_YEAR_DAYS);

            setIsReady(readyToRenderCalendar);
        }
    }, [timesheet]);

    useEffect(() => {
        if (startDate && endDate && isReady) {
            const daysOfIntervalWithHour = getDateHourRangeFromTwoDate(startDate, endDate, timesheetData!);
            const mergedArray = daysOfIntervalWithHour.map(elem => {
                const isDateWeekend = isWeekend(elem.day);
                const match = dates.find(
                    (elem2: TRange) =>
                        isEqual(elem2.day, elem.day) &&
                        isWithinInterval(elem.day, { start: startDate, end: endDate })
                );

                return match ? match : { ...elem, hours: isDateWeekend ? '' : elem.hours };
            });
            setOriginalDates(mergedArray);
        }
    }, [startDate, endDate, dates, timesheetData]);

    return (
        <Container $borderRadius={borderRadius}>
            {showCalendarHeader && <CalendarHeaderContainer>{renderHeader(startDate!, endDate!)}</CalendarHeaderContainer>}
            <table>
                <thead>
                    <tr>
                        {weekdays.map((day, i) => (
                            <CustomTh $fonttSize={isDinamic ? '10' : '12'} $backgound={isDinamic ? '#FFF' : '#C3E1D2'} key={i}>{day}</CustomTh>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {originalDates.map((_: any, i: any) => {
                        if (i % 7 === 0) {
                            return (
                                <Fragment key={i}>
                                    <CustomTr $backgound={isDinamic ? '#E8F4EE' : '#FFF'}>
                                        {originalDates.slice(i, i + 7).map((item, j) => {
                                            const isHoliday = isDateHoliday(holidays, item.day) && !isDinamic 
                                            return (<CellDate $isHoliday={isHoliday} $isTimesheet={!isDinamic} key={j}>
                                                {dateFormat(item.day, 'shortMonth')} {getDate(new Date(item.day))}
                                                {isHoliday && (
                                                    <HolidayIcon className="header_icon" />
                                                )}
                                            </CellDate>)}
                                        )}
                                    </CustomTr>
                                    <CustomInputTr>
                                        {originalDates.slice(i, i + 7).map((item, j) => {
                                            if (!isWithinInterval(item.day, { start: startDate!, end: endDate! }) && isDinamic) {
                                                return <td key={j}><input disabled /></td>;
                                            }
                                            if (!isDinamic) {
                                                return (
                                                    <td key={j}>
                                                        <CellContainer className={item.time_off ? 'approved' : !item.active ? 'disabled' : isDateHoliday(holidays, item.day) ? 'holiday' : ' '}>
                                                            <CellData>
                                                                {!item.active ? ' ' : item.time_off || Number(item.hours) || '-'}
                                                            </CellData>
                                                        </CellContainer>
                                                    </td>
                                                );
                                            }
                                            return (
                                                <td key={j}>
                                                    <NumericFormat
                                                        disabled={true}
                                                        decimalSeparator="."
                                                        decimalScale={2}
                                                        valueIsNumericString
                                                        value={item.hours === '0' ? '' : +item.hours % 1 === 0 ? parseInt(item.hours) : item.hours}
                                                        isAllowed={({ value }) => +value <= 24}
                                                        placeholder=""
                                                    />
                                                </td>
                                            );
                                        })}
                                    </CustomInputTr>
                                </Fragment>
                            );
                        }
                        return null;
                    })}
                </tbody>
            </table>
        </Container>
    );
}


const Container = styled.div<{$borderRadius: number }>`
    ${({ $borderRadius }) => (`
        width: 100%;
        border: 1px solid #ddd;
        border-radius: ${$borderRadius}px;
        overflow: auto;

        table {
            border-collapse: collapse;
            border-style: hidden;
            width: 100%;
        }

        table tr td, th {
            border: 0.5px solid #ddd;
        }

        & tr:last-child td:first-child {
            & > input {
                border-bottom-left-radius: ${$borderRadius - 1}px;
            };
        }
                
        & tr:last-child td:last-child {
            & > input {
                border-bottom-right-radius: ${$borderRadius - 1}px;
            };
        }
    `)}
`;

const CalendarHeaderContainer = styled.div`
    display: flex; 
    flex: 1;
    justify-content: center;
    background-color: #172B37;
    color: #FFF;
    padding: 4px;
`;

const CustomTh = styled.th<{$fonttSize: string, $backgound: string}>`
    color: #00101A;
    font-size: ${(props) => props.$fonttSize}px;
    padding: 5px;
    text-align: center;
    background-color: ${(props) => props.$backgound};
`;

const CustomTr = styled.tr<{$backgound: string}>`
    background-color: ${(props) => props.$backgound};
`;

const CustomInputTr = styled.tr`
    & > td {
        & > input {
            width: 100%;
            height: 50px;
            background-color: #FFF;
            border: 0.5px solid transparent;
            text-align: center;
            font-size: 13px;
            color: #00101A;
            &:focus, &:hover {
                border: 0.5px solid #99CC33;
            }
            &:disabled {
                background-color: #F3F3F3;
            }
        }
    }
`;

const CellContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: 50px;
    background-color: #FFF;
    &.approved {
        color: #C54343;
        background-color: #FDEDEE;
    }
    &.disabled {
        color: #F3F3F3;
        background-color: #F3F3F3;
    }
    &.holiday {
        background-color: #FFF6ED;
    }
`;

const CellDate = styled.td<{$isHoliday: boolean, $isTimesheet: boolean}>`
    position: relative;
    color: #00101A;
    background-color: ${props => (props.$isHoliday && '#FBE5CB') || props.$isTimesheet && '#F3F9F6'};
    font-size: 11px;
    padding: 5px;
    text-align: center;
    & svg{
        position: absolute;
        bottom: 0px;
        right: 0px;
    }
`;

const CellData = styled.span`
    width: 100%;
    height: 16px;
    text-align: center;
    font-size: 18px;
    font-family: 'Aspira Demi', 'FiraGO Medium';
`;