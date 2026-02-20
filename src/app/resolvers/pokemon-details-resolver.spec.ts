import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { pokemonDetailsResolver } from './pokemon-details-resolver';

describe('pokemonDetailsResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => pokemonDetailsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
