import { Component, inject,computed, signal, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TripService } from '../services/trip';
import { Trip , TripPagedResponse} from '../models/trip.model';
import { DatePipe } from '@angular/common';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  takeUntil
} from 'rxjs';

@Component({
  selector: 'app-trip-list',
  standalone: true,
  imports:  [DatePipe],
  templateUrl: './trip-list.html',
  styleUrl: './trip-list.scss'
})
export class TripList implements OnInit, OnDestroy {

  private readonly tripService = inject(TripService);
  private readonly router = inject(Router);

  trips = signal<Trip[]>([]);
  loading = false;
  errorMessage = '';


  searchTerm = signal('');

  //protected readonly Math = Math;
  private readonly searchSubject =
    new Subject<string>();

  private readonly destroy$ =
    new Subject<void>();


  // ✅ Pagination signals

  currentPage = signal(1);

  itemsPerPage = signal(10);

  totalCount = signal(0);

  totalPages = signal(0);

  ngOnInit(): void {
    this.setupSearch();
    this.loadTrips();
  }

  private setupSearch(): void {

    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(search => {

        this.searchTerm.set(search);

        this.currentPage.set(1);

        this.loadTrips();
      });
  }


  loadTrips(): void {

    this.loading = true;

    this.errorMessage = '';


    this.tripService
      .getPaged(
        this.searchTerm(),
        this.currentPage(),
        this.itemsPerPage()
      )
      .subscribe({

        next: (
          response: TripPagedResponse
        ) => {

          this.trips.set(
            response.items
          );

          this.totalCount.set(
            response.totalCount
          );

          this.totalPages.set(
            response.totalPages
          );

          this.loading = false;
        },

        error: (error) => {

          console.error(
            'Load trips error:',
            error
          );

          this.errorMessage =
            'Unable to load trips.';

          this.loading = false;
        }
      });
  }

   onSearch(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    this.searchSubject.next(
      input.value
    );
  }


   // ✅ Pagination controls
  goToPage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages()
    ) {
      return;
    }

    this.currentPage.set(page);

    this.loadTrips();
  }


  nextPage(): void {

    if (
      this.currentPage() <
      this.totalPages()
    ) {

      this.currentPage.update(
        page => page + 1
      );

      this.loadTrips();
    }
  }


  prevPage(): void {

    if (
      this.currentPage() > 1
    ) {

      this.currentPage.update(
        page => page - 1
      );

      this.loadTrips();
    }
  }


  // ============================
  // Page Size
  // ============================

  changeItemsPerPage(
    event: Event
  ): void {

    const select =
      event.target as HTMLSelectElement;

    this.itemsPerPage.set(
      Number(select.value)
    );

    this.currentPage.set(1);

    this.loadTrips();
  }


  create(): void {
    this.router.navigate(['/trips/create']);
  }

  edit(id: number): void {
    this.router.navigate(['/trips', id, 'edit']);
  }

  delete(id: number): void {
    const confirmed = confirm('Are you sure you want to delete this trip?');

    if (!confirmed) {
      return;
    }

    this.tripService.delete(id).subscribe({
      next: () => {

          if (
            this.trips().length === 1 &&
            this.currentPage() > 1
          ) {

            this.currentPage.update(
              page => page - 1
            );
          }

          this.loadTrips();
        },
      error: (error) => {
        console.error('Delete trip error:', error);
        this.errorMessage = 'Unable to delete trip.';
      }
    });
  }


  get currentFrom(): number {
    if (this.totalCount() === 0) {
      return 0;
    }

    return (
      (this.currentPage() - 1)
      * this.itemsPerPage()
    ) + 1;
  }

  get currentTo(): number {
    return Math.min(
      this.currentPage() * this.itemsPerPage(),
      this.totalCount()
    );
  }

  ngOnDestroy(): void {

    this.destroy$.next();

    this.destroy$.complete();

    this.searchSubject.complete();
  }
  clearSearch(): void {

    this.searchTerm.set('');

    this.currentPage.set(1);

    this.loadTrips();
  }
}