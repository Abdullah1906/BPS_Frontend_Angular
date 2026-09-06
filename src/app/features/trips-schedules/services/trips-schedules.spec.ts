import { TestBed } from '@angular/core/testing';

import { TripsSchedules } from './trips-schedules';

describe('TripsSchedules', () => {
  let service: TripsSchedules;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TripsSchedules);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
