import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FetchNationalDex } from '../services/fetch-national-dex';
import { EggGroups } from '../models/Pokemon/all-egg-groups';

@Injectable({ providedIn: 'root' })
export class EggGroupsResolver implements Resolve<EggGroups | null> {
  constructor(private fetchNationalDex: FetchNationalDex) {}

  resolve(route: ActivatedRouteSnapshot): Observable<EggGroups | null> {
    const egg = route.paramMap.get('name');

    if (!egg) {
      return of(null);
    }

    return this.fetchNationalDex.getEggGroup(egg).pipe(catchError(() => of(null)));
  }
}
