import { Pagination } from '../../../shared/components/pagination/pagination';
import { FormsModule } from '@angular/forms'; 
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';
import { forkJoin } from 'rxjs';  

import { SeatLayoutService } from '../services/seat-layout';

import {
  BusSeatDto,
  CreateBusSeatDto,
  UpdateBusSeatDto
} from '../models/bus-seat-model';

import { BusService } from '../../buses/services/bus';   
import { BusDto } from '../../buses/models/bus.model'; 

@Component({
  selector: 'app-seat-layout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    Pagination
  ],
  templateUrl: './seat-layout.html',
  styleUrl: './seat-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeatLayout {

  private readonly fb = inject(FormBuilder);
  private readonly seatService = inject(SeatLayoutService);
  private readonly route = inject(ActivatedRoute);
  private readonly busService = inject(BusService);  
  private readonly router = inject(Router);


  readonly busId = signal<number | null>(null);

  readonly seats = signal<BusSeatDto[]>([]);

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly editingSeatId = signal<number | null>(null);

  readonly currentPage = signal(1);
  readonly pageSize = 10;

  // ✅ ADDED — copy-layout state
  readonly buses = signal<BusDto[]>([]);
  readonly selectedSourceBusId = signal<number | null>(null);
  readonly copying = signal(false);

  readonly otherBuses = computed(() =>
    this.buses().filter(bus => bus.id !== this.busId())
  );
  // ✅ END ADDED

  readonly paginatedSeats = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.seats().slice(start, start + this.pageSize);
  });

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  readonly form = this.fb.nonNullable.group({

    seatNumber: [
      '',
      [
        Validators.required,
        Validators.maxLength(20)
      ]
    ],

    rowNumber: [
      1,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    columnNumber: [
      1,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    isWindow: [
      false
    ],

    isActive: [
      true
    ]

  });


  /*
   * Maximum row number
   */
  readonly maxRow = computed(() => {

    const rows = this.seats()
      .map(seat => seat.rowNumber);

    return rows.length
      ? Math.max(...rows)
      : 0;
  });


  /*
   * Maximum column number
   */
  readonly maxColumn = computed(() => {

    const columns = this.seats()
      .map(seat => seat.columnNumber);

    return columns.length
      ? Math.max(...columns)
      : 4;
  });


  /*
   * Group seats by row
   */
  readonly seatRows = computed(() => {

    const rows = new Map<number, BusSeatDto[]>();

    for (const seat of this.seats()) {

      if (!rows.has(seat.rowNumber)) {
        rows.set(seat.rowNumber, []);
      }

      rows.get(seat.rowNumber)!.push(seat);
    }


    return Array.from(rows.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([rowNumber, seats]) => ({

        rowNumber,

        seats: seats.sort(
          (a, b) => a.columnNumber - b.columnNumber
        )

      }));
  });


  constructor() {

    const id = this.route.snapshot.paramMap.get('busId');

    if (!id) {

      this.router.navigate([
        '/admin/buses'
      ]);

      return;
    }


    const numericId = Number(id);

    if (Number.isNaN(numericId)) {

      this.router.navigate([
        '/admin/buses'
      ]);

      return;
    }


    this.busId.set(numericId);

    this.loadSeats();
    this.loadBuses(); 
  }

  loadBuses(): void {

      this.busService.getAll().subscribe({

        next: response => {
          this.buses.set(response);
        },

        error: error => {
          console.error('Failed to load buses', error);
        }
      });
    }
  loadSeats(): void {

    const busId = this.busId();

    if (!busId) {
      return;
    }


    this.loading.set(true);
    this.errorMessage.set('');
    this.currentPage.set(1); 


    this.seatService
      .getAll(busId)
      .subscribe({

        next: response => {

          this.seats.set(response);

          this.loading.set(false);
        },

        error: error => {

          console.error(
            'Failed to load seats',
            error
          );

          this.errorMessage.set(
            'Failed to load seat layout.'
          );

          this.loading.set(false);
        }

      });
  }

  // ✅ ADDED — copy layout from another bus
  copyLayoutFromBus(): void {

    const sourceBusId = this.selectedSourceBusId();
    const targetBusId = this.busId();

    if (!sourceBusId || !targetBusId) {
      return;
    }

    const confirmed = window.confirm(
      'Copy seat layout from the selected bus? This will add new seats to the current bus.'
    );

    if (!confirmed) {
      return;
    }

    this.copying.set(true);
    this.errorMessage.set('');

    this.seatService.getAll(sourceBusId).subscribe({

      next: sourceSeats => {

        if (sourceSeats.length === 0) {
          this.errorMessage.set('Selected bus has no seats to copy.');
          this.copying.set(false);
          return;
        }

        const createRequests = sourceSeats.map(seat =>
          this.seatService.create(targetBusId, {
            seatNumber: seat.seatNumber,
            rowNumber: seat.rowNumber,
            columnNumber: seat.columnNumber,
            isWindow: seat.isWindow
          })
        );

        forkJoin(createRequests).subscribe({

          next: () => {
            this.successMessage.set(
              `${sourceSeats.length} seat(s) copied successfully.`
            );
            this.copying.set(false);
            this.selectedSourceBusId.set(null);
            this.loadSeats();
            this.clearMessageAfterDelay();
          },

          error: error => {
            console.error('Failed to copy seats', error);
            this.errorMessage.set('Failed to copy seat layout.');
            this.copying.set(false);
          }
        });
      },

      error: error => {
        console.error('Failed to load source seats', error);
        this.errorMessage.set('Failed to load source bus seats.');
        this.copying.set(false);
      }
    });
  }
  saveSeat(): void {

    this.errorMessage.set('');
    this.successMessage.set('');


    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }


    const busId = this.busId();

    if (!busId) {
      return;
    }


    this.saving.set(true);


    const value = this.form.getRawValue();

    const editingId = this.editingSeatId();


    if (editingId) {

      const request: UpdateBusSeatDto = {

        seatNumber: value.seatNumber.trim(),

        rowNumber: value.rowNumber,

        columnNumber: value.columnNumber,

        isWindow: value.isWindow,

        isActive: value.isActive

      };


      this.seatService
        .update(
          busId,
          editingId,
          request
        )
        .subscribe({

          next: () => {

            this.successMessage.set(
              'Seat updated successfully.'
            );

            this.saving.set(false);

            this.cancelEdit();

            this.loadSeats();

            this.clearMessageAfterDelay();
          },

          error: error => {

            console.error(
              'Failed to update seat',
              error
            );

            this.errorMessage.set(
              'Failed to update seat.'
            );

            this.saving.set(false);
          }

        });

      return;
    }


    const request: CreateBusSeatDto = {

      seatNumber: value.seatNumber.trim(),

      rowNumber: value.rowNumber,

      columnNumber: value.columnNumber,

      isWindow: value.isWindow

    };


    this.seatService
      .create(
        busId,
        request
      )
      .subscribe({

        next: () => {

          this.successMessage.set(
            'Seat created successfully.'
          );

          this.saving.set(false);

          this.resetForm();

          this.loadSeats();

          this.clearMessageAfterDelay();
        },

        error: error => {

          console.error(
            'Failed to create seat',
            error
          );

          this.errorMessage.set(
            'Failed to create seat.'
          );

          this.saving.set(false);
        }

      });
  }


  editSeat(seat: BusSeatDto): void {

    this.editingSeatId.set(seat.id);


    this.form.patchValue({

      seatNumber: seat.seatNumber,

      rowNumber: seat.rowNumber,

      columnNumber: seat.columnNumber,

      isWindow: seat.isWindow,

      isActive: seat.isActive

    });


    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }


  cancelEdit(): void {

    this.editingSeatId.set(null);

    this.resetForm();
  }


  resetForm(): void {

    this.form.reset({

      seatNumber: '',

      rowNumber: 1,

      columnNumber: 1,

      isWindow: false,

      isActive: true

    });
  }


  toggleStatus(seat: BusSeatDto): void {

    const busId = this.busId();

    if (!busId) {
      return;
    }


    const newStatus = !seat.isActive;


    this.seatService
      .changeStatus(
        busId,
        seat.id,
        newStatus
      )
      .subscribe({

        next: () => {

          this.successMessage.set(

            newStatus
              ? 'Seat activated successfully.'
              : 'Seat deactivated successfully.'

          );

          this.loadSeats();

          this.clearMessageAfterDelay();
        },

        error: error => {

          console.error(
            'Failed to change seat status',
            error
          );

          this.errorMessage.set(
            'Failed to change seat status.'
          );
        }

      });
  }


  deleteSeat(seat: BusSeatDto): void {

    const busId = this.busId();

    if (!busId) {
      return;
    }


    const confirmed = window.confirm(
      `Are you sure you want to delete seat "${seat.seatNumber}"?`
    );


    if (!confirmed) {
      return;
    }


    this.seatService
      .delete(
        busId,
        seat.id
      )
      .subscribe({

        next: () => {

          this.successMessage.set(
            'Seat deleted successfully.'
          );

          this.loadSeats();

          this.clearMessageAfterDelay();
        },

        error: error => {

          console.error(
            'Failed to delete seat',
            error
          );

          this.errorMessage.set(
            'Failed to delete seat.'
          );
        }

      });
  }


  clearMessageAfterDelay(): void {

    setTimeout(() => {

      this.successMessage.set('');
      this.errorMessage.set('');

    }, 3000);
  }


  trackSeat(
    _index: number,
    seat: BusSeatDto
  ): number {

    return seat.id;
  }
}