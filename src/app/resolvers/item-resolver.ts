import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot} from '@angular/router';
import { BattleItems } from '../models/battle-items';
import { FetchNationalDex } from '../services/fetch-national-dex';
import { catchError, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ItemResolver implements Resolve<BattleItems | null> {
  constructor(private fetchNationalDex: FetchNationalDex) {}

  resolve(route: ActivatedRouteSnapshot): Observable<BattleItems | null> {
    const itemName = route.paramMap.get('name');

    if(!itemName) {
      return of(null);
    }
      
    return this.fetchNationalDex.getItemByName(itemName).pipe(catchError(() => of(null)));
  }
}