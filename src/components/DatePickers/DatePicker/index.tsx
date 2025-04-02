import { useState, Fragment, forwardRef, useImperativeHandle, useRef, useEffect, CSSProperties } from "react";
import ReactDatePicker, { registerLocale, CalendarContainer, ReactDatePickerProps } from "react-datepicker";
import { NumberFormatBase } from 'react-number-format';
import styled from "styled-components";
import { range } from "lodash";
import getYear from "date-fns/getYear";
import getMonth from "date-fns/getMonth";
import getDay from "date-fns/getDay";
import isMatch from "date-fns/isMatch";
import "react-datepicker/dist/react-datepicker.css";
import { months } from '../../../constants';
import { ReactComponent as CalendarIcon } from 'assets/svg/calendar.svg';
import { ReactComponent as ArrowIcon } from 'assets/svg/arrow.svg';
import { useTranslation } from "react-i18next";
import {ka, enUS} from 'date-fns/locale';
import { placeholderFormat } from "lib/DateFormat";

function CustomDateNumberFormat(props: any) {
    const dateFormatter = (val: string) => {
        let dateForm = '';
        if (process.env.REACT_APP_DATEFORMAT === 'EUR') {
            let day = val.substring(0, 2);
            let month = val.substring(4, 2);
            let year = val.substring(4, 8);
            dateForm = day + (month.length ? '/' + month : '') + (year.length ? '/' + year : '');
        }
        else {
            let month = val.substring(0, 2);
            let day = val.substring(2, 4);
            let year = val.substring(4, 8);
            dateForm = month + (day.length ? '/' + day : '') + (year.length ? '/' + year : '');
        }

        return dateForm;
    };

    return <NumberFormatBase {...props} format={dateFormatter} />;
};

const europianDateFormat = (dateString: string) => {
    if (process.env.REACT_APP_DATEFORMAT === 'EUR') {

        let parts = dateString.split('/'),
            day = parseInt(parts[0], 10),
            month = parseInt(parts[1], 10) - 1,
            year = parseInt(parts[2], 10);

        return new Date(year, month, day);
    }
    else {
        return new Date(dateString);
    }
}

interface IDatePicker extends Omit<ReactDatePickerProps, 'selected'> {
    containerStyle?: CSSProperties;
    selected: Date | null | undefined | string,
    errorText?: string | any,
    errorWithoutText?: boolean
    label?: string,
    size?: 'small' | 'medium',
    style?: any,
    width?: string
};

/**
 * @param selected should be `null` if invalid date error and empty string `''` if empty input
 */
