import { Routes } from '@angular/router';

import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard/dashboard';
import { PlaceList } from './features/places/place-list/place-list';
import { PlaceForm } from './features/places/place-form/place-form';
import { MainLayout } from './layout/main-layout/main-layout';
import { authGuard } from './core/guards/auth-guard';
import { TripList } from './features/trips/trip-list/trip-list';
import { TripForm } from './features/trips/trip-form/trip-form';
import { ReportView } from './features/reports/report-view/report-view';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [

      {
        path: 'dashboard',
        component: Dashboard
      },

      {
        path: 'places',
        component: PlaceList
      },

      {
        path: 'places/create',
        component: PlaceForm
      },
      {
        path: 'places/:id/edit',
        component: PlaceForm
      },
      {
        path: 'trips',
        component: TripList
      },
      {
        path: 'trips/create',
        component: TripForm
      },
      {
        path: 'trips/:id/edit',
        component: TripForm
      },
      {
        path: 'reports',
        component: ReportView
      }

    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];