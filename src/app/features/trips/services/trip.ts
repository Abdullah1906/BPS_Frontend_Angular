import { Injectable, inject } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { Trip, CreateTripRequest, UpdateTripRequest,TripPagedResponse } from '../models/trip.model';

@Injectable({
  providedIn: 'root'
})
export class TripService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Trips`;

  // getAll(): Observable<Trip[]> {
  //   return this.http.get<Trip[]>(`${this.apiUrl}/getall`);
  // }


  getPaged(
    search: string,
    page: number,
    pageSize: number
  ): Observable<TripPagedResponse> {

    let params =
      new HttpParams()
        .set('page', page)
        .set('pageSize', pageSize);

    if (search.trim()) {

      params =
        params.set(
          'search',
          search.trim()
        );
    }

    return this.http.get<TripPagedResponse>(
      `${this.apiUrl}/getpaged`,
      { params }
    );
  }

  getById(id: number): Observable<Trip> {
    return this.http.get<Trip>(`${this.apiUrl}/get/${id}`);
  }

  create(request: CreateTripRequest): Observable<Trip> {
    return this.http.post<Trip>(`${this.apiUrl}/create`, request);
  }

  update(id: number, request: UpdateTripRequest): Observable<Trip> {
    return this.http.put<Trip>(`${this.apiUrl}/update/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}