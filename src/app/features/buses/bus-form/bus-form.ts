import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal
} from '@angular/core';

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

import { CommonModule } from '@angular/common';

import { BusService } from '../services/bus';

import {
  CreateBusDto,
  UpdateBusDto
} from '../models/bus.model';


@Component({
  selector: 'app-bus-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './bus-form.html',
  styleUrl: './bus-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusFormComponent {

  private readonly fb = inject(FormBuilder);
  private readonly busService = inject(BusService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);


  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly isEditMode = signal(false);
  readonly busId = signal<number | null>(null);


  readonly form = this.fb.nonNullable.group({

    busName: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]
    ],

    busNumber: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]
    ],

    totalSeats: [
      40,
      [
        Validators.required,
        Validators.min(1),
        Validators.max(200)
      ]
    ],

    isActive: [
      true
    ]

  });


  constructor() {

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {

      const numericId = Number(id);

      if (!Number.isNaN(numericId)) {

        this.isEditMode.set(true);
        this.busId.set(numericId);

        this.loadBus(numericId);
      }
    }
  }


  get busName() {
    return this.form.controls.busName;
  }


  get busNumber() {
    return this.form.controls.busNumber;
  }


  get totalSeats() {
    return this.form.controls.totalSeats;
  }


  loadBus(id: number): void {

    this.loading.set(true);
    this.errorMessage.set('');

    this.busService
      .getById(id)
      .subscribe({

        next: bus => {

          this.form.patchValue({

            busName: bus.busName,
            busNumber: bus.busNumber,
            totalSeats: bus.totalSeats,
            isActive: bus.isActive

          });

          this.loading.set(false);
        },

        error: error => {

          console.error(
            'Failed to load bus',
            error
          );

          this.errorMessage.set(
            'Failed to load bus.'
          );

          this.loading.set(false);
        }
      });
  }


  submit(): void {

    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }


    this.saving.set(true);


    const rawValue = this.form.getRawValue();


    if (this.isEditMode()) {

      this.updateBus(rawValue);

    } else {

      this.createBus(rawValue);

    }
  }


  private createBus(
    value: {
      busName: string;
      busNumber: string;
      totalSeats: number;
      isActive: boolean;
    }
  ): void {

    const request: CreateBusDto = {

      busName: value.busName.trim(),

      busNumber: value.busNumber.trim(),

      totalSeats: value.totalSeats

    };


    this.busService
      .create(request)
      .subscribe({

        next: () => {

          this.saving.set(false);

          this.router.navigate([
            '/admin/buses'
          ]);
        },

        error: error => {

          console.error(
            'Failed to create bus',
            error
          );

          this.errorMessage.set(
            'Failed to create bus.'
          );

          this.saving.set(false);
        }
      });
  }


  private updateBus(
    value: {
      busName: string;
      busNumber: string;
      totalSeats: number;
      isActive: boolean;
    }
  ): void {

    const id = this.busId();

    if (!id) {

      this.errorMessage.set(
        'Invalid bus ID.'
      );

      this.saving.set(false);

      return;
    }


    const request: UpdateBusDto = {

      busName: value.busName.trim(),

      busNumber: value.busNumber.trim(),

      totalSeats: value.totalSeats,

      isActive: value.isActive

    };


    this.busService
      .update(id, request)
      .subscribe({

        next: () => {

          this.saving.set(false);

          this.router.navigate([
            '/admin/buses'
          ]);
        },

        error: error => {

          console.error(
            'Failed to update bus',
            error
          );

          this.errorMessage.set(
            'Failed to update bus.'
          );

          this.saving.set(false);
        }
      });
  }


  resetForm(): void {

    if (this.isEditMode()) {

      const id = this.busId();

      if (id) {
        this.loadBus(id);
      }

      return;
    }


    this.form.reset({

      busName: '',

      busNumber: '',

      totalSeats: 40,

      isActive: true

    });
  }


  cancel(): void {

    this.router.navigate([
      '/admin/buses'
    ]);
  }
}