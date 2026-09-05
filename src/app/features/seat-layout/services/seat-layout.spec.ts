import { TestBed } from '@angular/core/testing';

import { SeatLayout } from './seat-layout';

describe('SeatLayout', () => {
  let service: SeatLayout;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeatLayout);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
