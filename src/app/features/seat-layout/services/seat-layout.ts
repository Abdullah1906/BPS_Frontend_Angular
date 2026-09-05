import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environments';
import {
  BusSeatDto,
  CreateBusSeatDto,
  UpdateBusSeatDto
} from '../models/bus-seat-model';

@Injectable({
  providedIn: 'root'
})
export class SeatLayoutService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/v1/admin/buses`;

  getAll(busId: number): Observable<BusSeatDto[]> {
    return this.http.get<BusSeatDto[]>(`${this.baseUrl}/${busId}/seats`);
  }

  create(busId: number, dto: CreateBusSeatDto): Observable<BusSeatDto> {
    return this.http.post<BusSeatDto>(`${this.baseUrl}/${busId}/seats`, dto);
  }

  update(busId: number, id: number, dto: UpdateBusSeatDto): Observable<BusSeatDto> {
    return this.http.put<BusSeatDto>(`${this.baseUrl}/${busId}/seats/${id}`, dto);
  }

  delete(busId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${busId}/seats/${id}`);
  }

  changeStatus(busId: number, id: number, isActive: boolean): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/${busId}/seats/${id}/status`,
      { isActive }
    );
  }
}