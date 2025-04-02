import React from 'react';
import SelectDropdown from 'components/Dropdowns/SelectDropdown';
import { getCountryList, getManagerList, getNationalities, createNationality } from "../../services";
import DictionaryModal from "components/Dropdowns/SelectWithAdd/DictionaryModal";

export const SelectDropdownComponent = ({ size }: any) => {
    const [value, setStateValue] = React.useState(null);
    const [manager, setManager] = React.useState(null);
    const [nationality, setNationality] = React.useState<any>(null);
    const [nationalityReq, setNationalityReq] = React.useState<any>(null);
    const [nationalityInput, setNationalityInput] = React.useState<any>('');
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);

    const onChange = (_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
        setStateValue(newValue)
    };
    const onChangeManager = (_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
        setManager(newValue)
    };

    const onChangeNationality = (_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
        if (typeof newValue === 'string') {
            setTimeout(() => {
                handleOpen()
                setNationalityInput(newValue);
            });
        } else if (newValue && newValue.inputValue) {
            handleOpen();
            setNationalityInput(newValue.inputValue);
        } else {
            setNationality(newValue);
        }
    };

    return (
        <div style={{ width: 350, marginTop: 5 }}>
            <div style={{ marginBottom: 30 }}>
                <SelectDropdown
                    isOptionEqualToValue={(option: any, value: any) => option.name !== value.full_name}
                    getOptionLabel={(option: any) => option.name ?? option}
                    onChange={onChange}
                    value={value}
                    inputPlaceholder='No Selection'
                    loadRemoteData={() => getCountryList(200, 1)}
                    size={size}
                    required
                    label='Select without add / Country List'
                />
            </div>
            <div style={{ marginBottom: 30 }}>
                <p style={{ marginBottom: 5 }}>Employee Select</p>
                <SelectDropdown
                    isOptionEqualToValue={(option: any, value: any) => option.name !== value.id}
                    getOptionLabel={(option: any) => option.name ?? option}
                    onChange={onChangeManager}
                    value={manager}
                    inputPlaceholder='No Selection'
                    loadRemoteData={() => getManagerList(25, 1)}
                    withPic
                    size={size}
                />
            </div>

            <div style={{ marginBottom: 30 }}>
                <p style={{ marginBottom: 5 }}>Creatable Select</p>
                <SelectDropdown
                    selectOnFocus
                    clearOnBlur
                    onChange={onChangeNationality}
                    value={nationality}
                    inputPlaceholder='No Selection'
                    loadRemoteData={() => getNationalities(100, 1)}
                    freeSolo
                    size={size}
                    onAddItem={() => { handleOpen(); setNationalityInput(''); }}
                />
            </div>

            <div style={{ marginBottom: 10 }}>
                <p style={{ marginBottom: 5 }}>Required Select</p>
                <SelectDropdown
                    selectOnFocus
                    clearOnBlur
                    onChange={(_event: React.SyntheticEvent<Element, Event>, newValue: any) => {
                        setNationalityReq(newValue)
                    }}
                    errorText={nationalityReq ? '' : 'This field is required'}
                    value={nationalityReq}
                    inputPlaceholder='No Selection'
                    loadRemoteData={() => getNationalities(100, 1)}
                    freeSolo
                    size={size}
                    onAddItem={() => { handleOpen(); setNationalityInput(''); }}
                />
            </div>

            <DictionaryModal
                open={open}
                setOpen={setOpen}
                name='Nationality'
                inputText={nationalityInput}
                onValueChange={setNationality}
                setInputText={setNationalityInput}
                createRequest={createNationality}
            />
        </div>
    )
};