import { CommonModule } from '@angular/common';

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  Router,
  RouterLink
} from '@angular/router';

import { Pagination } from '../../../shared/components/pagination/pagination';

import {
  TripScheduleDto
} from '../models/trips-schedules.model';

import {
  TripScheduleService
} from '../services/trips-schedules';

@Component({
  selector: 'app-trip-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    Pagination
  ],
  templateUrl: './trip-list.html',
  styleUrl: './trip-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TripScheduleList {

  private readonly tripService =
    inject(TripScheduleService);

  private readonly router =
    inject(Router);

  readonly trips =
    signal<TripScheduleDto[]>([]);

  readonly loading =
    signal(false);

  readonly deleting =
    signal(false);

  readonly statusChangingId =
    signal<number | null>(null);

  readonly errorMessage =
    signal('');

  readonly successMessage =
    signal('');

  readonly searchTerm =
    signal('');

  readonly currentPage =
    signal(1);

  readonly pageSize = 10;

  readonly statusFilter =
    signal<'all' | 'active' | 'inactive'>('all');

  readonly filteredTrips = computed(() => {

    const search =
      this.searchTerm()
        .trim()
        .toLowerCase();

    const status =
      this.statusFilter();

    return this.trips().filter(trip => {

      const matchesSearch =
        !search ||
        trip.busName
          .toLowerCase()
          .includes(search) ||
        trip.busNumber
          .toLowerCase()
          .includes(search) ||
        trip.fromPlace
          .toLowerCase()
          .includes(search) ||
        trip.toPlace
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        status === 'all' ||
        (
          status === 'active' &&
          trip.isActive
        ) ||
        (
          status === 'inactive' &&
          !trip.isActive
        );

      return matchesSearch && matchesStatus;
    });
  });

  readonly paginatedTrips = computed(() => {

    const start =
      (this.currentPage() - 1) *
      this.pageSize;

    return this.filteredTrips()
      .slice(
        start,
        start + this.pageSize
      );
  });

  constructor() {

    this.loadTrips();
  }

  loadTrips(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.currentPage.set(1);

    this.tripService
      .getAll()
      .subscribe({

        next: response => {

          this.trips.set(response);

          this.loading.set(false);
        },

        error: error => {

          console.error(
            'Failed to load trip schedules',
            error
          );

          this.errorMessage.set(
            error?.error?.detail ??
            error?.error?.message ??
            'Failed to load trip schedules.'
          );

          this.loading.set(false);
        }
      });
  }

  onPageChange(page: number): void {

    this.currentPage.set(page);
  }

  onSearch(event: Event): void {

    const value =
      (event.target as HTMLInputElement)
        .value;

    this.searchTerm.set(value);

    this.currentPage.set(1);
  }

  setStatusFilter(
    filter: 'all' | 'active' | 'inactive'
  ): void {

    this.statusFilter.set(filter);

    this.currentPage.set(1);
  }

  viewSchedule(id: number): void {

    this.router.navigate([
      '/admin/trips/schedules/view',
      id
    ]);
  }

  editSchedule(id: number): void {

    this.router.navigate([
      '/admin/trips/schedules/edit',
      id
    ]);
  }

  deleteSchedule(
    schedule: TripScheduleDto
  ): void {

    const confirmed =
      confirm(
        `Are you sure you want to delete the trip schedule for ${schedule.busName} (${schedule.busNumber})?`
      );

    if (!confirmed) {
      return;
    }

    this.deleting.set(true);

    this.errorMessage.set('');
    this.successMessage.set('');

    this.tripService
      .delete(schedule.id)
      .subscribe({

        next: () => {

          this.deleting.set(false);

          this.successMessage.set(
            'Trip schedule deleted successfully.'
          );

          this.loadTrips();
        },

        error: error => {

          console.error(
            'Failed to delete trip schedule',
            error
          );

          this.deleting.set(false);

          this.errorMessage.set(
            error?.error?.detail ??
            error?.error?.message ??
            'Failed to delete trip schedule.'
          );
        }
      });
  }

  toggleStatus(
    schedule: TripScheduleDto
  ): void {

    const newStatus =
      !schedule.isActive;

    const action =
      newStatus
        ? 'activate'
        : 'deactivate';

    const confirmed =
      confirm(
        `Are you sure you want to ${action} this trip schedule?`
      );

    if (!confirmed) {
      return;
    }

    this.statusChangingId.set(
      schedule.id
    );

    this.errorMessage.set('');
    this.successMessage.set('');

    this.tripService
      .changeStatus(
        schedule.id,
        newStatus
      )
      .subscribe({

        next: () => {

          this.statusChangingId.set(null);

          this.successMessage.set(
            newStatus
              ? 'Trip schedule activated successfully.'
              : 'Trip schedule deactivated successfully.'
          );

          this.loadTrips();
        },

        error: error => {

          console.error(
            'Failed to change trip status',
            error
          );

          this.statusChangingId.set(null);

          this.errorMessage.set(
            error?.error?.detail ??
            error?.error?.message ??
            'Failed to change trip status.'
          );
        }
      });
  }

  formatTime(
    time?: string
  ): string {

    if (!time) {
      return '-';
    }

    return time.substring(0, 5);
  }

  formatDate(
    date: string
  ): string {

    return new Date(date)
      .toLocaleDateString(
        'en-GB',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }
      );
  }
}