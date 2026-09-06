import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { Route as RouteApiService } from '../services/route';
import { RouteDto } from '../models/route.model';

@Component({
  selector: 'app-route-list',
  standalone: true,
  imports: [CommonModule, RouterLink, Pagination],
  templateUrl: './route-list.html',
  styleUrl: './route-list.scss',
})
export class RouteList implements OnInit {
  private readonly routeService = inject(RouteApiService);

  readonly routes = signal<RouteDto[]>([]);
  readonly loading = signal(false);
  readonly search = signal('');
  readonly statusFilter = signal<'all' | 'active' | 'inactive'>('all');

  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly currentPage = signal(1);
  readonly pageSize = 10;

  readonly filteredRoutes = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.statusFilter();

    return this.routes().filter((route) => {
      const matchesSearch =
        !term ||
        route.fromPlace.toLowerCase().includes(term) ||
        route.toPlace.toLowerCase().includes(term);

      const matchesStatus =
        status === 'all' ||
        (status === 'active' && route.isActive) ||
        (status === 'inactive' && !route.isActive);

      return matchesSearch && matchesStatus;
    });
  });

  readonly paginatedRoutes = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredRoutes().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.loadRoutes();
  }

  loadRoutes(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.currentPage.set(1);

    this.routeService.getAll().subscribe({
      next: (data) => {
        this.routes.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Failed to load routes. Please try again.');
        this.loading.set(false);
      },
    });
  }

  onSearchChange(value: string): void {
    this.search.set(value);
    this.currentPage.set(1);
  }

  setStatusFilter(status: 'all' | 'active' | 'inactive'): void {
    this.statusFilter.set(status);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  toggleStatus(route: RouteDto): void {
    this.routeService.updateStatus(route.id, !route.isActive).subscribe({
      next: (updated) => {
        this.routes.update((list) =>
          list.map((r) => (r.id === updated.id ? updated : r))
        );
        this.successMessage.set(`Route status updated successfully.`);
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: () => {
        this.errorMessage.set('Failed to update status.');
        setTimeout(() => this.errorMessage.set(null), 3000);
      },
    });
  }

  deleteRoute(route: RouteDto): void {
    if (!confirm(`Delete route "${route.fromPlace} → ${route.toPlace}"?`)) return;

    this.routeService.delete(route.id).subscribe({
      next: () => {
        this.routes.update((list) => list.filter((r) => r.id !== route.id));
        this.successMessage.set('Route deleted successfully.');
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: () => {
        this.errorMessage.set('Failed to delete route.');
        setTimeout(() => this.errorMessage.set(null), 3000);
      },
    });
  }

  // মিনিটকে (যেমন: 135) '2h 15m' বা '2 hours 15 mins' ফরম্যাটে দেখানোর ফাংশন
  formatDuration(minutes: number | null | undefined): string {
    if (!minutes || minutes <= 0) return '-';

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${remainingMinutes}m`;
    }

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
}
}