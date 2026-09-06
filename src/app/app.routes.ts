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
import { BusListComponent } from './features/buses/bus-list/bus-list';
import { BusFormComponent } from './features/buses/bus-form/bus-form';
import { SeatLayout } from './features/seat-layout/seat-layout/seat-layout';
import { RouteList } from './features/routes/route-list/route-list';
import { RouteForm } from './features/routes/route-form/route-form';


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
      },
      {
        path: 'admin/buses',
        component: BusListComponent
      },
      {
        path: 'admin/buses/create',
        component: BusFormComponent
      },
      {
        path: 'admin/buses/edit/:id',
        component: BusFormComponent
      },
      {
        path: 'admin/buses/:busId/seats',
        component: SeatLayout
      },
      {
        path: 'admin/routes',
        component: RouteList
      },
      {
        path: 'admin/routes/create',
        component: RouteForm
      },
      {
        path: 'admin/routes/:id/edit',
        component: RouteForm
      }

    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];