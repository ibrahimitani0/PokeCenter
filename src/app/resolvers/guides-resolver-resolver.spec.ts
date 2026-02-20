import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { guidesResolverResolver } from './guides-resolver-resolver';

describe('guidesResolverResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => guidesResolverResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
