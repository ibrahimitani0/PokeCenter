import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, shareReplay } from 'rxjs';

export interface Move {
  id: number;
  name: string;
  type: string;
  category: string;
  power: number;
  accuracy: number;
  pp: number;
  effect: string;
  generation_introduced: string;
  machines: MachineInfo[]; // <-- Updated
  flavor_texts: string[];
  short_effect: string;
}

export interface LearnsetEntry {
  move_id: number;
  move_name: string;
  learn_method: string; // e.g. 'level-up', 'tm', 'egg', 'tutor'
  level: number;
  version_group: string; // e.g. 'gold-silver'
  machines: MachineInfo[];
}

export interface MachineInfo {
  machine: string; // e.g., "tm47"
  version_group: string; // e.g., "sword-shield"
}

@Injectable({
  providedIn: 'root',
})
export class Movedata {
  private movesURL = 'assets/DB/moves.json';
  private learnsetsURL = 'assets/DB/learnsets.json';
  private moves$!: Observable<Move[]>;
  private learnsets$!: Observable<Record<string, LearnsetEntry[]>>;

  constructor(private http: HttpClient) {
    this.moves$ = this.http.get<Move[]>(this.movesURL).pipe(shareReplay(1));
    this.learnsets$ = this.http
      .get<Record<string, LearnsetEntry[]>>(this.learnsetsURL)
      .pipe(shareReplay(1));
  }

  getAllMoves(): Observable<Move[]> {
    return this.moves$;
  }

  getLearnsetForPokemon(pokemonName: string): Observable<LearnsetEntry[]> {
    return this.learnsets$.pipe(
      map((learnsets) => learnsets[pokemonName.toLowerCase()] || [])
    );
  }

  getMoveByName(name: string): Observable<Move | null> {
    return this.http.get<Move[]>(this.movesURL).pipe(
      map((moves: Move[]) => {
        const match = moves.find(
          (m) => m.name.toLowerCase() === name.toLowerCase()
        );
        return match || null;
      })
    );
  }

  // Join learnset entries with move details for a Pokémon
  getDetailedLearnset(
    pokemonName: string
  ): Observable<(LearnsetEntry & { moveDetails: Move })[]> {
    return forkJoin({
      moves: this.moves$,
      learnset: this.getLearnsetForPokemon(pokemonName),
    }).pipe(
      map(({ moves, learnset }) =>
        learnset.map((entry) => ({
          ...entry,
          moveDetails: moves.find((m) => m.name === entry.move_name) as Move,
        }))
      )
    );
  }

  // Returns Pokémon that learn a given move by move_id
  getPokemonThatLearnMove(
    moveId: number
  ): Observable<{ pokemon: string; methods: LearnsetEntry[] }[]> {
    return this.learnsets$.pipe(
      map((learnsets) => {
        const result: { pokemon: string; methods: LearnsetEntry[] }[] = [];

        for (const [pokemonName, entries] of Object.entries(learnsets)) {
          const matchingEntries = entries.filter(
            (entry) => entry.move_id === moveId
          );
          if (matchingEntries.length > 0) {
            result.push({ pokemon: pokemonName, methods: matchingEntries });
          }
        }

        return result;
      })
    );
  }
}
