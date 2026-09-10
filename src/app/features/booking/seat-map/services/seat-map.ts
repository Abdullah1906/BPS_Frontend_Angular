import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environments';
import { TripSeatDto } from '../../models/trip-seat.model';

@Injectable({
  providedIn: 'root'
})
export class SeatMapService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/v1/admin/trips`;

  getSeats(tripId: number): Observable<TripSeatDto[]> {
    return this.http.get<TripSeatDto[]>(
      `${this.apiUrl}/${tripId}/seats`
    );
  }
}