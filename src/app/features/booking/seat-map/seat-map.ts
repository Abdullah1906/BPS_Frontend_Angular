import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { SeatMapService } from '../seat-map/services/seat-map';

import {
  TripSeatDto
} from '../models/trip-seat.model';

import { SeatStatus } from '../models/seat-status.enum';
import{computed} from '@angular/core';

@Component({
  selector: 'app-seat-map',
  standalone: true,
  templateUrl: './seat-map.html',
  styleUrl: './seat-map.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeatMap implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tripSeatService = inject(SeatMapService);

  readonly seats = signal<TripSeatDto[]>([]);
  readonly selectedSeatIds = signal<number[]>([]);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly SeatStatus = SeatStatus;

  readonly tripId = signal<number>(0);
  readonly spacerRows = computed(() => {
    const rows = [...new Set(this.seats().map(s => s.rowNumber))];
    const maxRow = Math.max(...rows);
    return rows.filter(r => r !== maxRow);
    });

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('tripId')
    );

    if (!id || id <= 0) {
      this.errorMessage.set('Invalid trip.');
      return;
    }

    this.tripId.set(id);

    this.loadSeats();
  }

  loadSeats(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.tripSeatService
      .getSeats(this.tripId())
      .subscribe({
        next: seats => {
          this.seats.set(seats);
          this.loading.set(false);
        },

        error: error => {
          console.error(error);

          this.errorMessage.set(
            error?.error?.detail ??
            error?.error?.message ??
            'Failed to load seats.'
          );

          this.loading.set(false);
        }
      });
  }

  isSelected(tripSeatId: number): boolean {
    return this.selectedSeatIds().includes(tripSeatId);
  }

  isAvailable(seat: TripSeatDto): boolean {
    return seat.status === SeatStatus.Available;
  }

  toggleSeat(seat: TripSeatDto): void {

    if (!this.isAvailable(seat)) {
      return;
    }

    const current = this.selectedSeatIds();

    if (current.includes(seat.tripSeatId)) {

      this.selectedSeatIds.set(
        current.filter(id => id !== seat.tripSeatId)
      );

      return;
    }

    this.selectedSeatIds.set([
      ...current,
      seat.tripSeatId
    ]);
  }

  continue(): void {

    const selected = this.selectedSeatIds();

    if (selected.length === 0) {
      this.errorMessage.set(
        'Please select at least one seat.'
      );

      return;
    }

    // Next step:
    // Lock selected seats
  }

   getSeatClass(seat: TripSeatDto): string {
  if (this.isSelected(seat.tripSeatId)) {
    return 'btn-success text-white border-success shadow';
  }

  switch (seat.status) {
    case SeatStatus.Available:
      return 'btn-outline-secondary bg-white text-dark border-secondary border-opacity-25 hover-shadow';
    case SeatStatus.Locked:
      return 'btn-warning text-dark border-warning cursor-not-allowed';
    case SeatStatus.Booked:
      return 'btn-secondary text-white opacity-50 border-secondary cursor-not-allowed';
    default:
      return 'btn-light';
  }
}

    // কলাম অ্যাডজাস্ট করার মেথড
    getAdjustedColumn(seat: TripSeatDto): number {
        const maxRow = Math.max(...this.seats().map(s => s.rowNumber));
        const isLastRow = seat.rowNumber === maxRow;

        // শেষ সারির জন্য (I1, I2, I3, I4, I5) কলাম সরানোর দরকার নেই
        if (isLastRow) {
            return seat.columnNumber;
        }

        // সাধারণ সারির জন্য: Column 3, 4 কে 1 Column ডানে সরাতে হবে (Aisle Gap এর জন্য)
        if (seat.columnNumber > 2) {
            return seat.columnNumber + 1;
        }

        return seat.columnNumber;
    }
}