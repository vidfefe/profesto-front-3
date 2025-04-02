import React from 'react';
import EnumDropdown from 'components/Dropdowns/EnumDropdown';

export const EnumSelectDropdownComponent = ({size}: any) => {
    const [value, setValue] = React.useState('');
    const handleChange = (val: any) => {
        setValue(val.target.value);
    };

    const list = [
        {
            id: 1,
            id_name: "single",
            name: "Single"
        },
        {
            id: 2,
            id_name: "married",
            name: "Married"
        },
        {
            id: 3,
            id_name: "common_law",
            name: "Common Law"
        },
        {
            id: 4,
            id_name: "domestic_partner",
            name: "Domestic Partner"
        }
    ]

    return (
        <div style={{ width: 350, marginTop: 30 }}>
            <p style={{ marginBottom: 5 }}>Enum Select</p>
            <EnumDropdown
                onChange={handleChange}
                value={value}
                options={list}
                placeholder={'No Selection'}
                size={size}
            />
        </div>
    )
};