import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ConfirmBookingResponseDto } from '../models/booking.model';
import { BookingStateService } from '../../../features/booking/services/booking-state.service';


export interface TicketViewData extends ConfirmBookingResponseDto {
  fromPlaceName?: string;
  toPlaceName?: string;
  journeyDate?: string;
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

  constructor() {
    
    const navigation = this.router.getCurrentNavigation();
    this.confirmedBookingFromNav = navigation?.extras?.state?.['booking'] as ConfirmBookingResponseDto 
      || history.state?.['booking'] as ConfirmBookingResponseDto;
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



  goHome(): void {

    this.bookingState.clear();

    this.router.navigate([
      '/dashboard'
    ]);
  }
}