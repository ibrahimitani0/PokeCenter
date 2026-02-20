import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { abilitiyResolver } from './abilitiy-resolver';

describe('abilitiyResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => abilitiyResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
