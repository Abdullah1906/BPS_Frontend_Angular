import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environments';
import { BusDto, CreateBusDto, UpdateBusDto } from '../models/bus.model';

@Injectable({
  providedIn: 'root'
})
export class BusService {

  private readonly http = inject(HttpClient);
 private readonly baseUrl = `${environment.apiUrl}/v1/admin/buses`;

  getAll(): Observable<BusDto[]> {
    return this.http.get<BusDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<BusDto> {
    return this.http.get<BusDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateBusDto): Observable<BusDto> {
    return this.http.post<BusDto>(this.baseUrl, dto);
  }

  update(id: number, dto: UpdateBusDto): Observable<BusDto> {
    return this.http.put<BusDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  changeStatus(id: number, isActive: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/status`, { isActive });
  }
}