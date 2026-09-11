import {
  Component,
  computed,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../services/booking.service';
import { BookingStateService } from '../../../features/booking/services/booking-state.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './payment.html',
  styleUrl: './payment.scss'
})
export class Payment {

  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);
  readonly bookingState = inject(BookingStateService);

  readonly tripId = computed(() => this.bookingState.tripId());
  readonly lockedSeats = computed(() => this.bookingState.lockedSeats());
  readonly passengers = computed(() => this.bookingState.passengers());
  readonly tripFare = computed(() => this.bookingState.tripFare());
  readonly discount = computed(() => this.bookingState.discount());

  paymentMethod = 'Cash';
  transactionId = '';
  isSubmitting = false;

  readonly totalAmount = computed(() => {
    return this.tripFare() * this.passengers().length;
  });


  readonly totalDiscount = computed(() => {
    return this.discount() * this.passengers().length;
  });

  // Final Payable Amount
  readonly netTotal = computed(() => {
    return Math.max(0, this.totalAmount() - this.totalDiscount());
  });
  getSeatNumber(tripSeatId: number): string {
    const seat = this.lockedSeats().find(x => x.tripSeatId === tripSeatId);
    return seat?.seatNumber ?? '-';
  }

  confirmBooking(): void {
    const tripId = this.tripId();
    const passengers = this.passengers();

    if (!tripId || passengers.length === 0) {
      return;
    }

    this.isSubmitting = true;

    this.bookingService.confirmBooking({
      tripId,
      paymentMethod: this.paymentMethod,
      transactionId: this.transactionId.trim() || undefined,
      passengers
    }).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.router.navigate(
          ['/booking/ticket'],
          {
            state: {
              booking: response
            }
          }
        );
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Booking confirmation failed', error);
      }
    });
  }

  backToPassenger(): void {
    this.router.navigate(['/booking/passenger']);
  }
}