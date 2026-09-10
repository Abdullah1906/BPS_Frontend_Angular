import { SeatStatus } from './seat-status.enum';

export interface TripSeatDto {
  tripSeatId: number;
  busSeatId: number;
  seatNumber: string;
  rowNumber: number;
  columnNumber: number;
  isWindow: boolean;
  status: SeatStatus;
}