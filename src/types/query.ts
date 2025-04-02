import { IEmployeeMainInfo } from 'containers/Employee/timeOff';
import {
  AdditionalEarningStatus,
  AdditionalEarningType,
  DeductionStatus,
  PaymentDocumentStatus,
  PaymentTypeCategory,
  PaymentTypeClass,
} from './enums';

export type ErrorMessage = {
  field?: string;
  message: string;
  type?: string;
};

export type ErrorPayload = {
  errors: Array<ErrorMessage>;
  status: number;
};

export type EmployeeDependent = {
  id: number;
  age: number;
  first_name: string;
  birth_date: Date;
  last_name: string;
  gender?: Gender;
  personal_number: string;
  relationship: Relationship;
};

type Dictionary = {
  id: string;
  name: string;
};

export type BenefitType = {
  id: number;
  name: string;
};

export type CoverageType = {
  id: string;
  name: string;
};

export type Gender = {
  id: string;
  name: string;
};

export type Currency = {
  id: number;
  code: string;
  name: string;
  priority: boolean;
  symbol: string;
};

export type Benefit = {
  id: number;
  name: string;
  benefit_type: BenefitType;
  coverage_type: CoverageType;
  total_cost: string;
  employee_pays: string;
  company_pays: string;
  start_on: Date;
  end_on?: Date;
  currency: Currency;
  status: string;
};

type EmployeeContactInfo = {
  id: number;
  facebook: string | null;
  home_phone: string | null;
  linkedin: string | null;
  mobile_phone: string | null;
  personal_email: string | null;
  twitter: string | null;
  work_email: string | null;
  work_phone: string | null;
  work_phone_ext: string | null;
};

type ActiveJobDetail = {
  id: number;
  department: null;
  division: null;
  effective_date: Date;
  effective_time: string;
  employment_status: {
    id: number;
    id_name: string | null;
    name: string;
  };
  hiring_date: Date;
  job_title: {
    id: number;
    name: string;
  };
  location: null;
};

type EmployeeEmploymentDetail = {
  id: number;
  contract_end_date: Date | null;
  experience: string;
  hire_date: Date;
  probation_end_date: Date | null;
};

export type Manager = {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  photo: boolean;
  preferred_name?: string;
  uuid?: string;
};

export type Person = {
  id: number;
  active_job_detail: ActiveJobDetail | null;
  employee_contact_info: EmployeeContactInfo;
  employee_employment_detail: EmployeeEmploymentDetail | null;
  first_name: string;
  future_operation: null;
  last_name: string;
  onboarding: {
    onboarding_status: {
      id: string;
    };
  };
  other_last_name: string | null;
  preferred_name: string | null;
  revenue_data: null;
  role: {
    id: number;
    name: string;
  };
  status: string;
  subordinates: [];
  uuid?: string;
};

export type Role = {
  current_role: boolean;
  description: string;
  id: number;
  id_name: string;
  name: string;
  user_count: number;
};

export type Relationship = {
  id: number;
  name: string;
  deleted: boolean;
};

export type BenefitCompletionReason = {
  id: number;
  name: string;
};

export type EmployeeBenefit = {
  id: number;
  benefit: Benefit;
  benefit_completion_reason: BenefitCompletionReason;
  end_on: Date;
  end_date?: Date;
  participants: EmployeeDependent[];
  start_on: Date;
  status: string;
};

export type Employee = {
  id: number;
  uuid: number | null;
  first_name: string;
  last_name: string;
  pin?: string;
};

export type MonthChnagesReport = {
  id: number;
  bank_account: string;
  change_type: string;
  comment: string | null;
  currency: {
    code: string | null;
    symbol: string | null;
  };
  department: string;
  employee: Employee;
  employment_status: string;
  end_date: string;
  job_title: string;
  mobile_phoneo: string | null;
  personal_number: string;
  prev_currency: {
    code: string | null;
    symbol: string | null;
  };
  prev_department: string | null;
  prev_employment_status: string | null;
  prev_job_title: string | null;
  prev_salary_gross: number | null;
  prev_salary_net: number | null;
  reason: string;
  salary_gross: number;
  salary_net: number;
  start_date: string;
};

