import { TestBed } from '@angular/core/testing';

import { TripSearchService } from './search';

describe('TripSearchService', () => {
  let service: TripSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TripSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
