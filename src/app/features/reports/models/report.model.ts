export interface Report {
  id: number;
  reportDate: string;
  placeId: number;
  placeName: string;
  price: number;
  tipAmount: number;
  total: number;
  tipStatus: boolean;
}

export interface ReportFilter {
  fromDate?: string;
  toDate?: string;
  placeId?: number;
  period?: string;
}