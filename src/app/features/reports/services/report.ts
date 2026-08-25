import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { Report, ReportFilter } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/Report`;

  get(filter: ReportFilter): Observable<Report[]> {

    let params = new HttpParams();

    if (filter.fromDate) {
      params = params.set('FromDate', filter.fromDate);
    }

    if (filter.toDate) {
      params = params.set('ToDate', filter.toDate);
    }

    if (filter.placeId) {
      params = params.set('PlaceId', filter.placeId.toString());
    }

    if (filter.period) {
      params = params.set('Period', filter.period);
    }

    return this.http.get<Report[]>(`${this.apiUrl}/get`, { params });
  }
}