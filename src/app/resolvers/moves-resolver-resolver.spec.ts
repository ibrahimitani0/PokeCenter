import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { movesResolverResolver } from './moves-resolver-resolver';

describe('movesResolverResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => movesResolverResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
