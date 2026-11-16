
import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environments';

import {
  Staff,
  StaffDetails,
  CreateStaffRequest,
  UpdateStaffRequest,
  UpdateStaffStatusRequest,
  PagedResponse
} from '../models/staff.model';

@Injectable({
  providedIn: 'root'
})
export class StaffService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/v1/admin/staff`;

  getStaffList(
    page = 1,
    pageSize = 10,
    search = '',
    roleType = '',
    status = ''
  ): Observable<PagedResponse<Staff>> {

    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    if (roleType) {
      params = params.set('roleType', roleType);
    }

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PagedResponse<Staff>>(
      this.apiUrl,
      { params }
    );
  }

  getStaffById(id: number): Observable<StaffDetails> {
    return this.http.get<StaffDetails>(
      `${this.apiUrl}/${id}`
    );
  }

  createStaff(
    request: CreateStaffRequest
  ): Observable<unknown> {
    return this.http.post(
      this.apiUrl,
      request
    );
  }

  updateStaff(
    id: number,
    request: UpdateStaffRequest
  ): Observable<unknown> {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  updateStaffStatus(
    id: number,
    request: UpdateStaffStatusRequest
  ): Observable<unknown> {
    return this.http.patch(
      `${this.apiUrl}/${id}/status`,
      request
    );
  }

  deactivateStaff(id: number): Observable<unknown> {
    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }
}
