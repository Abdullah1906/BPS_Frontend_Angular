import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusFormComponent } from './bus-form';

describe('BusFormComponent', () => {
  let component: BusFormComponent;
  let fixture: ComponentFixture<BusFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
