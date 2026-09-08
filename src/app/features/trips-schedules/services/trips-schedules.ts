import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environments';

import {
  CreateTripScheduleDto,
  TripScheduleDto,
  UpdateTripScheduleDto,
  ChangeTripStatusDto
} from '../models/trips-schedules.model';

@Injectable({
  providedIn: 'root'
})
export class TripScheduleService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/v1/admin/trips`;

  // POST /api/v1/admin/trips
  create(request: CreateTripScheduleDto): Observable<TripScheduleDto> {

    return this.http.post<TripScheduleDto>(
      this.apiUrl,
      request
    );
  }

  // GET /api/v1/admin/trips
  getAll(): Observable<TripScheduleDto[]> {

    return this.http.get<TripScheduleDto[]>(
      this.apiUrl
    );
  }

  // GET /api/v1/admin/trips/{id}
  getById(
    id: number
  ): Observable<TripScheduleDto> {

    return this.http.get<TripScheduleDto>(
      `${this.apiUrl}/${id}`
    );
  }

  // PUT /api/v1/admin/trips/{id}
  update(
    id: number,
    request: UpdateTripScheduleDto
  ): Observable<boolean> {

    return this.http.put<boolean>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  // DELETE /api/v1/admin/trips/{id}
  delete(
    id: number
  ): Observable<boolean> {

    return this.http.delete<boolean>(
      `${this.apiUrl}/${id}`
    );
  }

  // PATCH /api/v1/admin/trips/{id}/status
  changeStatus(
    id: number,
    isActive: boolean
  ): Observable<boolean> {

    const request: ChangeTripStatusDto = {
      isActive
    };

    return this.http.patch<boolean>(
      `${this.apiUrl}/${id}/status`,
      request
    );
  }
}