import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { Trip, CreateTripRequest, UpdateTripRequest } from '../models/trip.model';

@Injectable({
  providedIn: 'root'
})
export class TripService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Trips`;

  getAll(): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.apiUrl}/getall`);
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