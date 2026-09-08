import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TripSearchResponse } from '../../models/trip-search.model';
import { environment } from '../../../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class TripSearchService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/v1/admin/trips`;

  searchTrips(
    fromPlace: string,
    toPlace: string,
    tripDate: string
  ): Observable<TripSearchResponse[]> {

    const params = new HttpParams()
      .set('fromPlace', fromPlace)
      .set('toPlace', toPlace)
      .set('tripDate', tripDate);

    return this.http.get<TripSearchResponse[]>(
      `${this.apiUrl}/search`,
      { params }
    );
  }
}