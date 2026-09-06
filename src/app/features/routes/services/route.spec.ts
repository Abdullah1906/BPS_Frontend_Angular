import { TestBed } from '@angular/core/testing';

import { Route } from './route';

describe('Route', () => {
  let service: Route;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Route);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
