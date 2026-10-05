export const Permissions = {

  DashboardView: 'dashboard.view',

  // Places
  PlaceView: 'place.view',
  PlaceCreate: 'place.create',
  PlaceEdit: 'place.edit',
  PlaceDelete: 'place.delete',
    // Buses
  BusView: 'bus.view',
  BusCreate: 'bus.create',
  BusEdit: 'bus.edit',
  BusDelete: 'bus.delete',

  BusSeatView: 'bus.seat.view',
  BusSeatCreate: 'bus.seat.create',
  BusSeatEdit: 'bus.seat.edit',
  BusSeatDelete: 'bus.seat.delete',
  BusSeatStatusUpdate: 'bus.seat.status.update',

  RouteView: 'route.view',
  RouteCreate: 'route.create',
  RouteEdit: 'route.edit',
  RouteDelete: 'route.delete',

  // Trips (General trips)
  TripView: 'trip.view',
  TripCreate: 'trip.create',
  TripEdit: 'trip.edit',
  TripDelete: 'trip.delete',

  // Trip Schedules (Admin Trip Schedules)
  TripScheduleView: 'schedule.view',
  TripScheduleCreate: 'schedule.create',
  TripScheduleEdit: 'schedule.edit',
  TripScheduleDelete: 'schedule.delete',

  ReportView: 'report.view',
  ReportExport: 'report.export',

  TripSearch: 'trip.search',

  BookingCreate: 'booking.create',
  BookingView: 'booking.view',
  BookingCancel: 'booking.cancel'

} as const;