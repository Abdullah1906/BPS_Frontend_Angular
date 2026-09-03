export interface BusDto {
  id: number;
  busName: string;
  busNumber: string;
  totalSeats: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateBusDto {
  busName: string;
  busNumber: string;
  totalSeats: number;
}

export interface UpdateBusDto extends CreateBusDto {
  isActive: boolean;
}