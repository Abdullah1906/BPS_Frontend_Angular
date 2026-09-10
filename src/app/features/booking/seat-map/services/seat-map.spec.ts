import { TestBed } from '@angular/core/testing';

import { SeatMap } from './seat-map';

describe('SeatMap', () => {
  let service: SeatMap;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeatMap);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
