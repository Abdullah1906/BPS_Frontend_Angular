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
import Swal from 'sweetalert2';

type PaginationItem = number | '...';

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


  getPaginationItems(): PaginationItem[] {

    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 5) {
      return Array.from(
        { length: total },
        (_, i) => i + 1
      );
    }

    const pages: PaginationItem[] = [];

    pages.push(1);

    if (current > 4) {
      pages.push('...');
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    if (current < total - 3) {
      pages.push('...');
    }

    pages.push(total);

    return pages;
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
  Swal.fire({
    title: 'Are you sure?',
    text: 'You will not be able to recover this trip record!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545', 
    cancelButtonColor: '#6c757d',  
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, cancel'
  }).then((result) => {
    

    if (result.isConfirmed) {
      this.tripService.delete(id).subscribe({
        next: () => {
          Swal.fire({
            title: 'Deleted!',
            text: 'The trip has been successfully deleted.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });

          if (this.trips().length === 1 && this.currentPage() > 1) {
            this.currentPage.update(page => page - 1);
          }

          this.loadTrips();
        },
        error: (error) => {
          console.error('Delete trip error:', error); 
          Swal.fire({
            title: 'Error!',
            text: 'Unable to delete the trip. Please try again.',
            icon: 'error'
          });
        }
      });
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