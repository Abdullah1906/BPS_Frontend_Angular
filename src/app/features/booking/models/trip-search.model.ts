export interface TripSearchResponse {
  tripId: number;
  busId: number;
  busName: string;
  busNumber: string;

  routeId: number;
  fromPlace: string;
  toPlace: string;

  tripDate: string;
  departureTime: string;
  arrivalTime?: string | null;

  fare: number;

  totalSeats: number;
  availableSeats: number;
}