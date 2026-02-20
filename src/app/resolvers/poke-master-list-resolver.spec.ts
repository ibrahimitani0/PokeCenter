import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { pokeMasterListResolver } from './poke-master-list-resolver';

describe('pokeMasterListResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => pokeMasterListResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
