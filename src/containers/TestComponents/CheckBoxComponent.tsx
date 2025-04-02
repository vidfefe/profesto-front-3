import React from 'react';
import Checkbox from "components/Checkbox";

export const CheckboxComponent = () => {
    const [checked, setChecked] = React.useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked);
    };

    return (
        <div style={{ width: 350, marginTop: 5 }}>
            <p style={{ marginBottom: 5 }}>Checkbox</p>
            <Checkbox
                checked={checked}
                onChange={handleChange}
                label={'I Agree To The'}
                labelLink="https://testfront.profesto.net/"
                labelLinkText='Terms And Conditions'
            />
        </div>
    )
};