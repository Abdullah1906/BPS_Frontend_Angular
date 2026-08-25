import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlaceService } from '../services/place';

@Component({
  selector: 'app-place-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './place-form.html',
  styleUrl: './place-form.scss'
})
export class PlaceForm implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly placeService = inject(PlaceService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  loading = false;
  errorMessage = '';
  successMessage = '';

  isEditMode = signal(false);
  placeId: number | null = null;

  placeForm = this.fb.nonNullable.group({
    placeName: ['', [Validators.required, Validators.maxLength(150)]],
    pricePerTrip: [0, [Validators.required, Validators.min(0)]],
    isActive: [true]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.placeId = Number(idParam);
      this.isEditMode.set(true);
      this.loadPlace(this.placeId);
    }
  }

  loadPlace(id: number): void {
    this.loading = true;

    this.placeService.getById(id).subscribe({
      next: (place) => {
        this.placeForm.patchValue({
          placeName: place.placeName,
          pricePerTrip: place.pricePerTrip,
          isActive: place.isActive
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Load place error:', error);
        this.errorMessage = 'Unable to load place.';
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (this.placeForm.invalid) {
      this.placeForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.placeForm.getRawValue();

    if (this.isEditMode() && this.placeId !== null) {

      this.placeService.update(this.placeId, formValue).subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Place updated successfully.';

          setTimeout(() => {
            this.router.navigate(['/places']);
          }, 500);
        },
        error: (error) => {
          this.loading = false;
          console.error('Update place error:', error);
          this.errorMessage = error?.error?.message ?? 'Unable to update place.';
        }
      });

    } else {

      const createRequest = {
        placeName: formValue.placeName,
        pricePerTrip: formValue.pricePerTrip
      };

      this.placeService.create(createRequest).subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Place created successfully.';

          setTimeout(() => {
            this.router.navigate(['/places']);
          }, 500);
        },
        error: (error) => {
          this.loading = false;
          console.error('Create place error:', error);
          this.errorMessage = error?.error?.message ?? 'Unable to create place.';
        }
      });

    }
  }

  clear(): void {
    this.placeForm.reset({
      placeName: '',
      pricePerTrip: 0,
      isActive: true
    });

    this.errorMessage = '';
    this.successMessage = '';
  }

  cancel(): void {
    this.router.navigate(['/places']);
  }
}