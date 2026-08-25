import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlaceService } from '../services/place';
import { Place } from '../models/place.model';

@Component({
  selector: 'app-place-list',
  standalone: true,
  imports: [],
  templateUrl: './place-list.html',
  styleUrl: './place-list.scss'
})
export class PlaceList implements OnInit {

  private readonly placeService = inject(PlaceService);
  private readonly router = inject(Router);

  places = signal<Place[]>([]);
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadPlaces();
  }

  loadPlaces(): void {
    this.loading = true;

    this.placeService.getAll().subscribe({
      next: (data) => {
        this.places.set(data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Load places error:', error);
        this.errorMessage = 'Unable to load places.';
        this.loading = false;
      }
    });
  }

  create(): void {
    this.router.navigate(['/places/create']);
  }

  edit(id: number): void {
    this.router.navigate(['/places', id, 'edit']);
  }

  delete(id: number): void {
    const confirmed = confirm('Are you sure you want to delete this place?');

    if (!confirmed) {
      return;
    }

    this.placeService.delete(id).subscribe({
      next: () => {
        this.loadPlaces();
      },
      error: (error) => {
        console.error('Delete place error:', error);
        this.errorMessage = 'Unable to delete place.';
      }
    });
  }
}