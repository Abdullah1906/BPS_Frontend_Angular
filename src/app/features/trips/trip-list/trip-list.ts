import { Component, inject,computed, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TripService } from '../services/trip';
import { Trip } from '../models/trip.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-trip-list',
  standalone: true,
  imports:  [DatePipe],
  templateUrl: './trip-list.html',
  styleUrl: './trip-list.scss'
})
export class TripList implements OnInit {

  private readonly tripService = inject(TripService);
  private readonly router = inject(Router);

  trips = signal<Trip[]>([]);
  loading = false;
  errorMessage = '';


  // ✅ Pagination signals
  currentPage = signal(1);
  itemsPerPage = signal(10);

  // ✅ Paginated trips
  totalPages = computed(() => Math.ceil(this.trips().length / this.itemsPerPage()));

  paginatedTrips = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.trips().slice(start, end);
  });

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.loading = true;

    this.tripService.getAll().subscribe({
      next: (data) => {
        this.trips.set(data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Load trips error:', error);
        this.errorMessage = 'Unable to load trips.';
        this.loading = false;
      }
    });
  }


   // ✅ Pagination controls
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
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
      next: () => this.loadTrips(),
      error: (error) => {
        console.error('Delete trip error:', error);
        this.errorMessage = 'Unable to delete trip.';
      }
    });
  }
}