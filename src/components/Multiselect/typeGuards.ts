import { Employee, EmployeeDependent } from 'types';

export const isEmployee = (option: unknown): option is Employee => {
  return (
    !!option &&
    typeof option === 'object' &&
    Object.prototype.hasOwnProperty.call(option, 'first_name') &&
    Object.prototype.hasOwnProperty.call(option, 'last_name')
  );
};

export const isEmployeeDependent = (option: unknown): option is EmployeeDependent => {
  return (
    !!option &&
    typeof option === 'object' &&
    Object.prototype.hasOwnProperty.call(option, 'first_name') &&
    Object.prototype.hasOwnProperty.call(option, 'last_name') &&
    Object.prototype.hasOwnProperty.call(option, 'relationship')
  );
};
