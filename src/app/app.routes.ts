import { Routes } from '@angular/router';

import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard/dashboard';
import { PlaceList } from './features/places/place-list/place-list';
import { PlaceForm } from './features/places/place-form/place-form';
import { MainLayout } from './layout/main-layout/main-layout';
import { authGuard, roleGuard,permissionGuard } from './core/guards/auth-guard';
import { TripList } from './features/trips/trip-list/trip-list';
import { TripForm } from './features/trips/trip-form/trip-form';
import { ReportView } from './features/reports/report-view/report-view';
import { BusListComponent } from './features/buses/bus-list/bus-list';
import { BusFormComponent } from './features/buses/bus-form/bus-form';
import { SeatLayout } from './features/seat-layout/seat-layout/seat-layout';
import { RouteList } from './features/routes/route-list/route-list';
import { RouteForm } from './features/routes/route-form/route-form';

import { TripScheduleList } from './features/trips-schedules/trip-list/trip-list';
import { TripScheduleForm } from './features/trips-schedules/trip-form/trip-form';


import{TripSearchComponent} from './features/booking/search/search';
import { SeatMap } from './features/booking/seat-map/seat-map';
import { Passenger } from './features/booking/passenger/passenger';
import { Payment } from './features/booking/payment/payment';
import { Ticket } from './features/booking/ticket/ticket';
import { RegisterComponent } from './features/auth/registration/registration';
import { ResetPassword } from './features/auth/reset-password/reset-password';
import { ForgotPassword } from './features/auth/forgot-password/forgot-password';
import { Permissions } from './core/constants/permissions';


export const routes: Routes = [

  // =====================================================
  // PUBLIC ROUTES
  // =====================================================

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
    path: 'auth/register',
    component: RegisterComponent
  },

  {
    path: 'auth/forgot-password',
    component: ForgotPassword
  },

  {
    path: 'auth/reset-password',
    component: ResetPassword
  },


  // =====================================================
  // AUTHENTICATED AREA
  // =====================================================

  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],

    children: [

      // =================================================
      // COMMON
      // =================================================

      {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [
          permissionGuard(
            Permissions.DashboardView
          )
        ]
      },

      {
        path: '',
        canActivate: [
          roleGuard(['Admin'])
        ],

        children: [

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
        ]
      },

      // =================================================
      // ADMIN ROUTES
      // =================================================

      // {
      //   path: 'admin',
      //   canActivate: [
      //     roleGuard(['Admin'])
      //   ],

      //   children: [

          

      //     {
      //       path: 'buses',
      //       component: BusListComponent
      //     },
      //     {
      //       path: 'buses/create',
      //       component: BusFormComponent
      //     },
      //     {
      //       path: 'buses/edit/:id',
      //       component: BusFormComponent
      //     },
      //     {
      //       path: 'buses/:busId/seats',
      //       component: SeatLayout
      //     },

      //     {
      //       path: 'routes',
      //       component: RouteList
      //     },
      //     {
      //       path: 'routes/create',
      //       component: RouteForm
      //     },
      //     {
      //       path: 'routes/:id/edit',
      //       component: RouteForm
      //     },
      //     {
      //       path: 'trips/schedules',
      //       component: TripScheduleList
      //     },

      //     {
      //       path: 'trips/schedules/create',
      //       component: TripScheduleForm
      //     },

      //     {
      //       path: 'trips/schedules/edit/:id',
      //       component: TripScheduleForm
      //     },
         
          


      //   ]
      // },

      {
        path: 'admin',
        canActivate: [
          roleGuard(['Admin'])
        ],

        children: [

          // =================================================
          // BUSES
          // =================================================

          {
            path: 'buses',
            component: BusListComponent,

            canActivate: [
              permissionGuard(
                Permissions.BusView
              )
            ]
          },

          {
            path: 'buses/create',
            component: BusFormComponent,

            canActivate: [
              permissionGuard(
                Permissions.BusCreate
              )
            ]
          },

          {
            path: 'buses/edit/:id',
            component: BusFormComponent,

            canActivate: [
              permissionGuard(
                Permissions.BusEdit
              )
            ]
          },

          {
            path: 'buses/:busId/seats',
            component: SeatLayout,

            canActivate: [
              permissionGuard(
                Permissions.BusSeatEdit
              )
            ]
          },


          // =================================================
          // ROUTES
          // =================================================

          {
            path: 'routes',
            component: RouteList,

            canActivate: [
              permissionGuard(
                Permissions.RouteView
              )
            ]
          },

          {
            path: 'routes/create',
            component: RouteForm,

            canActivate: [
              permissionGuard(
                Permissions.RouteCreate
              )
            ]
          },

          {
            path: 'routes/:id/edit',
            component: RouteForm,

            canActivate: [
              permissionGuard(
                Permissions.RouteEdit
              )
            ]
          },


          // =================================================
          // TRIP SCHEDULES
          // =================================================

          {
            path: 'trips/schedules',
            component: TripScheduleList,

            canActivate: [
              permissionGuard(
                Permissions.TripScheduleView
              )
            ]
          },

          {
            path: 'trips/schedules/create',
            component: TripScheduleForm,

            canActivate: [
              permissionGuard(
                Permissions.TripScheduleCreate
              )
            ]
          },

          {
            path: 'trips/schedules/edit/:id',
            component: TripScheduleForm,

            canActivate: [
              permissionGuard(
                Permissions.TripScheduleEdit
              )
            ]
          },


        ]
      },


      // =================================================
      // ADMIN + CUSTOMER
      // =================================================

      {
        path: 'search',
        component: TripSearchComponent,

        // canActivate: [
        //   roleGuard([
        //     'Admin',
        //     'Customer'
        //   ])
        // ]
        canActivate: [
          permissionGuard(
            Permissions.TripSearch
          )
        ]
      },



      // =================================================
      // CUSTOMER BOOKING
      // =================================================

      // {
      //   path: 'booking',
      //   canActivate: [
      //     roleGuard([
      //       'Admin',
      //       'Customer'
      //     ])
      //   ],

      //   children: [

      //     {
      //       path: 'seat-map/:tripId',
      //       component: SeatMap
      //     },  
      //     {
      //       path: 'passenger',
      //       component: Passenger
      //     },
      //     {
      //       path: 'payment',
      //       component: Payment
      //     },
      //     {
      //       path: 'ticket',
      //       component: Ticket
      //     }

      //   ]
      // },

      {
        path: 'booking',

        canActivate: [
          roleGuard(['Admin','Customer'])
        ],

        children: [

          {
            path: 'seat-map/:tripId',

            component: SeatMap,

            canActivate: [
              permissionGuard(
                Permissions.BookingCreate
              )
            ]
          },

          {
            path: 'passenger',

            component: Passenger,

            canActivate: [
              permissionGuard(
                Permissions.BookingCreate
              )
            ]
          },

          {
            path: 'payment',

            component: Payment,

            canActivate: [
              permissionGuard(
                Permissions.BookingCreate
              )
            ]
          },

          {
            path: 'ticket',

            component: Ticket,

            canActivate: [
              permissionGuard(
                Permissions.BookingView
              )
            ]
          }

        ]
      }


    ]
  },


  {
    path: '**',
    redirectTo: 'login'
  }

];