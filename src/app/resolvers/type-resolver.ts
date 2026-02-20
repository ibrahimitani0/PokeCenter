import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FetchNationalDex } from '../services/fetch-national-dex';
import { PokeTypes } from '../models/Pokemon/type-defences';

@Injectable({ providedIn: 'root' })
export class typeResolver implements Resolve<PokeTypes | null> {
  constructor(private fetchNationalDex: FetchNationalDex) {}

  resolve(route: ActivatedRouteSnapshot): Observable<PokeTypes | null> {
    const typeName = route.paramMap.get('name');

    if (!typeName) {
      return of(null);
    }

    return this.fetchNationalDex.getPokeType(typeName).pipe(catchError(() => of(null)));
  }
}