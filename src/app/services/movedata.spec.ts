import { TestBed } from '@angular/core/testing';

import { Movedata } from './movedata';

describe('Movedata', () => {
  let service: Movedata;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Movedata);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
