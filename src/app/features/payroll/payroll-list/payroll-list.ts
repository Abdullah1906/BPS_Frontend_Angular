
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { PayrollService } from '../services/payroll.service';

import {
  Payroll,
  PayrollSummary,
  PaymentMethod,
  UpdatePayrollAdjustmentRequest,
  ProcessSalaryPaymentRequest
} from '../models/payroll.model';

@Component({
  selector: 'app-payroll-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './payroll-list.html',
  styleUrl: './payroll-list.scss'
})
export class PayrollList implements OnInit {

  private readonly payrollService = inject(PayrollService);

  payrollList: Payroll[] = [];

  summary: PayrollSummary = {
    totalStaff: 0,
    paidCount: 0,
    unpaidCount: 0,
    totalPayable: 0,
    totalPaid: 0,
    totalUnpaid: 0
  };

  // Filters
  selectedMonth = this.getCurrentMonth();
  selectedRole = '';
  selectedStatus = '';
  search = '';

  readonly roles = [
    'Driver',
    'Supervisor',
    'Helper',
    'Office Staff'
  ];

  readonly paymentMethods: PaymentMethod[] = [
    'Cash',
    'Bkash',
    'Bank Transfer'
  ];

  // Loading states
  loading = false;
  generating = false;
  submitting = false;

  // Adjustment modal
  showAdjustmentModal = false;

  selectedPayroll: Payroll | null = null;

  bonusAmount = 0;
  deductionAmount = 0;
  adjustmentRemarks = '';

  // Payment modal
  showPaymentModal = false;

  paymentMethod: PaymentMethod = 'Cash';
  transactionRef = '';
  paymentRemarks = '';

  ngOnInit(): void {
    this.loadPayroll();
  }

