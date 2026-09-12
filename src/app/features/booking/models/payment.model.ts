import { ConfirmBookingResponseDto, PassengerDto } from '../models/booking.model';

export interface BookingPaymentState {
  ConfirmBookingResponse: ConfirmBookingResponseDto;
  passengers: PassengerDto[];
}
