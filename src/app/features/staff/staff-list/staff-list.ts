
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { StaffService } from '../services/staff.service';
import {
  Staff,
  StaffRole,
  StaffStatus
} from '../models/staff.model';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-list.html',
  styleUrl: './staff-list.scss'
})
export class StaffList implements OnInit {

  private readonly staffService = inject(StaffService);
  private readonly router = inject(Router);

  staffList: Staff[] = [];

  loading = false;
  errorMessage = '';

  // Search and filters
  search = '';
  selectedRole = '';
  selectedStatus = '';

  // Pagination
  page = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 0;

  readonly roles: StaffRole[] = [
    'Driver',
    'Supervisor',
    'Helper',
    'Office Staff'
  ];

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff(): void {

    this.loading = true;
    this.errorMessage = '';

    this.staffService.getStaffList(
      this.page,
      this.pageSize,
      this.search,
      this.selectedRole,
      this.selectedStatus
    ).subscribe({

      next: (response) => {

        this.staffList = response.items ?? [];
        this.totalRecords = response.totalRecords ?? 0;
        this.totalPages = response.totalPages ?? 0;

        this.loading = false;
      },

      error: (error) => {

        console.error('Staff loading failed:', error);

        this.errorMessage =
          error.error?.message ??
          'Failed to load staff information.';

        this.loading = false;
      }

    });
  }

  onSearch(): void {
    this.page = 1;
    this.loadStaff();
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadStaff();
  }

  clearFilters(): void {

    this.search = '';
    this.selectedRole = '';
    this.selectedStatus = '';

    this.page = 1;

    this.loadStaff();
  }

  changePage(newPage: number): void {

    if (
      newPage < 1 ||
      newPage > this.totalPages
    ) {
      return;
    }

    this.page = newPage;
    this.loadStaff();
  }

  changePageSize(): void {
    this.page = 1;
    this.loadStaff();
  }

  createStaff(): void {
    this.router.navigate(['/admin/staff/create']);
  }

  editStaff(staffId: number): void {

    this.router.navigate([
      '/admin/staff',
      staffId,
      'edit'
    ]);

  }

  updateStatus(staff: Staff): void {

    const newStatus: StaffStatus =
      staff.status === 'Active'
        ? 'Inactive'
        : 'Active';

    const confirmed = window.confirm(
      `Are you sure you want to change ${staff.fullName}'s status to ${newStatus}?`
    );

    if (!confirmed) {
      return;
    }

    this.staffService.updateStaffStatus(
      staff.staffId,
      { status: newStatus }
    ).subscribe({

      next: () => {
        this.loadStaff();
      },

      error: (error) => {

        console.error('Status update failed:', error);

        alert(
          error.error?.message ??
          'Unable to update staff status.'
        );

      }

    });

  }

  deactivateStaff(staff: Staff): void {

    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${staff.fullName}?`
    );

    if (!confirmed) {
      return;
    }

    this.staffService.deactivateStaff(
      staff.staffId
    ).subscribe({

      next: () => {
        this.loadStaff();
      },

      error: (error) => {

        console.error('Staff deactivation failed:', error);

        alert(
          error.error?.message ??
          'Unable to deactivate staff.'
        );

      }

    });

  }

  get startingRecord(): number {

    if (this.totalRecords === 0) {
      return 0;
    }

    return (this.page - 1) * this.pageSize + 1;
  }

  get endingRecord(): number {

    return Math.min(
      this.page * this.pageSize,
      this.totalRecords
    );

  }

}
