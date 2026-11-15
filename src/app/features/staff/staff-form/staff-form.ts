
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { StaffService } from '../services/staff.service';

import {
  StaffRole,
  LicenseType,
  CreateStaffRequest,
  UpdateStaffRequest,
  StaffDetails
} from '../models/staff.model';

@Component({
  selector: 'app-staff-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './staff-form.html',
  styleUrl: './staff-form.scss'
})
export class StaffForm implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly staffService = inject(StaffService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  staffId: number | null = null;

  isEditMode = false;
  loading = false;
  submitting = false;
  errorMessage = '';

  readonly roles: StaffRole[] = [
    'Driver',
    'Supervisor',
    'Helper',
    'Office Staff'
  ];

  readonly licenseTypes: LicenseType[] = [
    'Heavy',
    'Medium'
  ];

  readonly mobileBankingProviders = [
    'Bkash',
    'Nagad',
    'Rocket',
    'Upay'
  ];

  staffForm = this.fb.group({

    fullName: ['', [
      Validators.required,
      Validators.maxLength(150)
    ]],

    phoneNumber: ['', [
      Validators.required,
      Validators.maxLength(20)
    ]],

    alternativeContact: [''],

    presentAddress: [''],

    permanentAddress: [''],

    nidNumber: ['', [
      Validators.required,
      Validators.maxLength(30)
    ]],

    passportOrBirthCertificate: [''],

    roleType: ['Driver' as StaffRole, [
      Validators.required
    ]],

    joiningDate: ['', [
      Validators.required
    ]],

    drivingLicenseNumber: [''],

    licenseExpiryDate: [''],

    licenseType: ['' as LicenseType | '', []],

    baseSalary: [0, [
      Validators.required,
      Validators.min(0)
    ]],

    bankName: [''],

    bankAccountNumber: [''],

    mobileBankingProvider: [''],

    mobileBankingNumber: ['']

  });

  ngOnInit(): void {

    this.staffForm.controls.roleType.valueChanges
      .subscribe(role => {

        if (role === 'Driver') {

          this.staffForm.controls.drivingLicenseNumber
            .setValidators([
              Validators.required,
              Validators.maxLength(50)
            ]);

          this.staffForm.controls.licenseExpiryDate
            .setValidators([
              Validators.required
            ]);

          this.staffForm.controls.licenseType
            .setValidators([
              Validators.required
            ]);

        } else {

          this.staffForm.controls.drivingLicenseNumber
            .clearValidators();

          this.staffForm.controls.licenseExpiryDate
            .clearValidators();

          this.staffForm.controls.licenseType
            .clearValidators();

          this.staffForm.patchValue({
            drivingLicenseNumber: '',
            licenseExpiryDate: '',
            licenseType: ''
          });

        }

        this.staffForm.controls.drivingLicenseNumber
          .updateValueAndValidity();

        this.staffForm.controls.licenseExpiryDate
          .updateValueAndValidity();

        this.staffForm.controls.licenseType
          .updateValueAndValidity();

      });

    this.staffId = Number(
      this.route.snapshot.paramMap.get('id')
    ) || null;

    this.isEditMode = this.staffId !== null;

    if (this.isEditMode && this.staffId) {
      this.loadStaff(this.staffId);
    }

  }

  get isDriver(): boolean {
    return this.staffForm.controls.roleType.value === 'Driver';
  }

  loadStaff(id: number): void {

    this.loading = true;
    this.errorMessage = '';

    this.staffService.getStaffById(id)
      .subscribe({

        next: (staff: StaffDetails) => {

          this.staffForm.patchValue({

            fullName: staff.fullName,
            phoneNumber: staff.phoneNumber,
            alternativeContact: staff.alternativeContact ?? '',
            presentAddress: staff.presentAddress ?? '',
            permanentAddress: staff.permanentAddress ?? '',
            nidNumber: staff.nidNumber,
            passportOrBirthCertificate:
              staff.passportOrBirthCertificate ?? '',

            roleType: staff.roleType,
            joiningDate: staff.joiningDate?.substring(0, 10) ?? '',

            drivingLicenseNumber:
              staff.drivingLicenseNumber ?? '',

            licenseExpiryDate:
              staff.licenseExpiryDate?.substring(0, 10) ?? '',

            licenseType: staff.licenseType ?? '',

            baseSalary: staff.baseSalary,

            bankName: staff.bankName ?? '',
            bankAccountNumber: staff.bankAccountNumber ?? '',

            mobileBankingProvider:
              staff.mobileBankingProvider ?? '',

            mobileBankingNumber:
              staff.mobileBankingNumber ?? ''

          });

          this.loading = false;

        },

        error: (error) => {

          console.error('Staff loading failed:', error);

          this.errorMessage =
            error.error?.message ??
            'Unable to load staff information.';

          this.loading = false;

        }

      });

  }

  submit(): void {

    if (this.staffForm.invalid || this.submitting) {

      this.staffForm.markAllAsTouched();
      return;

    }

    this.submitting = true;
    this.errorMessage = '';

    // const value = this.staffForm.getRawValue();

    // const request: CreateStaffRequest = {

    //   fullName: value.fullName.trim(),
    //   phoneNumber: value.phoneNumber.trim(),

    //   alternativeContact:
    //     value.alternativeContact.trim() || null,

    //   presentAddress:
    //     value.presentAddress.trim() || null,

    //   permanentAddress:
    //     value.permanentAddress.trim() || null,

    //   nidNumber: value.nidNumber.trim(),

    //   passportOrBirthCertificate:
    //     value.passportOrBirthCertificate.trim() || null,

    //   roleType: value.roleType,

    //   joiningDate: value.joiningDate,

    //   drivingLicenseNumber: this.isDriver
    //     ? value.drivingLicenseNumber.trim()
    //     : null,

    //   licenseExpiryDate: this.isDriver
    //     ? value.licenseExpiryDate
    //     : null,

    //   licenseType: this.isDriver
    //     ? value.licenseType as LicenseType
    //     : null,

    //   baseSalary: Number(value.baseSalary),

    //   bankName: value.bankName.trim() || null,

    //   bankAccountNumber:
    //     value.bankAccountNumber.trim() || null,

    //   mobileBankingProvider:
    //     value.mobileBankingProvider || null,

    //   mobileBankingNumber:
    //     value.mobileBankingNumber.trim() || null

    // };

    const value = this.staffForm.getRawValue();

    const request: CreateStaffRequest = {

      fullName: (value.fullName ?? '').trim(),
      phoneNumber: (value.phoneNumber ?? '').trim(),

      alternativeContact:
        (value.alternativeContact ?? '').trim() || null,

      presentAddress:
        (value.presentAddress ?? '').trim() || null,

      permanentAddress:
        (value.permanentAddress ?? '').trim() || null,

      nidNumber: (value.nidNumber ?? '').trim(),

      passportOrBirthCertificate:
        (value.passportOrBirthCertificate ?? '').trim() || null,

      roleType: value.roleType as StaffRole,

      joiningDate: value.joiningDate ?? '',

      drivingLicenseNumber: this.isDriver
        ? (value.drivingLicenseNumber ?? '').trim()
        : null,

      licenseExpiryDate: this.isDriver
        ? (value.licenseExpiryDate ?? null)
        : null,

      licenseType: this.isDriver
        ? (value.licenseType as LicenseType)
        : null,

      baseSalary: Number(value.baseSalary ?? 0),

      bankName: (value.bankName ?? '').trim() || null,

      bankAccountNumber:
        (value.bankAccountNumber ?? '').trim() || null,

      mobileBankingProvider:
        value.mobileBankingProvider || null,

      mobileBankingNumber:
        (value.mobileBankingNumber ?? '').trim() || null

    };

    if (this.isEditMode && this.staffId) {

      const updateRequest: UpdateStaffRequest = request;

      this.staffService.updateStaff(
        this.staffId,
        updateRequest
      ).subscribe({

        next: () => {

          this.submitting = false;

          this.router.navigate(['/admin/staff']);

        },

        error: (error) => {

          this.handleSubmitError(error);

        }

      });

    } else {

      this.staffService.createStaff(request)
        .subscribe({

          next: () => {

            this.submitting = false;

            this.router.navigate(['/admin/staff']);

          },

          error: (error) => {

            this.handleSubmitError(error);

          }

        });

    }

  }

  private handleSubmitError(error: any): void {

    console.error('Staff save failed:', error);

    this.errorMessage =
      error.error?.message ??
      'Unable to save staff information. Please try again.';

    this.submitting = false;

  }

}
