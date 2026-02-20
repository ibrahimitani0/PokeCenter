import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { eggGroupResolver } from './egg-group-resolver';

describe('eggGroupResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => eggGroupResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
