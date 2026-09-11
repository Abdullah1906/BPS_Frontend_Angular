import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { SeatMapService } from '../seat-map/services/seat-map';

import {
  TripSeatDto
} from '../models/trip-seat.model';

import { SeatStatus } from '../models/seat-status.enum';
import{computed} from '@angular/core';
import { BookingService } from '../services/booking.service';
import { BookingStateService } from '../services/booking-state.service';

@Component({
  selector: 'app-seat-map',
  standalone: true,
  templateUrl: './seat-map.html',
  styleUrl: './seat-map.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeatMap implements OnInit, OnDestroy {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tripSeatService = inject(SeatMapService);
  private readonly bookingService = inject(BookingService);
  private readonly bookingState = inject(BookingStateService);

  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  readonly seats = signal<TripSeatDto[]>([]);
  readonly selectedSeatIds = signal<number[]>([]);

  readonly loading = signal(false);
  readonly locking = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage =signal('');


  readonly remainingSeconds = signal(0);
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
  lockSeats(): void {

    this.errorMessage.set('');
    this.successMessage.set('');

    const selected =
      this.selectedSeatIds();

    if (selected.length === 0) {

      this.errorMessage.set(
        'Please select at least one seat.'
      );

      return;
    }

    this.locking.set(true);

    this.bookingService
      .lockSeats({
        tripId: this.tripId(),
        tripSeatIds: selected
      })
      .subscribe({

        next: response => {

        //   this.locking.set(false);

        //   this.successMessage.set(
        //     'Seats locked successfully.'
        //   );

        //   this.bookingState.setLockedSeats(
        //   this.tripId(),
        //   response.seats,
        //   response.lockedUntil
        // );

          this.locking.set(false);

            console.log('LOCK API RESPONSE:', response);

            this.bookingState.setLockedSeats(
              this.tripId(),
              response.seats,
              response.lockedUntil
            );

            console.log(
              'STATE AFTER LOCK:',
              {
                tripId: this.bookingState.tripId(),
                lockedSeats: this.bookingState.lockedSeats(),
                lockedUntil: this.bookingState.lockedUntil()
              }
            );


          /*
           * Update seat status locally.
           */
          const lockedIds =
            response.seats.map(
              seat => seat.tripSeatId
            );

          this.seats.update(seats =>
            seats.map(seat =>
              lockedIds.includes(
                seat.tripSeatId
              )
                ? {
                    ...seat,
                    status: SeatStatus.Locked
                  }
                : seat
            )
          );

          /*
           * Start countdown from
           * server response.
           */
          this.startCountdown(
            response.lockedUntil
          );

          /*
           * Go to passenger page.
           */
          setTimeout(() => {

            this.router.navigate(
              ['/booking/passenger'],
              {
                queryParams: {
                  tripId: this.tripId()
                }
              }
            );

          }, 500);
        },

        error: error => {

          console.error(
            'Failed to lock seats',
            error
          );

          this.locking.set(false);

          this.errorMessage.set(
            error?.error?.detail ??
            error?.error?.message ??
            'Selected seats could not be locked.'
          );

          /*
           * Refresh seat status because
           * another customer may have
           * taken one of the seats.
           */
          this.loadSeats();
        }
      });
  }

  private startCountdown(
    lockedUntil: string
  ): void {

    this.stopCountdown();

    const lockedUntilTime =
      new Date(lockedUntil).getTime();

    this.updateRemainingTime(
      lockedUntilTime
    );

    this.countdownTimer =
      setInterval(() => {

        this.updateRemainingTime(
          lockedUntilTime
        );

      }, 1000);
  }

  private updateRemainingTime(
    lockedUntilTime: number
  ): void {

    const now = Date.now();

    const seconds = Math.max(
      0,
      Math.ceil(
        (lockedUntilTime - now) / 1000
      )
    );

    this.remainingSeconds.set(
      seconds
    );

    if (seconds === 0) {

      this.stopCountdown();

      this.errorMessage.set(
        'Your seat lock has expired.'
      );

      this.selectedSeatIds.set([]);

      this.loadSeats();
    }
  }

  get countdownText(): string {

    const totalSeconds =
      this.remainingSeconds();

    const minutes =
      Math.floor(totalSeconds / 60);

    const seconds =
      totalSeconds % 60;

    return `${minutes
      .toString()
      .padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  ngOnDestroy(): void {

    this.stopCountdown();
  }

  private stopCountdown(): void {

    if (this.countdownTimer) {

      clearInterval(
        this.countdownTimer
      );

      this.countdownTimer = null;
    }
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