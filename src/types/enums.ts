export enum PaymentTypeCategory {
  REGULAR = 'regular_pay',
  ADDITIONAL = 'additional_hourly_pay',
}

export enum PaymentTypeClass {
  SALARY = 'salary',
  HOURLY = 'hourly',
  PERFORMANCE = 'performance_based',
  OVERTIME = 'overtime_hours',
  NIGHT = 'night_hours',
  HOLIDAY = 'holiday_hours',
}

export enum DeductionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum AdditionalEarningStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum AdditionalEarningType {
  RECURRING = 'recurring_earning',
  ONE_TIME = 'one_time_earning',
}

export enum PaymentDocumentType {
  REGULAR_PAYROLL = 'regular_payroll',
  OFF_CYCLE_PAYROLL = 'off_cycle_payroll',
  ADVANCE_PAYMENT = 'advance_payment',
}

export enum PaymentDocumentStatus {
  DRAFT = 'draft',
  APPROVED = 'approved',
  CANCELLED = 'cancelled',
}

export enum TimeOffStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  DENIED = 'denied',
}
