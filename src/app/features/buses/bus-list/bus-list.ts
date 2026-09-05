import { Pagination } from '../../../shared/components/pagination/pagination';

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { BusService } from '../services/bus';
import { BusDto } from '../models/bus.model';


@Component({
  selector: 'app-bus-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    Pagination
  ],
  templateUrl: './bus-list.html',
  styleUrl: './bus-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusListComponent {

  private readonly busService = inject(BusService);
  private readonly router = inject(Router);

  readonly buses = signal<BusDto[]>([]);
  readonly loading = signal(false);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<'all' | 'active' | 'inactive'>('all');

  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = 10;

  readonly paginatedBuses = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredBuses().slice(start, start + this.pageSize);
  });

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  readonly filteredBuses = computed(() => {

    const search = this.searchTerm()
      .trim()
      .toLowerCase();

    const status = this.statusFilter();

    return this.buses().filter(bus => {

      const matchesSearch =
        !search ||
        bus.busName.toLowerCase().includes(search) ||
        bus.busNumber.toLowerCase().includes(search);

      const matchesStatus =
        status === 'all' ||
        (status === 'active' && bus.isActive) ||
        (status === 'inactive' && !bus.isActive);

      return matchesSearch && matchesStatus;
    });
  });


  constructor() {
    this.loadBuses();
  }


  loadBuses(): void {

    this.loading.set(true);
    this.errorMessage.set('');
    this.currentPage.set(1); 

    this.busService.getAll().subscribe({

      next: response => {

        this.buses.set(response);

        this.loading.set(false);
      },

      error: error => {

        console.error('Failed to load buses', error);

        this.errorMessage.set(
          'Failed to load buses.'
        );

        this.loading.set(false);
      }
    });
  }


  onSearch(event: Event): void {

    const input = event.target as HTMLInputElement;

    this.searchTerm.set(input.value);
    this.currentPage.set(1);
  }


  setStatusFilter(
    status: 'all' | 'active' | 'inactive'
  ): void {

    this.statusFilter.set(status);
  }


  editBus(id: number): void {

    this.router.navigate([
      '/admin/buses/edit',
      id
    ]);
  }


  manageSeats(id: number): void {

    this.router.navigate([
      '/admin/buses',
      id,
      'seats'
    ]);
  }


  toggleStatus(bus: BusDto): void {

    const newStatus = !bus.isActive;

    this.busService
      .changeStatus(bus.id, newStatus)
      .subscribe({

        next: () => {

          this.successMessage.set(
            newStatus
              ? 'Bus activated successfully.'
              : 'Bus deactivated successfully.'
          );

          this.loadBuses();

          this.clearMessageAfterDelay();
        },

        error: error => {

          console.error(
            'Failed to change bus status',
            error
          );

          this.errorMessage.set(
            'Failed to change bus status.'
          );
        }
      });
  }


  deleteBus(bus: BusDto): void {

    const confirmed = window.confirm(
      `Are you sure you want to delete "${bus.busName}"?`
    );

    if (!confirmed) {
      return;
    }

    this.busService
      .delete(bus.id)
      .subscribe({

        next: () => {

          this.successMessage.set(
            'Bus deleted successfully.'
          );

          this.loadBuses();

          this.clearMessageAfterDelay();
        },

        error: error => {

          console.error(
            'Failed to delete bus',
            error
          );

          this.errorMessage.set(
            'Failed to delete bus.'
          );
        }
      });
  }


  clearMessageAfterDelay(): void {

    setTimeout(() => {

      this.successMessage.set('');
      this.errorMessage.set('');

    }, 3000);
  }
}