
export type PaymentStatus = 'Paid' | 'Unpaid';

export type PaymentMethod =
  | 'Cash'
  | 'Bkash'
  | 'Bank Transfer';

export interface Payroll {
  paymentId: number;
  staffId: number;
  fullName: string;
  phoneNumber: string;
  roleType: string;

  payrollMonth: string;

  baseSalary: number;
  bonusAmount: number;
  deductionAmount: number;
  netPayable: number;

  adjustmentRemarks?: string | null;

  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod | null;
  transactionRef?: string | null;
  paidAt?: string | null;
}

export interface PayrollSummary {
  totalStaff: number;
  paidCount: number;
  unpaidCount: number;
  totalPayable: number;
  totalPaid: number;
  totalUnpaid: number;
}

export interface MonthlyPayrollResponse {
  items: Payroll[];
  summary: PayrollSummary;
}

export interface UpdatePayrollAdjustmentRequest {
  bonusAmount: number;
  deductionAmount: number;
  adjustmentRemarks?: string | null;
}

export interface ProcessSalaryPaymentRequest {
  paymentMethod: PaymentMethod;
  transactionRef?: string | null;
  remarks?: string | null;
}

export interface PayrollPagination {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface PayrollListResponse {
  items: Payroll[];
  summary: PayrollSummary;

  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}