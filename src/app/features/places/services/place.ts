import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import { environment } from '../../../../environments/environments';

import {
  Place,
  CreatePlaceRequest,
  UpdatePlaceRequest
} from '../models/place.model';


@Injectable({
  providedIn: 'root'
})
export class PlaceService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/Place`;


  // GET ALL
  getAll(): Observable<Place[]> {

    return this.http.get<Place[]>(
      `${this.apiUrl}/getall`
    );
  }

  getAllByActive(): Observable<Place[]> {

    return this.http.get<Place[]>(
      `${this.apiUrl}/getallbyactive`
    );
  }


  // GET BY ID
  getById(
    id: number
  ): Observable<Place> {

    return this.http.get<Place>(
      `${this.apiUrl}/get/${id}`
    );
  }


  // CREATE
  create(
    request: CreatePlaceRequest
  ): Observable<Place> {

    return this.http.post<Place>(
      `${this.apiUrl}/create`,
      request
    );
  }


  // UPDATE
  update(
    id: number,
    request: UpdatePlaceRequest
  ): Observable<Place> {

    return this.http.put<Place>(
      `${this.apiUrl}/update/${id}`,
      request
    );
  }


  // DELETE
  delete(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/delete/${id}`
    );
  }
}