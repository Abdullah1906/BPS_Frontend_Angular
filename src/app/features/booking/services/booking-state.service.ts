import { Injectable, signal,computed } from '@angular/core';
import { LockedSeatDto ,PassengerDto} from '../models/booking.model';
export interface JourneyDetails {
  fromPlaceName: string;
  toPlaceName: string;
  journeyDate: string;
}
@Injectable({ providedIn: 'root' })
export class BookingStateService {
  readonly tripId = signal<number | null>(null);
  readonly lockedSeats = signal<LockedSeatDto[]>([]);
  readonly lockedUntil = signal<string | null>(null);
  readonly passengers = signal<PassengerDto[]>([]);
  readonly tripFare = signal<number>(0);
  readonly discount = signal<number>(0);
 
  private now = signal<number>(Date.now());
  private timer: any = null;


  readonly remainingSeconds = computed(() => {
    const expiry = this.lockedUntil();
    if (!expiry) return 0;

    const utcString = expiry.endsWith('Z') ? expiry : `${expiry}Z`;
    const diff = Math.floor((new Date(utcString).getTime() - this.now()) / 1000);
    return diff > 0 ? diff : 0;
  });

  private journeyInfo = signal<JourneyDetails | null>(null);

  setJourneyDetails(from: string, to: string, date: string): void {
    this.journeyInfo.set({ fromPlaceName: from, toPlaceName: to, journeyDate: date });
  }

  getJourneyDetails(): JourneyDetails | null {
    return this.journeyInfo();
  }

  setLockedSeats(tripId: number, seats: LockedSeatDto[], lockedUntil: string): void {
    this.tripId.set(tripId);
    this.lockedSeats.set(seats);
    this.lockedUntil.set(lockedUntil);
    this.startCountdown();
  }

  private startCountdown(): void {
    this.stopCountdown();
    this.timer = setInterval(() => {
      this.now.set(Date.now());
    }, 1000);
  }

  private stopCountdown(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  setPassengers(passengers: PassengerDto[]): void {
    this.passengers.set(passengers);
  }

  setTripFare(fare: number): void {
    this.tripFare.set(fare);
  }

  setDiscount(discount: number): void {
    this.discount.set(discount);
  }

  clear(): void {
    this.stopCountdown();
    this.tripId.set(null);
    this.lockedSeats.set([]);
    this.lockedUntil.set(null);
    this.passengers.set([]);
    this.tripFare.set(0);
    this.discount.set(0);
    this.journeyInfo.set(null);
  }
}