const DatePicker = forwardRef<ReactDatePicker<string, boolean | undefined>, IDatePicker>(
    function DatePicker({ errorText, errorWithoutText, label, required, onChange, width, size = 'small', selected, disabled, containerStyle, ...rest }, ref) {
        const { t, i18n } = useTranslation('translation', { keyPrefix: 'components.datepicker' });
        const [isOpen, setIsOpen] = useState<boolean>(false);
        const [invalidDate, setInvalidDate] = useState<boolean>(false);
        const inputRef = useRef<any>(null);
        const years = range(1901, 2100);


        useEffect(() => {
            if (i18n.language === 'ka') {
                registerLocale(i18n.language, ka);
            }
            else {
                registerLocale(i18n.language, enUS);
            }
        }, [])


        useImperativeHandle(ref as any, () => {
            return {
                focus() {
                    inputRef.current.input.focus();
                },
            };
        }, []);

        const CalendarContainer = ({ children }: any) => {
            return (
                <CustomCalendarContainer>{children}</CustomCalendarContainer>
            );
        };

        const customHeader = ({
            date,
            changeYear,
            changeMonth,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
        }: any) => {
            return (
                <CustomHeaderContainer>
                    <button type="button" onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
                        <div>
                            <ArrowIcon style={{ transform: 'rotate(90deg)' }} />
                        </div>
                    </button>
                    <div>
                        <StyledNativeSelect
                            value={getYear(date)}
                            onChange={(e) => changeYear(e.target.value)}
                        >
                            {years.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </StyledNativeSelect>
                        <StyledNativeSelect
                            value={months[getMonth(date)]}
                            onChange={(e) => changeMonth(months.indexOf(e.target.value))}
                        >
                            {months.map((option) => {
                                return (
                               
                                    <option key={option} value={option}>
                                        {t(option)}
                                    </option>
                                )
                            })}
                        </StyledNativeSelect>
                    </div>
                    <button type="button" onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
                        <div>
                            <ArrowIcon style={{ transform: 'rotate(-90deg)' }} />
                        </div>
                    </button>
                </CustomHeaderContainer>
            )
        };

        const customBottom = (
            <StyledCustomBottom>
                <div>{t('today')}</div>
                <div onClick={(event) => {
                    event.stopPropagation();
                    setInvalidDate(false);
                    onChange('' as any, event);
                }}>{t('clear')}</div>
            </StyledCustomBottom>
        );

        const customMatch = (val: string, format: string) => val.length === format.length && isMatch(val, format);


        return (
            <Fragment>
                {label ? <StyledInputLabel>{label}{required && <sup>*</sup>}</StyledInputLabel> : null}
                <StylerReactCalendarContainer style={{ position: 'relative', ...containerStyle }}>
                    <StyledReactDatePickerInput
                        onCalendarOpen={() => setIsOpen(true)}
                        onCalendarClose={() => setIsOpen(false)}
                        onKeyDown={(event: any) => {
                            if (event.key === 'Enter') {
                                setIsOpen(prev => !prev);
                            }
                        }}
                        locale={i18n.language}
                        popperProps={{ strategy: 'fixed' }}
                        open={isOpen}
                        preventOpenOnFocus
                        selected={selected as Date}
                        onChange={(date: Date, event: any) => {
                            if (!(event && event.target.value) && date !== null) {
                                onChange(date, event);
                                setInvalidDate(false);
                                setIsOpen(false);
                            }
                        }}
                        onChangeRaw={(event) => {
                            if (event?.currentTarget?.value?.length === 0) {
                                setInvalidDate(false);
                                onChange('' as any, event);
                            }
                            if (event?.currentTarget?.value?.length === 10) {
                                if (customMatch(event?.currentTarget?.value, process.env.REACT_APP_DATEFORMAT === 'EUR' ? 'dd/MM/yyyy' : 'MM/dd/yyyy')) {
                                    setInvalidDate(false);
                                    const date: any = europianDateFormat(event?.currentTarget?.value);
                                    onChange(date, event);

                                } else {
                                    onChange(null, event);
                                }
                            } else if (event?.currentTarget?.value?.length !== 0) {
                                onChange(null, event);
                                if (event?.currentTarget?.value) {
                                    setInvalidDate(!customMatch(event?.currentTarget?.value, process.env.REACT_APP_DATEFORMAT === 'EUR' ? 'dd/MM/yyyy' : 'MM/dd/yyyy'));
                                }
                            }
                        }}
                        todayButton={customBottom}
                        calendarContainer={CalendarContainer}
                        renderCustomHeader={customHeader}
                        customInput={<CustomDateNumberFormat />}
                        placeholderText={placeholderFormat(true, t)}
                        dateFormat={placeholderFormat(false, t)}
                        required={required}
                        customInputRef={'getInputRef'}
                        ref={inputRef}
                        disabled={disabled}
                        $helperText={errorText ? errorText : invalidDate}
                        $size={size}
                        $width={width}
                        {...rest}
                    />
                    <StyledCalendarIcon $isOpen={isOpen} $size={size} />
                </StylerReactCalendarContainer>
                {!errorWithoutText && errorText ? <StyledHelperText>{errorText}</StyledHelperText> : null}
            </Fragment>
        );
    }
);

export default DatePicker;

const StylerReactCalendarContainer = styled.div`
    .react-datepicker-popper[data-placement^=bottom], .react-datepicker-popper[data-placement^=top] {
        padding-top: 2px;
        width: 400px;
        z-index: 99;
    }
    .react-datepicker__header {
        background-color: #FFF;
        border-bottom: none;
        padding: 0;
    }
    .react-datepicker__day-names {
        background-color: rgba(220, 238, 229, .7);
        padding: 5px 30px;
        font: normal normal normal 14px/19px 'Aspira Regular', 'FiraGO Regular';
        color: #00101A;
        display: flex;
        justify-content: space-between;
    }
    .react-datepicker__month {
        background-color: rgba(220, 238, 229, .3);
        padding: 14px 24px;
        margin: 0;
        justify-content: space-around;
        align-items: center;
    }
    .react-datepicker__week {
        display: flex;
        justify-content: space-between;
    }
    .react-datepicker__day {
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        color: #000;
        height: 35px;
        width: 35px;
    }
    .react-datepicker__day:hover {
        border-radius: 50%;
        background-color: #dceee5;
        color: #339966;
    }
    .react-datepicker__day--disabled {
        color: #9C9C9C;
        cursor: not-allowed;
        &:hover {
            color: #9C9C9C;
        }
    }
    .react-datepicker__day--selected {
        font-size: 12px;
        background-color: #dceee5;
        color: #339966;
        outline-color: #339966;
    }
    .react-datepicker__day--keyboard-selected {
        background-color: #dceee5;
        color: #339966;
        outline: none;
    }
    .react-datepicker__today-button {
        background-color: #FFF;
        color: #339966;
        font: normal normal normal 14px/19px 'Aspira Regular', 'FiraGO Regular';
        padding: 17px;
        border-top: 1px solid #DCEEE5;
    }
    .react-datepicker__close-icon {
        margin-right: 30px
    }
    .react-datepicker__input-container {
        & > input:disabled {
            color:rgba(0,0,0,0.38);
        }
    }
`;

const CustomCalendarContainer = styled(CalendarContainer)`
    background-color: #FFF;
    border-radius: 2px;
    border: 1px solid #D6D6D6;
    box-shadow: 0px 3px 6px #00000029;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const CustomHeaderContainer = styled.div`
    margin: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    & > div {
        display: flex;
        justify-content: space-between;
        margin: 0 13px;
        width: 100%;
        gap: 13px;
    }
    & > button {
        all: unset;
        & > div {
            cursor: pointer;
            height: 35px; width: 35px;
            background-color: #EFEFEF;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            &:hover {
                background-color: #339966;
                & path {
                    fill: #FFF
                }
            }
        }
    }
