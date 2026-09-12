import { Injectable, signal,computed } from '@angular/core';
import { LockedSeatDto ,PassengerDto, ConfirmBookingResponseDto} from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingStateService {
  readonly tripId = signal<number | null>(null);
  readonly lockedSeats = signal<LockedSeatDto[]>([]);
  readonly lockedUntil = signal<string | null>(null);
  readonly passengers = signal<PassengerDto[]>([]);

  readonly tripFare = signal<number>(this.getSavedFare());
  readonly discount = signal<number>(this.getSavedDiscount());
  readonly busName = signal<string>(this.getSavedBusName());

  private getSavedBusName(): string {
    const saved = sessionStorage.getItem('bus_name');
    return saved ? saved : '';
  }

  private getSavedFare(): number {
    const saved = sessionStorage.getItem('trip_fare');
    return saved ? Number(saved) : 0;
  }

  private getSavedDiscount(): number {
    const saved = sessionStorage.getItem('trip_discount');
    return saved ? Number(saved) : 0;
  }
 
  private now = signal<number>(Date.now());
  private timer: any = null;
  private readonly STORAGE_KEY = 'confirmed_ticket_data';

  readonly remainingSeconds = computed(() => {
    const expiry = this.lockedUntil();
    if (!expiry) return 0;

    const utcString = expiry.endsWith('Z') ? expiry : `${expiry}Z`;
    const diff = Math.floor((new Date(utcString).getTime() - this.now()) / 1000);
    return diff > 0 ? diff : 0;
  });

  readonly confirmedBooking = signal<ConfirmBookingResponseDto | null>(this.getSavedTicket());

  setConfirmedBooking(data: ConfirmBookingResponseDto): void {
    this.confirmedBooking.set(data);
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  getSavedTicket(): ConfirmBookingResponseDto | null {
    const data = sessionStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
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
      sessionStorage.setItem('trip_fare', fare.toString());
  }

  setDiscount(discount: number): void {
      this.discount.set(discount);
      sessionStorage.setItem('trip_discount', discount.toString());
  }

  setBusName(busName: string): void {
      this.busName.set(busName);
      sessionStorage.setItem('bus_name', busName);
  }

  clear(): void {
    this.stopCountdown();
    this.tripId.set(null);
    this.lockedSeats.set([]);
    this.lockedUntil.set(null);
    this.passengers.set([]);
    sessionStorage.removeItem('trip_fare');
    sessionStorage.removeItem('trip_discount');
    sessionStorage.removeItem('bus_name');
    sessionStorage.removeItem(this.STORAGE_KEY);
  }
}