import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FetchNationalDex } from '../services/fetch-national-dex';
import { AllAbilities } from '../models/Pokemon/all-abilities';

@Injectable({ providedIn: 'root' })
export class AbilityResolver implements Resolve<AllAbilities | null> {
  constructor(private fetchNationalDex: FetchNationalDex) {}

  resolve(route: ActivatedRouteSnapshot): Observable<AllAbilities | null> {
    const abilityName = route.paramMap.get('name');

    if (!abilityName) {
      return of(null);
    }

    return this.fetchNationalDex.getAbility(abilityName).pipe(catchError(() => of(null)));
  }
}
