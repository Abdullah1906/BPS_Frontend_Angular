import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TripService } from '../services/trip';
import { PlaceService } from '../../places/services/place';
import { Place } from '../../places/models/place.model';
import { CreateTripRequest, UpdateTripRequest } from '../models/trip.model';

@Component({
  selector: 'app-trip-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './trip-form.html',
  styleUrl: './trip-form.scss'
})
export class TripForm implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly tripService = inject(TripService);
  private readonly placeService = inject(PlaceService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  placeDropdownOpen = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  isEditMode = signal(false);
  tripId: number | null = null;

  places = signal<Place[]>([]);

  private getTodayDate(): string {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  tripForm = this.fb.nonNullable.group({
    placeIds: this.fb.nonNullable.control<number[]>([], [
      Validators.required,
      Validators.minLength(1)
    ]),

    tripDate: [this.getTodayDate(), Validators.required],

    tipStatus: [false],

    tipAmount: [1, [Validators.min(1), Validators.max(20)]],
    note :['', [ Validators.maxLength(150)]],
  });
  ngOnInit(): void {
    this.loadPlaces();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.tripId = Number(idParam);
      this.isEditMode.set(true);
      this.loadTrip(this.tripId);
    }
  }

  loadPlaces(): void {
    this.placeService.getAllByActive().subscribe({
      next: (data) => this.places.set(data),
      error: (error) => console.error('Load places error:', error)
    });
  }

  loadTrip(id: number): void {
    this.loading = true;

    this.tripService.getById(id).subscribe({
      next: (trip) => {
        this.tripForm.patchValue({
          placeIds: [trip.placeId],
          tripDate: trip.tripDate.substring(0, 10),
          tipStatus: trip.tipStatus,
          tipAmount: trip.tipAmount,
          note : trip.note
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Load trip error:', error);
        this.errorMessage = 'Unable to load trip.';
        this.loading = false;
      }
    });
  }


  submit(): void {

    if (this.tripForm.invalid) {
      this.tripForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.tripForm.getRawValue();

  
    if (this.isEditMode() && this.tripId !== null) {

      const updateRequest: UpdateTripRequest = {
        placeId: formValue.placeIds[0],
        tripDate: formValue.tripDate,
        tipStatus: formValue.tipStatus,
        tipAmount: formValue.tipStatus
          ? formValue.tipAmount
          : 0,
        note:formValue.note
      };

      this.tripService.update(
        this.tripId,
        updateRequest
      ).subscribe({

        next: () => {
          this.loading = false;
          this.successMessage = 'Trip updated successfully.';

          setTimeout(() => {
            this.router.navigate(['/trips']);
          }, 500);
        },

        error: (error) => {
          this.loading = false;

          console.error('Update trip error:', error);

          this.errorMessage =
            error?.error?.message ??
            'Unable to update trip.';
        }

      });

      return;
    }


    const createRequest: CreateTripRequest = {
      placeIds: formValue.placeIds,
      tripDate: formValue.tripDate,
      tipStatus: formValue.tipStatus,
      tipAmount: formValue.tipStatus
        ? formValue.tipAmount
        : 0,
      note:formValue.note
    };

    this.tripService.create(createRequest).subscribe({

      next: () => {
        this.loading = false;
        this.successMessage = 'Trips created successfully.';

        setTimeout(() => {
          this.router.navigate(['/trips']);
        }, 500);
      },

      error: (error) => {
        this.loading = false;

        console.error('Create trip error:', error);

        this.errorMessage =
          error?.error?.message ??
          'Unable to create trips.';
      }

    });
  }


  get selectedPlaceCount(): number {
    return this.tripForm.controls.placeIds.value.length;
  }


  togglePlaceDropdown(): void {
    this.placeDropdownOpen = !this.placeDropdownOpen;
  }


  isAllPlacesSelected(): boolean {

    const selectedIds = this.tripForm.controls.placeIds.value;
    const places = this.places();

    return places.length > 0 &&
          selectedIds.length === places.length;
  }


  isSomePlacesSelected(): boolean {

    const selectedIds = this.tripForm.controls.placeIds.value;
    const places = this.places();

    return selectedIds.length > 0 &&
          selectedIds.length < places.length;
  }


  toggleSelectAll(event: Event): void {

    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {

      const allPlaceIds = this.places().map(
        place => place.id
      );

      this.tripForm.controls.placeIds.setValue(
        allPlaceIds
      );

    } else {

      this.tripForm.controls.placeIds.setValue([]);

    }

    this.tripForm.controls.placeIds.markAsTouched();
  }


  togglePlace(placeId: number, event: Event): void {

    const checkbox = event.target as HTMLInputElement;

    const currentIds = this.tripForm.controls.placeIds.value;

    if (checkbox.checked) {

      if (!currentIds.includes(placeId)) {

        this.tripForm.controls.placeIds.setValue([
          ...currentIds,
          placeId
        ]);

      }

    } else {

      this.tripForm.controls.placeIds.setValue(
        currentIds.filter(id => id !== placeId)
      );

    }

    this.tripForm.controls.placeIds.markAsTouched();
  }


preventNegativeSymbols(event: KeyboardEvent): void {
  if (event.key === '-' || event.key === '+' || event.key === '.') {
    event.preventDefault();
  }
}

enforceTripBounds(event: Event): void {
  const input = event.target as HTMLInputElement;
  let value = parseInt(input.value, 10);


  if (input.value === '') return;


  if (value < 1 || isNaN(value)) {
    this.tripForm.controls.tipAmount.setValue(1);
    input.value = '1';
  } 

  else if (value > 20) {
    this.tripForm.controls.tipAmount.setValue(20);
    input.value = '20';
  }
}

  clear(): void {
    this.tripForm.reset({
      placeIds: [],
      tripDate: '',
      tipStatus: false,
      tipAmount: 0,
      note: ''
    });

    this.errorMessage = '';
    this.successMessage = '';
  }

  cancel(): void {
    this.router.navigate(['/trips']);
  }
}