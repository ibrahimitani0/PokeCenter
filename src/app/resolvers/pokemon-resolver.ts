import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { FetchNationalDex } from '../services/fetch-national-dex';
import { Pokemon } from '../models/Pokemon/poke-details';

@Injectable({ providedIn: 'root' })
export class PokemonResolver implements Resolve<Pokemon[]> {
  constructor(private fetchNationalDex: FetchNationalDex) {}

  resolve(): Observable<Pokemon[]> {
    return this.fetchNationalDex.getPokemonList();
  }
}
