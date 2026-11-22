
import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environments';

import {
  MonthlyPayrollResponse,
  UpdatePayrollAdjustmentRequest,
  ProcessSalaryPaymentRequest,
  Payroll,
  PayrollListResponse
} from '../models/payroll.model';

@Injectable({
  providedIn: 'root'
})
export class PayrollService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/v1/admin/payroll`;

  // Generate monthly payroll
  generatePayroll(monthYear: string): Observable<unknown> {

    const params = new HttpParams()
      .set('monthYear', monthYear);

    return this.http.post(
      `${this.apiUrl}/generate`,
      null,
      { params }
    );
  }

  // Get monthly payroll
  
    getMonthlyPayroll(
        monthYear: string,
        roleType: string,
        paymentStatus: string,
        search: string,
        page: number = 1,
        pageSize: number = 10
    ): Observable<PayrollListResponse> {

    let params = new HttpParams()
        .set('monthYear', monthYear)
        .set('page', page)
        .set('pageSize', pageSize);

    if (roleType) {
        params = params.set('roleType', roleType);
    }

    if (paymentStatus) {
        params = params.set('paymentStatus', paymentStatus);
    }

    if (search.trim()) {
        params = params.set('search', search.trim());
    }

    return this.http.get<PayrollListResponse>(
        this.apiUrl,
        { params }
    );
    }

  // Update bonus and deduction
  updateAdjustment(
    paymentId: number,
    request: UpdatePayrollAdjustmentRequest
  ): Observable<unknown> {

    return this.http.put(
      `${this.apiUrl}/${paymentId}/adjustment`,
      request
    );
  }

  // Process salary payment
  processPayment(
    paymentId: number,
    request: ProcessSalaryPaymentRequest
  ): Observable<Payroll> {

    return this.http.put<Payroll>(
      `${this.apiUrl}/${paymentId}/pay`,
      request
    );
  }


  

}
