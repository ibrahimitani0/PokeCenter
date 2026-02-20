import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { typeResolverResolver } from './type-resolver-resolver';

describe('typeResolverResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => typeResolverResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
