import { SeatStatus } from './seat-status.enum';
import { BookingStatus } from './booking-status.enum';
import { PaymentStatus } from './payment-status.enum';


export interface PassengerDto {
  tripSeatId: number;
  passengerName: string;
  passengerPhone: string;
  passengerNID?: string;
}

export interface LockSeatsDto {
  tripId: number;
  tripSeatIds: number[];
}

export interface LockedSeatDto {
  tripSeatId: number;
  tripId: number;
  busSeatId: number;
  seatNumber: string;
  status: SeatStatus;
  lockedUntil: string;
}

export interface LockSeatsResponseDto {
  tripId: number;
  lockedUntil: string;
  seats: LockedSeatDto[];
}

export interface ConfirmBookingDto {
  tripId: number;
  paymentMethod: string;
  transactionId?: string;
  passengers: PassengerDto[];
}

export interface ConfirmedPassengerDto {
  tripSeatId: number;
  seatNumber: string;
  passengerName: string;
  passengerPhone: string;
  passengerNID?: string;
  fare: number;
}

export interface ConfirmBookingResponseDto {
  bookingId: number;
  pnr: string;

  tripId: number;
  customerId: number;

  totalAmount: number;

  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;

  paymentMethod: string;
  transactionId?: string;

  createdAt: string;
  confirmedAt?: string;

  fromPlaceName :string;
  toPlaceName :string;
  tripDate :Date;

  passengers: ConfirmedPassengerDto[];
}

