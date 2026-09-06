import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { RouteDto, CreateRouteDto, UpdateRouteDto } from '../models/route.model';

@Injectable({
  providedIn: 'root',
})
export class Route {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/v1/admin/routes`;

  getAll(): Observable<RouteDto[]> {
    return this.http.get<RouteDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<RouteDto> {
    return this.http.get<RouteDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateRouteDto): Observable<RouteDto> {
    return this.http.post<RouteDto>(this.baseUrl, dto);
  }

  update(id: number, dto: UpdateRouteDto): Observable<RouteDto> {
    return this.http.put<RouteDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  updateStatus(id: number, isActive: boolean): Observable<RouteDto> {
    return this.http.patch<RouteDto>(`${this.baseUrl}/${id}/status`, { isActive });
  }
}