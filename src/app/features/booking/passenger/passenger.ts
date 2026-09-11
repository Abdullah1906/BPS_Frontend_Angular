import {
  Component,
  OnInit,
  inject,
  effect,computed
} from '@angular/core';

import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { BookingStateService } from '../../../features/booking/services/booking-state.service';
import { PassengerDto } from '../models/booking.model';

@Component({
  selector: 'app-passenger',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './passenger.html',
  styleUrl: './passenger.scss'
})
export class Passenger implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly bookingState =inject(BookingStateService);

  passengerForm!: FormGroup;
    readonly countdownText = computed(() => {
        const totalSeconds = this.bookingState.remainingSeconds();
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    });
    constructor() {

    effect(() => {
      const lockedUntil = this.bookingState.lockedUntil();
      const remaining = this.bookingState.remainingSeconds();

      if (lockedUntil && remaining <= 0) {
        console.log('🚨 COUNTDOWN EXPIRED - NAVIGATING TO SEAT MAP');
        const tripId = this.bookingState.tripId();
        this.bookingState.clear();

        if (tripId) {
          this.router.navigate(['/booking/seat-map', tripId]);
        }
      }
    });
  }
  
  ngOnInit(): void {

    const lockedSeats =
      this.bookingState.lockedSeats();

    const tripId =
      this.bookingState.tripId();

    if (!tripId || lockedSeats.length === 0) {
      this.router.navigate(['/booking']);
      return;
    }

    this.passengerForm = this.fb.group({
      passengers: this.fb.array([])
    });

    for (const seat of lockedSeats) {
      this.passengers.push(
        this.createPassengerForm(seat.tripSeatId)
      );
    }

    
  }




  get passengers(): FormArray {
    return this.passengerForm.get(
      'passengers'
    ) as FormArray;
  }

  private createPassengerForm(
    tripSeatId: number
  ): FormGroup {

    return this.fb.group({

      tripSeatId: [
        tripSeatId,
        Validators.required
      ],

      passengerName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(150)
        ]
      ],

      passengerPhone: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(01)[3-9]\d{8}$/
          )
        ]
      ],

      passengerNID: [
        '',
        [
          Validators.maxLength(50)
        ]
      ]

    });
  }

  getSeatNumber(
    tripSeatId: number
  ): string {

    const seat =
      this.bookingState.lockedSeats()
        .find(x =>
          x.tripSeatId === tripSeatId
        );

    return seat?.seatNumber ?? '-';
  }

  isInvalid(
    index: number,
    controlName: string
  ): boolean {

    const control =
      this.passengers
        .at(index)
        .get(controlName);

    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched)
    );
  }

  continueToPayment(): void {

    if (this.passengerForm.invalid) {

      this.passengerForm.markAllAsTouched();

      return;
    }

    const passengers:
      PassengerDto[] =
        this.passengers.controls.map(
          control => ({
            tripSeatId:
              control.get('tripSeatId')?.value,

            passengerName:
              control.get('passengerName')?.value
                .trim(),

            passengerPhone:
              control.get('passengerPhone')?.value
                .trim(),

            passengerNID:
              control.get('passengerNID')?.value
                ?.trim() || undefined
          })
        );

    this.bookingState.setPassengers(
      passengers
    );

    this.router.navigate([
      '/booking/payment'
    ]);
  }

  goBackToSeats(): void {
        const tripId = this.bookingState.tripId();
        if (tripId) {
            this.router.navigate(['/booking/seat-map', tripId]);
        }
    }
}