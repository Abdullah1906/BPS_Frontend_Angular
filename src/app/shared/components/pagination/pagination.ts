import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Pagination {

  readonly totalItems = input.required<number>();
  readonly pageSize = input<number>(10);
  readonly currentPage = input<number>(1);

  readonly pageChange = output<number>();

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.pageSize()))
  );

  readonly pageStart = computed(() =>
    this.totalItems() === 0
      ? 0
      : (this.currentPage() - 1) * this.pageSize() + 1
  );

  readonly pageEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.totalItems())
  );

  readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  goToPage(page: number): void {

    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.pageChange.emit(page);
  }
}