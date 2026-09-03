import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusForm } from './bus-form';

describe('BusForm', () => {
  let component: BusForm;
  let fixture: ComponentFixture<BusForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
