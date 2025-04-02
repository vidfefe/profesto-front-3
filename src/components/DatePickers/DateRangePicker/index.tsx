import React, { useEffect, useState } from "react";
import DatePicker from './../DatePicker';
import styled from "styled-components";

type DateRangePickerProps = {
    onChangeDate: any;
    initialDates: any;
    initialValue?: { startDate: Date; endDate: Date };
};

const DateRangePicker = ({onChangeDate, initialDates, initialValue}: DateRangePickerProps) => {
    const [startDate, setStartDate] = useState<any>(initialValue?.startDate ? new Date(initialValue.startDate) : null);
    const [endDate, setEndDate] = useState<any>(initialValue?.endDate ? new Date(initialValue.endDate) : null);

    useEffect(() => {
        if (initialDates) {
            setStartDate(new Date(new Date().getFullYear(), 0, 1))
            setEndDate(new Date(new Date().getFullYear(), 11, 31))
        }
    }, [initialDates])


    useEffect(() => {
        onChangeDate({
            start: startDate,
            end: endDate
        })
    }, [startDate, endDate]);



    return (
        <RangePickerContainer>
            <FlexBlock>
                <DatePicker
                    selected={startDate}
                    onChange={setStartDate}
                    style={{width: 100}}
                    width="120"
                />
            </FlexBlock>
            <Diveder>-</Diveder>
            <FlexBlock>
                <DatePicker
                    selected={endDate}
                    onChange={setEndDate}
                    minDate={startDate}
                    width="120"
                />
            </FlexBlock>
        </RangePickerContainer>
    )
}
const RangePickerContainer = styled.div `
    display: flex;
    gap: 10px;
    margin-right: 10px;
    align-items: center;
`
const FlexBlock = styled.div `
`
const Diveder = styled.div `
    
`
export default DateRangePicker;