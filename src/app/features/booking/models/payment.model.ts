import { PassengerDto } from '../models/booking.model';

export interface BookingPaymentState {
  tripId: number;
  passengers: PassengerDto[];
}