import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffForm } from './staff-form';

describe('StaffForm', () => {
  let component: StaffForm;
  let fixture: ComponentFixture<StaffForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
