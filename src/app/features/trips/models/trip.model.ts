export interface Trip {
  id: number;
  placeId: number;
  placeName: string;
  tripDate: string;
  tipStatus: boolean;
  tipAmount: number;
  price: number;
  total: number;
}

export interface CreateTripRequest {
  placeId: number;
  tripDate: string;
  tipStatus: boolean;
  tipAmount: number;
}

export interface UpdateTripRequest {
  placeId: number;
  tripDate: string;
  tipStatus: boolean;
  tipAmount: number;
}