  // SweetAlert helpers
  private showSuccess(message: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#198754'
    });
  }

  private showError(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#dc3545'
    });
  }

  private showWarning(message: string): void {
    Swal.fire({
      icon: 'warning',
      title: 'Warning!',
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#f0ad4e'
    });
  }

  private getErrorMessage(
    error: any,
    fallback: string
  ): string {
    return (
      error?.error?.message ||
      error?.error?.title ||
      error?.message ||
      fallback
    );
  }


  // Server-side pagination
  page = 1;
  pageSize = 10;

  totalRecords = 0;
  totalPages = 0;

  get visiblePages(): number[] {
    const start = Math.max(1, this.page - 2);
    const end = Math.min(this.totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    return Array.from(
      { length: end - adjustedStart + 1 },
      (_, index) => adjustedStart + index
    );
  }


  get pages(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, index) => index + 1
    );
  }

  get startRecord(): number {
    return this.totalRecords === 0
      ? 0
      : (this.page - 1) * this.pageSize + 1;
  }

  get endRecord(): number {
    return Math.min(
      this.page * this.pageSize,
      this.totalRecords
    );
  }

  // Current month: YYYY-MM
  private getCurrentMonth(): string {
    const date = new Date();

    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`;
  }

  // Convert YYYY-MM to MM-yyyy
  get monthYear(): string {
    const [year, month] = this.selectedMonth.split('-');

    return `${month}-${year}`;
  }

  // Load payroll

    loadPayroll(): void {
    if (!this.selectedMonth) return;

    this.loading = true;

    this.payrollService.getMonthlyPayroll(
      this.monthYear,
      this.selectedRole,
      this.selectedStatus,
      this.search,
      this.page,
      this.pageSize
    ).subscribe({
      next: response => {

        this.payrollList = response.items ?? [];

        this.summary = response.summary ?? {
          totalStaff: 0,
          paidCount: 0,
          unpaidCount: 0,
          totalPayable: 0,
          totalPaid: 0,
          totalUnpaid: 0
        };

        this.page = response.page;
        this.pageSize = response.pageSize;
        this.totalRecords = response.totalRecords;
        this.totalPages = response.totalPages;

        this.loading = false;
      },

      error: error => {
        console.error('Payroll loading failed:', error);

        this.loading = false;

        this.showError(
          this.getErrorMessage(
            error,
            'Failed to load payroll information.'
          )
        );
      }
    });
  }

  // Search
  onSearch(): void {
    this.page = 1;
    this.loadPayroll();
  }

  // Filter
  onFilterChange(): void {
     this.page = 1;
    this.loadPayroll();
  }

  clearFilters(): void {

    this.search = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.page = 1;

    this.loadPayroll();
  }

  // Generate payroll
  async generatePayroll(): Promise<void> {

    if (!this.selectedMonth || this.generating) {
      return;
    }

    const result = await Swal.fire({
      title: 'Generate Payroll?',
      text: `Are you sure you want to generate payroll for ${this.monthYear}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Generate',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      reverseButtons: true
    });

    if (!result.isConfirmed) {
      return;
    }

    this.generating = true;

    this.payrollService.generatePayroll(
      this.monthYear
    ).subscribe({

      next: (response) => {

        this.generating = false;

        this.showSuccess(
          'Monthly payroll generated successfully.'
        );

        this.loadPayroll();
      },

      error: (error) => {

        console.error('Payroll generation failed:', error);

        this.generating = false;

        this.showError(
          this.getErrorMessage(
            error,
            'Unable to generate payroll.'
          )
        );
      }

    });
  }

  // Open adjustment modal
  openAdjustment(payroll: Payroll): void {

    if (payroll.paymentStatus === 'Paid') {
      return;
    }

    this.selectedPayroll = payroll;

    this.bonusAmount = payroll.bonusAmount;
    this.deductionAmount = payroll.deductionAmount;

    this.adjustmentRemarks =
      payroll.adjustmentRemarks ?? '';

    this.showAdjustmentModal = true;
  }

  closeAdjustmentModal(): void {

    this.showAdjustmentModal = false;
    this.selectedPayroll = null;

    this.bonusAmount = 0;
    this.deductionAmount = 0;
    this.adjustmentRemarks = '';
  }

  // Save adjustment
  async saveAdjustment(): Promise<void> {

    if (!this.selectedPayroll || this.submitting) {
      return;
    }

    if (
      this.bonusAmount < 0 ||
      this.deductionAmount < 0
    ) {
      this.showWarning(
        'Bonus and deduction cannot be negative.'
      );

      return;
    }

    if (this.adjustedNetPayable < 0) {
      this.showWarning(
        'Net payable amount cannot be negative.'
      );

      return;
    }

    const result = await Swal.fire({
      title: 'Save Adjustment?',
      text: 'Are you sure you want to update this salary adjustment?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Save',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      reverseButtons: true
    });

    if (!result.isConfirmed) {
      return;
    }

    const request: UpdatePayrollAdjustmentRequest = {

      bonusAmount: Number(this.bonusAmount),

      deductionAmount: Number(this.deductionAmount),

      adjustmentRemarks:
        this.adjustmentRemarks.trim() || null

    };

    this.submitting = true;

    this.payrollService.updateAdjustment(
      this.selectedPayroll.paymentId,
      request
    ).subscribe({

      next: () => {

        this.submitting = false;

        this.closeAdjustmentModal();

        this.showSuccess(
          'Payroll adjustment updated successfully.'
        );

        this.loadPayroll();
      },

      error: (error) => {

        console.error('Adjustment failed:', error);

        this.submitting = false;

        this.showError(
          this.getErrorMessage(
            error,
            'Unable to update payroll adjustment.'
          )
        );
      }

    });
  }

  // Calculate net payable in UI
  get adjustedNetPayable(): number {

    if (!this.selectedPayroll) {
      return 0;
    }

    return (
      this.selectedPayroll.baseSalary +
      Number(this.bonusAmount) -
      Number(this.deductionAmount)
    );
  }

  // Open payment modal
  openPayment(payroll: Payroll): void {

    if (payroll.paymentStatus === 'Paid') {
      return;
    }

    this.selectedPayroll = payroll;

    this.paymentMethod = 'Cash';
    this.transactionRef = '';
    this.paymentRemarks = '';

    this.showPaymentModal = true;
  }

  closePaymentModal(): void {

    this.showPaymentModal = false;
    this.selectedPayroll = null;

    this.transactionRef = '';
    this.paymentRemarks = '';
    this.paymentMethod = 'Cash';
  }

  // Process salary payment
  async processPayment(): Promise<void> {

    if (!this.selectedPayroll || this.submitting) {
      return;
    }

    if (
      this.paymentMethod !== 'Cash' &&
      !this.transactionRef.trim()
    ) {
      this.showWarning(
        'Transaction reference is required.'
      );

      return;
    }

    const payroll = this.selectedPayroll;

    const result = await Swal.fire({
      title: 'Confirm Salary Payment?',
      html: `
        <div style="text-align:left">
          <p>Employee:
            <strong>${this.escapeHtml(payroll.fullName)}</strong>
          </p>
          <p>Amount:
            <strong>৳${payroll.netPayable.toLocaleString('en-US')}</strong>
          </p>
          <p>Payment Method:
            <strong>${this.paymentMethod}</strong>
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Pay Now',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      reverseButtons: true
    });

    if (!result.isConfirmed) {
      return;
    }

    const request: ProcessSalaryPaymentRequest = {

      paymentMethod: this.paymentMethod,

      transactionRef:
        this.paymentMethod === 'Cash'
          ? null
          : this.transactionRef.trim(),

      remarks: this.paymentRemarks.trim() || null

    };

    this.submitting = true;

    this.payrollService.processPayment(
      payroll.paymentId,
      request
    ).subscribe({

      next: () => {

        this.submitting = false;

        this.closePaymentModal();

        this.showSuccess(
          'Salary payment processed successfully.'
        );

        this.loadPayroll();
      },

      error: (error) => {

        console.error('Salary payment failed:', error);

        this.submitting = false;

        this.showError(
          this.getErrorMessage(
            error,
            'Unable to process salary payment.'
          )
        );
      }

    });
  }

  // Escape user-provided HTML before using SweetAlert html
  private escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (char) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };

      return entities[char];
    });
  }

  // Helpers
  get isCashPayment(): boolean {
    return this.paymentMethod === 'Cash';
  }

  get totalNetPayable(): number {
    return this.summary.totalPayable;
  }

  get totalPaid(): number {
    return this.summary.totalPaid;
  }

  get totalUnpaid(): number {
    return this.summary.totalUnpaid;
  }

  get totalRecord(): number {
    return this.payrollList.length;
  }

  changePage(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.page ||
      this.loading
    ) {
      return;
    }

    this.page = page;
    this.loadPayroll();
  }

  previousPage(): void {
    this.changePage(this.page - 1);
  }

  nextPage(): void {
    this.changePage(this.page + 1);
  }

  changePageSize(size: number): void {
    if (size < 1 || size > 100) return;

    this.pageSize = size;
    this.page = 1;

    this.loadPayroll();
  }

  validateAmount(
    field: 'bonus' | 'deduction',
    event: Event
  ): void {

    const input = event.target as HTMLInputElement;

    let value = input.value.replace(/[^0-9.]/g, '');

    // Only one decimal point
    const parts = value.split('.');

    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    // Maximum 2 decimal places
    const [integer, decimal] = value.split('.');

    if (decimal !== undefined) {
      value = integer + '.' + decimal.slice(0, 2);
    }

    input.value = value;

    const amount = value === '' ? 0 : Number(value);

    if (field === 'bonus') {
      this.bonusAmount = amount;
    } else {
      this.deductionAmount = amount;
    }
  }

}