export type Timesheet = {
  day: string;
  time_off: string;
  active: boolean;
  work_hours: number;
  night_hours: number;
  overtime_hours: number;
  other_hours: number;
};

export type Time = {
  employee: Employee;
  job_information: {
    job_title: string;
  };
  timesheet: Timesheet[];
};

type Holidays = {
  date: string;
  name: string;
  regions: string[];
};

export type TimesheetTimes = {
  data?: Time[];
  holidays?: Holidays[];
};

type StatusChanges = {
  created_at: string | Date;
  status: Dictionary;
  employee: IEmployeeMainInfo;
};

export type TimeOffType = {
  id: number;
  name: string;
  open_date: boolean;
};

export type TimeOffRequest = {
  id: number;
  time_off_type: TimeOffType;
  time_off_status: Dictionary;
  date_from: any;
  date_to: any;
  time_off_hours: any;
  requested_hours: number;
  requested_days: number;
  note: string;
  hours: any;
  status_changes: [StatusChanges];
};

export type EmployeeTimesheet = {
  holidays: Array<{
    date: string;
    name: string;
    regions: string[];
  }>;
  data: Time & {
    summary: {
      work_data: {
        general: {
          days: number;
          hours: string;
        };
        details: Array<{
          type: string;
          hours: string;
        }>;
      };
      time_off_data: {
        general: {
          days: number;
          hours: string;
        };
        details: Array<{
          time_off_type_name: string;
          time_off_type_abbreviation: string;
          hours: string;
          days: number;
        }>;
      };
    };
  };
};

export type PaymentType = {
  id: number;
  name: string;
  category: {
    id: PaymentTypeCategory;
    name: string;
  };
  class: {
    id: PaymentTypeClass;
    name: string;
  };
  multiplier: string | null;
};

export type Deduction = {
  id: number;
  name: string;
  status: {
    id: DeductionStatus;
    name: string;
  };
};

export type AdditionalEarning = {
  id: number;
  name: string;
  status: {
    id: AdditionalEarningStatus;
    name: string;
  };
};

export type CompanyFeatures = {
  id: number;
  payroll: boolean;
  time_tracking: boolean;
};

export type PaymentDocumentCurrencyRate = {
  code: string;
  rate: string;
};

export type PaymentDocument = {
  id: number;
  currency_rates: PaymentDocumentCurrencyRate[];
  payment_date: string;
  payment_document_status: {
    id: PaymentDocumentStatus;
    name: string;
  };
  period_end: string;
  period_start: string;
};

export type PaymentDocuments = Array<{
  id: number;
  net_pay: string;
  payment_date: Date;
  period_start: string;
  period_end: string;
  payment_document_type: {
    id: string;
    name: string;
  };
  currency: { id: number; code: string; symbol: string };
  payment_document_status: {
    id: string;
    name: string;
  };
  total_payroll_cost: string;
}>;

type PaymentDocumentEmployee = {
  id: number;
  first_name: string;
  last_name: string;
  department_name: string;
  job_title_name: string;
  personal_number: string;
  uuid: string | null;
};

export type PaymentEarning = {
  id: number;
  employee: PaymentDocumentEmployee;
  pay_rate: {
    amount: string;
    currency: string;
    period: string;
  };
  pay_types: Array<{
    id: number;
    changeable: boolean;
    name: string;
    hours: number;
    amount: string;
    payment_type_id: number;
  }>;
  time_offs: Array<{
    id: number;
    name: string;
    hours: number;
    amount: string;
  }>;
  additional: Array<{
    id: number;
    name: string;
    amount: string;
    additional_earning_id: number;
  }>;
  earning: {
    month_hours: number;
    total_net: string;
    period_start: string;
    period_end: string;
  };
};

