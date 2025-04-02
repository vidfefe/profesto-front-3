import {
  AdditionalEarningStatus,
  AdditionalEarningType,
  DeductionStatus,
  PaymentDocumentType,
} from './enums';

export type BenefitMutationInput = {
  name: string;
  benefit_type_id: number;
  coverage_type: string;
  currency_id: number;
  total_cost: string;
  employee_pays: string;
  start_on: Date;
  end_on: Date | null;
};

export type EmployeeDependentInput = {
  employee_id: number;
  first_name: string;
  last_name: string;
  birth_date: Date;
  gender?: string;
  personal_number: string;
  relationship_id: number;
};

export type EmployeeBenefitInput = {
  employee_id: number;
  start_on: Date;
  end_on?: Date | null;
  benefit_id: number;
  benefit_completion_reason_id?: number | null;
  participant_ids: number[];
};

export type TimesheetTimesInput = {
  employee_id: number;
  effective_date: Date;
  work_hours?: number;
  night_hours?: number;
  overtime_hours?: number;
  other_hours?: number;
};

export type TimesheetBulkInput = {
  start_date?: Date;
  end_date?: Date;
  dates?: Date[];
  work_hours?: number;
  type: 'period' | 'dates' | 'standard' | 'custom';
  department_id?: number;
  employees: { employee_id: number; dates: Date[] }[];
};

export type CalendarRange = {
  id?: number;
  time_off_day: Date;
  time_off_hour: string;
};

export type TimeOffRequestMutation = {
  automatic_approval: boolean;
  employee_id: number;
  time_off_type_id: number | undefined;
  time_off_period: string;
  requested_hours: number | null;
  date_from: string | Date;
  date_to: string | Date;
  note: string;
  time_off_hours_attributes?: CalendarRange[];
};

export type DeductionMutationInput = {
  deduction_status: DeductionStatus;
  name: string;
};

export type AdditionalEarningMutationInput = {
  name: string;
  additional_earning_status?: AdditionalEarningStatus;
};

export type RunPayrollMutationInput = {
  payment_date: Date;
  payment_schedule_id: number;
  period_start: Date;
  period_end: Date;
  payment_document_type: string;
};

export type PaymentDocumentAdditionalMutationInput = {
  additional_earning_id: number;
  payment_earning_id: number;
  amount: number | null;
};

export type PaymentDocumentPayTypeMutationInput = {
  id: number;
  amount: number;
};

export type EmploymentStatusMutationInput = {
  income_tax: string | number;
  name: string;
  employee_pays_pension_tax: boolean;
};

export type PaymentDocumentDeductionMutationInput = {
  payment_employment_compensation_id: number;
  deduction_id: number;
  amount: number | null;
};

export type ActiveEmployeeInput = {
  effective_date: string | undefined;
};

export type AdvancePaymentMutationInput = {
  payment_date: Date;
  payment_document_type: PaymentDocumentType;
  employee_ids: Array<number>;
};

export type AdvancePaymentAmountMutationInput = {
  id: number;
  amount: number | null;
};

export type AdvancePaymentEmployeeMutationInput = {
  payment_document_id: number;
  employee_ids: Array<number>;
};

export type AdvanceDeductionMutationInput = {
  payment_document_id: number;
  employee_id: number;
  amount: number;
};
