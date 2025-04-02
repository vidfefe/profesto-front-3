
export const months = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

export const FORM_PATTERNS = {
  required: {
    value: true,
    message: "required_field",
  },
  email: {
    value: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    message: "please_enter_valid_email",
  },
  phone: {
    value: /^[0-9]*$/,
    message: "incorrect_phone_format",
  },
  password: {
    value: /^(?=(.*[a-zA-Z]){1})(?=(.*\d)).{6,64}$/,
    message: "min_symbols",
  },
  lowercase:{
    value: /(?=.*[a-z])/,
    message: 'no_lowercase_digits'
  },
  uppercase:{
    value: /(?=.*[A-Z])/,
    message: 'no_uppercase_digits'
  },
  oneDigit: {
    value: /(?=.*\d)/,
    message: 'no_digits'
  },
  minEightChars:{
    value: /^.{8,}$/,
    message: 'min_chars'
  },
  domain:{
    value: /^[a-z0-9_\-]+$/,
    message: 'domain_is_not_valid'
  },
  gpa:{
    value: /^([1-9]?\d|4)$/,
    message: 'gpa_validation' 
  },
  ssn: {
    value: /^\d{9}$/,
    message: 'ssn' 
  },
  personalNumber: {
    value: /^\d{11}$/,
    message: 'personal_number_char' 
  }
};