export type PaymentBenefit = {
  id: number;
  employee: PaymentDocumentEmployee;
  benefits: Array<{
    id: number;
    name: string;
    total_cost: string;
    company_pays: string;
    currency: string;
  }>;
  deductions: Array<{
    id: number;
    deduction_id: number;
    amount: string;
  }>;
  advance_payment_deduction: {
    left: string;
    deduction_amount: string;
  } | null;
  period_start: string;
  period_end: string;
  take_to_home: string;
  total_net_amount: string;
};

export type PaymentSummary = {
  advance_payment_deduction: {
    left: string;
    deduction_amount: string;
  } | null;
  employee: PaymentDocumentEmployee;
  total_net_amount: string;
  benefits_company_pays: string;
  income_tax: string;
  pension_fund_employee: string;
  total_gross_amount: string;
  benefits_total_cost: string;
  deductions: string;
  take_to_home: string;
  pension_fund_company: string;
  total_payroll_cost: string;
};

export type PaymentDocumentEarning = {
  id: number;
  columns: {
    payment_types: Array<{
      id: number;
      name: string;
      payment_type_class: PaymentTypeClass;
    }>;
    time_off_types: Array<{
      id: number;
      name: string;
    }>;
    additional_earnings: Array<{
      id: number;
      name: string;
    }>;
  };
  list: PaymentEarning[];
  currency: string;
  total_net: string;
  total_paid_time_off_hours: number;
  total_working_hours: number;
};

export type PaymentDocumentBenefit = {
  id: number;
  benefits: string;
  deductions: string;
  columns: {
    advance_payment: boolean;
    benefits: Array<{
      id: number;
      name: string;
    }>;
    deductions: Array<{
      id: number;
      name: string;
    }>;
  };
  list: PaymentBenefit[];
  currency: string;
  take_to_home: string;
};

export type PaymentDocumentSummary = {
  advance_payment: boolean;
  id: number;
  company_pays: string;
  currency: string;
  employee_pays: string;
  list: PaymentSummary[];
  take_to_home: string;
  total_payroll_cost: string;
};

export type PaymentDocumentMutationPayload = {
  id: number;
  total_net_document: string;
  total_net_row: string;
};

export type EmploymentStatus = {
  income_tax: string;
  name: string;
  employee_pays_pension_tax: boolean;
};

export type PaymentDocumentDeductionsMutationPayload = {
  id: number;
  deductions_document: string;
  take_to_home_document: string;
  take_to_home_row: string;
};

export type PayrollMonthData = {
  company_pays: string;
  employee_pays: string;
  net_pay: string;
  total_cost: string;
};

export type ExportPaymentDocumentData = {
  bank_account: string;
  employee: string;
  personal_number: string;
  amount: string;
};

export type ExportPaymentDocumentPayload = Array<ExportPaymentDocumentData>;

export type AdvancePayment = {
  employee: PaymentDocumentEmployee;
  id: number;
  pay_rate: {
    amount: string;
    currency: string;
    period: string;
  };
  income_tax_amount: string;
  pension_fund_employee_pays: string;
  pension_fund_company_pays: string;
  total_net_amount: string;
  total_gross_amount: string;
  total_cost_amount: string;
};

export type AdvancePaymentDocument = {
  id: number;
  advance_payments: Array<AdvancePayment>;
  currency: string;
  advance_payment_amount: string;
  payment_date: string;
  total_cost: string;
  status: PaymentDocumentStatus;
};

export type AdvancePaymentPayload = {
  id: number;
  advance_payments: string;
  row: AdvancePayment;
  total_cost: string;
};

export type AdvanceDeductionMutationPayload = {
  id: number;
  deduction_amount: string;
  left: string;
  deductions_document: string;
  take_to_home_document: string;
  take_to_home_row: string;
};
export type CompanyPermissionSettings = {
  id: number;
  manager_timesheet_management: boolean;
}
