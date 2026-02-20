import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FetchNationalDex } from '../services/fetch-national-dex';
import { Move, Movedata } from '../services/movedata';
import { BattleItems } from '../models/battle-items';
import { Natures } from '../models/Pokemon/all-natures';
import { AllAbilities } from '../models/Pokemon/all-abilities';
import { EggGroups } from '../models/Pokemon/all-egg-groups';
import { Character } from '../models/Pokemon/characteristics';

export interface GuideData {
  natures: Natures[] | null;
  abilities: AllAbilities[] | null;
  eggGroups: EggGroups[] | null;
  characteristics: Character[] | null;
  moves: Move[] | null;
  items: BattleItems[] | null;
  // add more guide data fields here if needed
}

@Injectable({ providedIn: 'root' })
export class GuidesResolver implements Resolve<GuideData> {
  constructor(private fetchNationalDex: FetchNationalDex, private movedata: Movedata) {}

  resolve(): Observable<GuideData> {
    return forkJoin({
      natures: this.fetchNationalDex.getAllNatures().pipe(catchError(() => of(null))),
      abilities: this.fetchNationalDex.getAllAbilities().pipe(catchError(() => of(null))),
      eggGroups: this.fetchNationalDex.getAllEggGrroups().pipe(catchError(() => of(null))),
      characteristics: this.fetchNationalDex.getCharacteristics().pipe(catchError(() => of(null))),
      moves: this.movedata.getAllMoves().pipe(catchError(() => of(null))),
      items: this.fetchNationalDex.getAllBattleItems().pipe(catchError(()=> of(null)))
      // add other guide data fetches here if needed
    });
  }
}
