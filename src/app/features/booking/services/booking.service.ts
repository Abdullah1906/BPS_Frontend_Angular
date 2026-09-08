import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environments';

import {
  LockSeatsDto,
  LockSeatsResponseDto,
  ConfirmBookingDto,
  ConfirmBookingResponseDto
} from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/v1/bookings`;

  /**
   * Temporarily locks selected seats for the current customer.
   */
  lockSeats(
    request: LockSeatsDto
  ): Observable<LockSeatsResponseDto> {

    return this.http.post<LockSeatsResponseDto>(
      `${this.apiUrl}/lock-seats`,
      request
    );
  }

  /**
   * Confirms booking for previously locked seats.
   */
  confirmBooking(
    request: ConfirmBookingDto
  ): Observable<ConfirmBookingResponseDto> {

    return this.http.post<ConfirmBookingResponseDto>(
      `${this.apiUrl}/confirm`,
      request
    );
  }
}