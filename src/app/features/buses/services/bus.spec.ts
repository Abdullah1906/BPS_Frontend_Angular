import { TestBed } from '@angular/core/testing';

import { Bus } from './bus';

describe('Bus', () => {
  let service: Bus;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Bus);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
