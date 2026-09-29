export interface Trip {
  id: number;
  placeId: number;
  placeName: string;
  tripDate: string;
  tipStatus: boolean;
  tipAmount: number;
  price: number;
  total: number;
  note : string;
}

export interface CreateTripRequest {
  placeIds: number[];
  tripDate: string;
  tipStatus: boolean;
  tipAmount: number;
  note : string;
}

export interface UpdateTripRequest {
  placeId: number;
  tripDate: string;
  tipStatus: boolean;
  tipAmount: number;
  note: string;
}

export interface TripPagedResponse {

  items: Trip[];

  page: number;

  pageSize: number;

  totalCount: number;

  totalPages: number;
}