
export type StaffRole =
  | 'Driver'
  | 'Supervisor'
  | 'Helper'
  | 'Office Staff';

export type StaffStatus = 'Active' | 'Inactive';

export type LicenseType = 'Heavy' | 'Medium';

export interface Staff {
  staffId: number;
  fullName: string;
  phoneNumber: string;
  nidNumber: string;
  roleType: StaffRole;
  joiningDate: string;
  drivingLicenseNumber?: string | null;
  licenseExpiryDate?: string | null;
  licenseType?: LicenseType | null;
  baseSalary: number;
  status: StaffStatus;
}

export interface StaffDetails extends Staff {
  alternativeContact?: string | null;
  presentAddress?: string | null;
  permanentAddress?: string | null;
  passportOrBirthCertificate?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  mobileBankingProvider?: string | null;
  mobileBankingNumber?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateStaffRequest {
  fullName: string;
  phoneNumber: string;
  alternativeContact?: string | null;
  presentAddress?: string | null;
  permanentAddress?: string | null;
  nidNumber: string;
  passportOrBirthCertificate?: string | null;
  roleType: StaffRole;
  joiningDate: string;
  drivingLicenseNumber?: string | null;
  licenseExpiryDate?: string | null;
  licenseType?: LicenseType | null;
  baseSalary: number;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  mobileBankingProvider?: string | null;
  mobileBankingNumber?: string | null;
}

export interface UpdateStaffRequest extends CreateStaffRequest {}

export interface UpdateStaffStatusRequest {
  status: StaffStatus;
}

export interface PagedResponse<T> {
  items: T[];
  totalRecords: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
