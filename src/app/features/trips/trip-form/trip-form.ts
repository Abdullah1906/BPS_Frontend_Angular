import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TripService } from '../services/trip';
import { PlaceService } from '../../places/services/place';
import { Place } from '../../places/models/place.model';

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

  loading = false;
  errorMessage = '';
  successMessage = '';

  isEditMode = signal(false);
  tripId: number | null = null;

  places = signal<Place[]>([]);

  tripForm = this.fb.nonNullable.group({
    placeId: [0, [Validators.required, Validators.min(1)]],
    tripDate: ['', [Validators.required]],
    tipStatus: [false],
    tipAmount: [0]
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
    this.placeService.getAll().subscribe({
      next: (data) => this.places.set(data),
      error: (error) => console.error('Load places error:', error)
    });
  }

  loadTrip(id: number): void {
    this.loading = true;

    this.tripService.getById(id).subscribe({
      next: (trip) => {
        this.tripForm.patchValue({
          placeId: trip.placeId,
          tripDate: trip.tripDate.substring(0, 10),
          tipStatus: trip.tipStatus,
          tipAmount: trip.tipAmount
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

      this.tripService.update(this.tripId, formValue).subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Trip updated successfully.';
          setTimeout(() => this.router.navigate(['/trips']), 500);
        },
        error: (error) => {
          this.loading = false;
          console.error('Update trip error:', error);
          this.errorMessage = error?.error?.message ?? 'Unable to update trip.';
        }
      });

    } else {

      this.tripService.create(formValue).subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Trip created successfully.';
          setTimeout(() => this.router.navigate(['/trips']), 500);
        },
        error: (error) => {
          this.loading = false;
          console.error('Create trip error:', error);
          this.errorMessage = error?.error?.message ?? 'Unable to create trip.';
        }
      });

    }
  }

  clear(): void {
    this.tripForm.reset({
      placeId: 0,
      tripDate: '',
      tipStatus: false,
      tipAmount: 0
    });

    this.errorMessage = '';
    this.successMessage = '';
  }

  cancel(): void {
    this.router.navigate(['/trips']);
  }
}