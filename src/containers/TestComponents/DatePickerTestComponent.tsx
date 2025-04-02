import React from 'react';
import DatePicker from 'components/DatePickers/DatePicker';

export const DatePickerTestComponent = () => {
    const [startDate, setStartDate] = React.useState<any>(new Date());

    return (
        <div style={{ width: 350, marginTop: 30 }}>
            <DatePicker
                selected={startDate}
                onChange={setStartDate}
                label="Date Picker"
            />
        </div>
    )
};