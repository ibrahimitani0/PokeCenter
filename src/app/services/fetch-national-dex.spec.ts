import { TestBed } from '@angular/core/testing';

import { FetchNationalDex } from './fetch-national-dex';

describe('FetchNationalDex', () => {
  let service: FetchNationalDex;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchNationalDex);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
