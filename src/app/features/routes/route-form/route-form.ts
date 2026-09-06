import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Route as RouteApiService } from '../services/route';

@Component({
  selector: 'app-route-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './route-form.html',
  styleUrl: './route-form.scss',
})
export class RouteForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly routeService = inject(RouteApiService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly routeId = signal<number | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly isEditMode = () => this.routeId() !== null;

  readonly form = this.fb.nonNullable.group({
    fromPlace: ['', [Validators.required, Validators.maxLength(100)]],
    toPlace: ['', [Validators.required, Validators.maxLength(100)]],
    distanceKm: this.fb.control<number | null>(null),
    estimatedMinutes: this.fb.control<number | null>(null),
    isActive: [true],
  });

  ngOnInit(): void {
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    if (!idParam) return;

    const id = Number(idParam);
    if (isNaN(id)) return;

    this.routeId.set(id);
    this.fetchRouteDetails(id);
  }

  fetchRouteDetails(id: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.routeService.getById(id).subscribe({
      next: (route) => {
        this.form.patchValue({
          fromPlace: route.fromPlace,
          toPlace: route.toPlace,
          distanceKm: route.distanceKm ?? null,
          estimatedMinutes: route.estimatedMinutes ?? null,
          isActive: route.isActive,
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Failed to load route details.');
        this.loading.set(false);
      },
    });
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();
    const payload = {
      fromPlace: value.fromPlace,
      toPlace: value.toPlace,
      distanceKm: value.distanceKm ?? undefined,
      estimatedMinutes: value.estimatedMinutes ?? undefined,
    };

    const id = this.routeId();
    const request$ = id
      ? this.routeService.update(id, { ...payload, isActive: value.isActive })
      : this.routeService.create(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/admin/routes']);
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(
          err.error?.message || 'An error occurred while saving the route.'
        );
      },
    });
  }

  resetForm(): void {
    this.form.reset({
      fromPlace: '',
      toPlace: '',
      distanceKm: null,
      estimatedMinutes: null,
      isActive: true,
    });
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  onCancel(): void {
    this.router.navigate(['/admin/routes']);
  }
}