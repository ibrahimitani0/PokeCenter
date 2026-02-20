import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Movedata, Move } from '../services/movedata';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MoveDetailResolver implements Resolve<Move | null> {
  constructor(private movedata: Movedata) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Move | null> {
    const name = route.paramMap.get('name')!;
    return this.movedata.getMoveByName(name).pipe(
      catchError(err => {
        console.error(err);
        return of(null);
      })
    );
  }
}
