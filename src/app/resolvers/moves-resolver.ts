import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Movedata } from '../services/movedata';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Move, LearnsetEntry } from '../services/movedata';

@Injectable({ providedIn: 'root' })
export class MovesResolver implements Resolve<(LearnsetEntry & { moveDetails: Move })[]> {
  constructor(private movedata: Movedata) {}

  resolve(route: ActivatedRouteSnapshot): Observable<(LearnsetEntry & { moveDetails: Move })[]> {
    const name = route.paramMap.get('name')!;
    return this.movedata.getDetailedLearnset(name).pipe(
      catchError(err => {
        
        return of([]);
      })
    );
  }
}
