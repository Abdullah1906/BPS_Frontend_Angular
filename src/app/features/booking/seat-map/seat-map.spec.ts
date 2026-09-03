import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatMap } from './seat-map';

describe('SeatMap', () => {
  let component: SeatMap;
  let fixture: ComponentFixture<SeatMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeatMap);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
