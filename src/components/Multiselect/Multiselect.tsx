import React from 'react';
import { Checkbox, Chip, styled } from '@mui/material';
import { AxiosResponse } from 'axios';

import SelectDropdown from 'components/Dropdowns/SelectDropdown';
import { isEmployee, isEmployeeDependent } from './typeGuards';

type MultiselectProps<T extends unknown> = {
  errorText: string | undefined;
  placeholder: string;
  onChange: (value: unknown) => void;
  value: T;
  loadRemoteData: () => Promise<AxiosResponse<any>>;
  onAddItem?: () => void;
};

const getLabel = (option: unknown): string => {
  if (isEmployeeDependent(option)) {
    return `${option.first_name} ${option.last_name} - ${option.relationship.name}`;
  } else if (isEmployee(option)) {
    return `${option.first_name} ${option.last_name}`;
  }
  return '';
};

export const Multiselect = <T extends unknown>({
  errorText,
  placeholder,
  onChange,
  value,
  loadRemoteData,
  onAddItem,
}: MultiselectProps<T>) => {
  return (
    <SelectDropdown
      disableCloseOnSelect
      inputPlaceholder={placeholder}
      onChange={(_, value) => onChange(value)}
      multiple
      value={value}
      sx={{
        input: {
          width: '80% !important',
        },
      }}
      inputStyle={{
        height: 'auto',
        minHeight: 67,
      }}
      loadRemoteData={loadRemoteData}
      errorText={errorText}
      freeSolo={!!onAddItem}
      onAddItem={onAddItem}
      getOptionLabel={(option) => getLabel(option)}
      ListboxProps={{
        style: {
          maxHeight: '170px',
        },
      }}
      renderOption={(props, option, { selected }) => {
        return (
          <li {...props}>
            <Checkbox style={{ marginRight: 8 }} checked={selected} />
            {getLabel(option)}
          </li>
        );
      }}
      renderTags={(value, getTagProps) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {value.map((item, index) => (
            <Tag {...getTagProps({ index })} label={getLabel(item)} size={'small'} />
          ))}
        </div>
      )}
    />
  );
};

const Tag = styled(Chip)`
  font: unset;
  width: fit-content;
`;
