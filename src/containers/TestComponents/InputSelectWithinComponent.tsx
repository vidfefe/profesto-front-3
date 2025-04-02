import React from 'react';
import InputWithSelect from 'components/Dropdowns/InputWithSelect';
import { getCurrencies } from '../../services';

export const InputSelectWithinComponent = () => {
    const [value, setStateValue] = React.useState(null);
    const onChange = (obj: any) => {
        setStateValue(obj)
    };

    return (
        <div style={{ width: 350, marginTop: 30 }}>
            <InputWithSelect
                label='Input With Select'
                validateToDecimal
                onChange={onChange}
                value={value}
                inputProps={{
                    placeholder: 'Enter Value',
                }}
                selectProps={{
                    loadRemoteData: () => getCurrencies(55, 1),
                    endAdornmentPlaceholder: 'USD'
                }}
            />
        </div>
    )
};