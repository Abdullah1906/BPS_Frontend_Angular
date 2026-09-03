export interface BusSeatDto {
  id: number;
  busId: number;
  seatNumber: string;
  rowNumber: number;
  columnNumber: number;
  isWindow: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CreateBusSeatDto {
  seatNumber: string;
  rowNumber: number;
  columnNumber: number;
  isWindow: boolean;
}

export interface UpdateBusSeatDto extends CreateBusSeatDto {
  isActive: boolean;
}