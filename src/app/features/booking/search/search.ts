import { Component, inject } from '@angular/core';
import { CommonModule,DatePipe } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { TripSearchService } from '../search/service/search';
import { TripSearchResponse } from '../models/trip-search.model';
import { Router } from '@angular/router';
import { BookingStateService } from '../services/booking-state.service';
@Component({
  selector: 'app-trip-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './search.html',
  styleUrl: './search.scss',
  providers: [DatePipe]
})
export class TripSearchComponent {

  private readonly fb = inject(FormBuilder);
  private readonly tripSearchService = inject(TripSearchService);
  private readonly datePipe = inject(DatePipe);
  private readonly router = inject(Router);
  private readonly bookingState = inject(BookingStateService);


  private getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`; 
  }

  // For Today date as a default value
  todayDate: string = this.getTodayDate();

  trips: TripSearchResponse[] = [];

  loading = false;
  searched = false;
  errorMessage = '';

  searchForm = this.fb.nonNullable.group({
    fromPlace: ['', Validators.required],
    toPlace: ['', Validators.required],
    tripDate: [this.todayDate, Validators.required]
  });

  searchTrips(): void {

    this.errorMessage = '';
    this.searched = false;

    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const {
      fromPlace,
      toPlace,
      tripDate
    } = this.searchForm.getRawValue();

    if (
      fromPlace.trim().toLowerCase() ===
      toPlace.trim().toLowerCase()
    ) {
      this.errorMessage =
        'From place and To place cannot be the same.';
      return;
    }
    const formattedDate = this.datePipe.transform(tripDate, 'yyyy-MM-dd') || tripDate;
    this.loading = true;

    this.tripSearchService
      .searchTrips(
        fromPlace.trim(),
        toPlace.trim(),
        formattedDate
      )
      .subscribe({
        next: (response) => {
          this.trips = response;
          this.loading = false;
          this.searched = true;
        },

        error: (error) => {
          console.error(error);

          this.loading = false;
          this.searched = true;
          this.trips = [];

          this.errorMessage =
            error?.error?.message ??
            'Unable to search trips. Please try again.';
        }
      });
  }

  selectTrip(trip: TripSearchResponse): void {
    console.log('Selected Trip:', trip);
    console.log('Selected Bus Name:', trip.busName);

    if (trip && trip.tripId) {

      this.bookingState.setBusName(trip.busName);
      this.bookingState.setTripFare(trip.fare);
      this.bookingState.setDiscount((trip as any).discount ?? 0);

      //this.router.navigate(['/booking/seat-map', trip.tripId]);
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/booking/seat-map', trip.tripId])
      );
      
      window.open(url, '_blank');
    }
  }

  formatTime(time: string): string {

    if (!time) {
      return '';
    }

    const [hours, minutes] = time.split(':');

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}