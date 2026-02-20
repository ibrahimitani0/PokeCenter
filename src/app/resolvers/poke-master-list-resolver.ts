import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { FetchNationalDex } from '../services/fetch-national-dex';
import { Pokemon, Variety } from '../models/Pokemon/poke-details';

@Injectable({ providedIn: 'root' })
export class PokeMasterListResolver implements Resolve<(Pokemon | Variety)[]> {
  constructor(private fetchNationalDex: FetchNationalDex) {}

  resolve(): Observable<(Pokemon | Variety)[]> {
    return this.fetchNationalDex.getPokemonMasterList();
  }
}
