export interface RouteDto {
  id: number;
  fromPlace: string;
  toPlace: string;
  distanceKm?: number;
  estimatedMinutes?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateRouteDto {
  fromPlace: string;
  toPlace: string;
  distanceKm?: number;
  estimatedMinutes?: number;
}

export interface UpdateRouteDto extends CreateRouteDto {
  isActive: boolean;
}