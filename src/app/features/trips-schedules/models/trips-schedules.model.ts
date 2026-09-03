export interface CreateTripScheduleDto {
  busId: number;
  routeId: number;
  tripDate: string;
  departureTime: string;
  arrivalTime?: string;
  fare: number;
}

export interface TripScheduleDto {
  id: number;

  busId: number;
  busName: string;
  busNumber: string;

  routeId: number;
  fromPlace: string;
  toPlace: string;

  tripDate: string;

  departureTime: string;
  arrivalTime?: string;

  fare: number;

  isActive: boolean;

  createdAt: string;
  createdBy?: string;
}