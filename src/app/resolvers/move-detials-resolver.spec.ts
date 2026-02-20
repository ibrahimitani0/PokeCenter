import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { moveDetialsResolver } from './move-detials-resolver';

describe('moveDetialsResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => moveDetialsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
