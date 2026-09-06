import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
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

import { BusService } from '../../buses/services/bus';
import { Route } from '../../routes/services/route';

import { TripScheduleService } from '../services/trips-schedules';

import { BusDto } from '../../buses/models/bus.model';
import { RouteDto } from '../../routes/models/route.model';

import {
  CreateTripScheduleDto,
  UpdateTripScheduleDto
} from '../models/trips-schedules.model';

@Component({
  selector: 'app-trip-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './trip-form.html',
  styleUrl: './trip-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TripScheduleForm implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  private readonly busService = inject(BusService);
  private readonly routeService = inject(Route);

  private readonly tripScheduleService =
    inject(TripScheduleService);

  readonly buses = signal<BusDto[]>([]);
  readonly routes = signal<RouteDto[]>([]);

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly isEditMode = signal(false);
  readonly tripId = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({

    busId: [
      0,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    routeId: [
      0,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    tripDate: [
      '',
      Validators.required
    ],

    departureTime: [
      '',
      Validators.required
    ],

    arrivalTime: [
      ''
    ],

    fare: [
      0,
      [
        Validators.required,
        Validators.min(0.01)
      ]
    ],

    isActive: [
      true
    ]

  });

  ngOnInit(): void {

    const idParam =
      this.activatedRoute.snapshot.paramMap.get('id');

    if (idParam) {

      const id = Number(idParam);

      if (id > 0) {
        this.isEditMode.set(true);
        this.tripId.set(id);
      }
    }

    this.loadDropdownData();
  }

  loadDropdownData(): void {

    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      buses: this.busService.getAll(),
      routes: this.routeService.getAll()
    }).subscribe({

      next: response => {

        this.buses.set(
          response.buses.filter(bus => bus.isActive)
        );

        this.routes.set(
          response.routes.filter(route => route.isActive)
        );

        if (this.isEditMode()) {
          this.loadTrip();
        } else {
          this.loading.set(false);
        }
      },

      error: error => {

        console.error(
          'Failed to load trip schedule data',
          error
        );

        this.errorMessage.set(
          error?.error?.detail ??
          error?.error?.message ??
          'Failed to load buses and routes.'
        );

        this.loading.set(false);
      }
    });
  }

  loadTrip(): void {

    const id = this.tripId();

    if (!id) {
      this.loading.set(false);
      return;
    }

    this.tripScheduleService
      .getById(id)
      .subscribe({

        next: trip => {

          this.form.patchValue({

            busId: trip.busId,

            routeId: trip.routeId,

            tripDate:
              this.formatDateForInput(trip.tripDate),

            departureTime:
              this.formatTimeForInput(trip.departureTime),

            arrivalTime:
              this.formatTimeForInput(trip.arrivalTime),

            fare: trip.fare,

            isActive: trip.isActive

          });

          this.loading.set(false);
        },

        error: error => {

          console.error(
            'Failed to load trip schedule',
            error
          );

          this.errorMessage.set(
            error?.error?.detail ??
            error?.error?.message ??
            'Failed to load trip schedule.'
          );

          this.loading.set(false);
        }
      });
  }

  save(): void {

    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }

    const value = this.form.getRawValue();

    const baseRequest = {

      busId: value.busId,

      routeId: value.routeId,

      tripDate: value.tripDate,

      departureTime:
        this.normalizeTime(value.departureTime),

      arrivalTime:
        value.arrivalTime
          ? this.normalizeTime(value.arrivalTime)
          : undefined,

      fare: value.fare

    };

    this.saving.set(true);

    if (this.isEditMode()) {

      this.updateTrip(baseRequest);

    } else {

      this.createTrip(baseRequest);
    }
  }

  private createTrip(
    request: CreateTripScheduleDto
  ): void {

    this.tripScheduleService
      .create(request)
      .subscribe({

        next: response => {

          console.log(
            'Trip schedule created',
            response
          );

          this.saving.set(false);

          this.successMessage.set(
            'Trip schedule created successfully.'
          );

          setTimeout(() => {

            this.router.navigate([
              '/admin/trips/schedules'
            ]);

          }, 800);
        },

        error: error => {

          console.error(
            'Failed to create trip schedule',
            error
          );

          this.saving.set(false);

          this.errorMessage.set(
            error?.error?.detail ??
            error?.error?.message ??
            'Failed to create trip schedule.'
          );
        }
      });
  }

  private updateTrip(
    request: Omit<UpdateTripScheduleDto, 'isActive'>
  ): void {

    const id = this.tripId();

    if (!id) {
      this.saving.set(false);
      return;
    }

    const updateRequest: UpdateTripScheduleDto = {

      ...request,

      isActive:
        this.form.controls.isActive.value

    };

    this.tripScheduleService
      .update(id, updateRequest)
      .subscribe({

        next: () => {

          this.saving.set(false);

          this.successMessage.set(
            'Trip schedule updated successfully.'
          );

          setTimeout(() => {

            this.router.navigate([
              '/admin/trips/schedules'
            ]);

          }, 800);
        },

        error: error => {

          console.error(
            'Failed to update trip schedule',
            error
          );

          this.saving.set(false);

          this.errorMessage.set(
            error?.error?.detail ??
            error?.error?.message ??
            'Failed to update trip schedule.'
          );
        }
      });
  }

  private normalizeTime(
    time: string
  ): string {

    if (!time) {
      return time;
    }

    return time.length === 5
      ? `${time}:00`
      : time;
  }

  private formatTimeForInput(
    time?: string
  ): string {

    if (!time) {
      return '';
    }

    return time.substring(0, 5);
  }

  private formatDateForInput(
    date: string
  ): string {

    return date.substring(0, 10);
  }

  reset(): void {

    // if (this.isEditMode()) {

    //   this.loadTrip();

    //   this.errorMessage.set('');
    //   this.successMessage.set('');

    //   return;
    // }

    this.form.reset({

      busId: 0,

      routeId: 0,

      tripDate: '',

      departureTime: '',

      arrivalTime: '',

      fare: 0,

      isActive: true

    });

    this.errorMessage.set('');
    this.successMessage.set('');
  }

   
}