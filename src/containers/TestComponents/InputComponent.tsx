import React from 'react';
import UniversalInput from 'components/Input/UniversalInput';

export const InputComponent = ({size}: any) => {
    const [isPass, setIsPass] = React.useState(false);
    const [value, setValue] = React.useState('');
    const [value1, setValue1] = React.useState('');
    return (
        <div style={{ width: 350, marginTop: 30 }}>
            <p style={{ marginBottom: 5 }}>Inputs</p>
            <UniversalInput
                onChange={(event: any) => setValue(event.target.value)}
                value={value}
                placeholder='Password'
                type={!isPass ? `password` : 'text'}
                withEyeAdornment={true}
                onEyeAdornmentClick={() => setIsPass(!isPass)}
                visiblePlaceholder={size === 'small' ? false : !!value}
                errorText={""}
                size={size}
            />
            <div style={{ marginTop: 15 }}>
                <UniversalInput
                    onChange={(event: any) => setValue1(event.target.value)}
                    value={value1}
                    placeholder='Email'
                    visiblePlaceholder={size === 'small' ? false : !!value1}
                    errorText={""}
                    size={size}
                />
            </div>
        </div>
    )
};