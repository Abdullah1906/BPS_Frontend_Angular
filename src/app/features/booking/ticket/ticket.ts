import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ConfirmBookingResponseDto } from '../models/booking.model';
import { BookingStateService } from '../../../features/booking/services/booking-state.service';
import { BookingStatus } from '../models/booking-status.enum';

export interface TicketViewData extends ConfirmBookingResponseDto {
  fromPlaceName?: string;
  toPlaceName?: string;
  journeyDate?: string;
}

export interface GroupedPassenger {
  seatNumbers: string;
  passengerName: string;
  passengerPhone: string;
  totalFare: number;
}

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket.html',
  styleUrl: './ticket.scss'
})
export class Ticket implements OnInit {

  private readonly router = inject(Router);
  private readonly bookingState =
    inject(BookingStateService);

  booking: TicketViewData | null = null;

  private confirmedBookingFromNav: ConfirmBookingResponseDto | null = null;
  BookingStatus = BookingStatus;
  constructor() {
    
    const navigation = this.router.getCurrentNavigation();
    this.confirmedBookingFromNav = navigation?.extras?.state?.['booking'] as ConfirmBookingResponseDto 
      || history.state?.['booking'] as ConfirmBookingResponseDto;
  }
  getBookingStatusName(status: BookingStatus | number | undefined): string {
      if (status === undefined || status === null) return 'N/A';
      
      switch (Number(status)) {
        case BookingStatus.Pending:
          return 'Pending';
        case BookingStatus.Confirmed:
          return 'Confirmed';
        case BookingStatus.Cancelled:
          return 'Cancelled';
        default:
          return 'Unknown';
      }
    }

  ngOnInit(): void {
    const confirmedBooking = this.confirmedBookingFromNav;

    if (confirmedBooking) {
      const journey = this.bookingState.getJourneyDetails();

      this.booking = {
        ...confirmedBooking,
        fromPlaceName: journey?.fromPlaceName || 'N/A',
        toPlaceName: journey?.toPlaceName || 'N/A',
        journeyDate: journey?.journeyDate || 'N/A'
      };
    }
  }

  printTicket(): void {
    window.print();
  }


get groupedPassengers(): GroupedPassenger[] {
    if (!this.booking?.passengers || this.booking.passengers.length === 0) {
      return [];
    }

    const map = new Map<string, GroupedPassenger>();

    for (const p of this.booking.passengers) {
      
      const key = `${(p.passengerName || '').trim().toLowerCase()}_${(p.passengerPhone || '').trim()}`;

      if (map.has(key)) {
        const existing = map.get(key)!;
        existing.seatNumbers += `, ${p.seatNumber}`;
        existing.totalFare += (p.fare || 0);
      } else {
        map.set(key, {
          seatNumbers: p.seatNumber,
          passengerName: p.passengerName,
          passengerPhone: p.passengerPhone,
          totalFare: p.fare || 0
        });
      }
    }

    return Array.from(map.values());
  }



  goHome(): void {

    this.bookingState.clear();

    this.router.navigate([
      '/dashboard'
    ]);
  }
}