`;

const StyledNativeSelect = styled.select`
    appearance: none;
    outline: none;
    cursor: pointer;
    flex: 1;
    border: 1px solid #D6D6D6;
    border-radius: 4px;
    padding: 13px;
    text-align: left;
    font-size: 12px;
    font-family: 'Aspira Regular', 'FiraGO Regular';
    background-color: #FFF;
    background-position: right center;
    background-repeat: no-repeat;
    background-origin: content-box;
    background-size: 2ex;
    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDEyIDEyIj48ZGVmcz48c3R5bGU+LmF7ZmlsbDpub25lO30uYntmaWxsOiNhM2EzYTM7fTwvc3R5bGU+PC9kZWZzPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKC05MDQgLTE3MSkiPjxyZWN0IGNsYXNzPSJhIiB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDkwNCAxNzEpIi8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoOTA1IDE3NCkiPjxwYXRoIGNsYXNzPSJiIiBkPSJNNS4zMTUsNi4wNmEuNzQyLjc0MiwwLDAsMS0uNTI2LS4yMThMLjIxOCwxLjI3MUEuNzQ0Ljc0NCwwLDAsMSwxLjI3MS4yMThMNS4zMTUsNC4yNjMsOS4zNi4yMThhLjc0NC43NDQsMCwwLDEsMS4wNTMsMS4wNTNMNS44NDEsNS44NDJBLjc0Mi43NDIsMCwwLDEsNS4zMTUsNi4wNloiLz48L2c+PC9nPjwvc3ZnPg==');
    &:hover, &:focus {
        border-color: #99CC33;
        
    }
`;

const StyledReactDatePickerInput = styled(ReactDatePicker) <{ $size: string, $width?: string, $helperText: string | undefined | boolean }>`
    border-radius: 4px;
    height: ${({ $size }) => $size === 'small' ? '40px' : '50px'};
    padding: 13px;
    border: ${({ $helperText }) => $helperText ? '1px solid #C54343 !important' : '1px solid #D6D6D6'};
    width: ${({ $width }) => $width ? $width+'px' : '100%'};
    color: #000;
    text-transform: capitalize;
    font-size: 12px;
    font-family: 'Aspira Regular', 'FiraGO Regular';
    &::placeholder {
        color: #9C9C9C;
        text-transform: lowercase;
    }
    &:hover, &:focus {
        border-color: #99CC33;
    }
    &:read-only {
        border-color: #D6D6D6;
    }
`;

const StyledCustomBottom = styled.div`
    display: flex;
    justify-content: center;
    & > div:first-child {
       margin-left: auto;
       position: absolute;
    }
    & > div:nth-child(2) {
        margin-left: auto;
    }
`;

const StyledCalendarIcon = styled(CalendarIcon) <{ $isOpen: boolean, $size: string }>`
    position: absolute;
    pointer-events: none;
    right: 12px;
    top: ${({ $size }) => $size === 'small' ? '13px' : '18px'};
    cursor: pointer;
    & * {
        fill: ${({ $isOpen }) => $isOpen ? '#396' : '#A3A3A3'} 
    }
`;

const StyledHelperText = styled.p`
    font-size: 10px;
    color: #C54343;
    margin-top: 5px;
`;

const StyledInputLabel = styled.p`
    color: #000;
    margin-bottom: 5px;
    & > sup {
        color: #C54343;
    }
`;