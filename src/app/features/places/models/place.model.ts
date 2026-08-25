export interface Place {
  id: number;
  placeName: string;
  pricePerTrip: number;
  isActive: boolean;
  updateAt?: string;
}

export interface CreatePlaceRequest {
  placeName: string;
  pricePerTrip: number;
}

export interface UpdatePlaceRequest {
  placeName: string;
  pricePerTrip: number;
  isActive: boolean;
}