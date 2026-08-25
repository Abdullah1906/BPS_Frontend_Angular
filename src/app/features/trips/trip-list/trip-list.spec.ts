import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripList } from './trip-list';

describe('TripList', () => {
  let component: TripList;
  let fixture: ComponentFixture<TripList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
