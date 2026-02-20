import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { BattleItems } from '../models/battle-items';
import { Pokemon, Variety } from '../models/Pokemon/poke-details';
import { EvolutionChain } from '../models/Pokemon/poke-evolution';
import { Natures } from '../models/Pokemon/all-natures';
import { AllAbilities } from '../models/Pokemon/all-abilities';
import { EggGroups } from '../models/Pokemon/all-egg-groups';
import { Character } from '../models/Pokemon/characteristics';
import { PokeTypes } from '../models/Pokemon/type-defences';
import { PokemonSprites } from '../models/Pokemon/sprite-gallery';

@Injectable({
  providedIn: 'root',
})
export class FetchNationalDex {
  private jsonURL = 'assets/DB/Pokedex.json';
  private formsURL = 'assets/DB/Poke_Varieties.json';
  private evolutionChainsURL = 'assets/DB/Pokemon_Evolution_Chains.json';
  private spritesURL = 'assets/DB/Sprites.json';
  private naturesURL = 'assets/DB/Natures.json';
  private allAbilitiesURL = 'assets/DB/AllAbilities.json';
  private allEggGroupsURL = 'assets/DB/egg_groups.json';
  private characteristicsURL = 'assets/DB/characteristics.json';
  private pokeTypesURL = 'assets/DB/Types.json';
  private battleItemsURL = 'assets/DB/Battle-Items.json';
  private pokemon: Observable<Pokemon[]> | undefined;
  private evolutionChains$: Observable<EvolutionChain[]> | undefined;
  private spriteData$: Observable<PokemonSprites[]> | undefined;
  private natures: Observable<Natures[]> | undefined;
  private abilities: Observable<AllAbilities[]> | undefined;
  private eggGroups: Observable<EggGroups[]> | undefined;
  private characteristics: Observable<Character[]> | undefined;
  private pokeTypes: Observable<PokeTypes[]> | undefined;
  private pokeForms: Observable<Variety[]> | undefined;
  private battleItems: Observable<BattleItems[]> | undefined;

  constructor(private http: HttpClient) {}

  getPokemonList(): Observable<Pokemon[]> {
    if (!this.pokemon) {
      this.pokemon = this.http.get<Pokemon[]>(this.jsonURL).pipe(
        switchMap((pokemonList) =>
          this.getPokeForms().pipe(
            map((varietiesList) => {
              const varietyMap = new Map<number, Variety>();
              for (const variety of varietiesList) {
                varietyMap.set(variety.dex_number, variety);
              }

              return pokemonList.map((pokemon) => {
                const enrichedVarieties =
                  pokemon.varieties?.map((v) => {
                    const full = varietyMap.get(v.form_id);
                    return full
                      ? { ...v, ...full } // merge original `v` with full details
                      : v;
                  }) || [];

                return { ...pokemon, varieties: enrichedVarieties };
              });
            })
          )
        ),
        shareReplay(1)
      );
    }

    return this.pokemon;
  }

  getPokemonByName(name: string): Observable<Pokemon> {
    return this.getPokemonList().pipe(
      map((pokedex) =>
        pokedex.find((p) => p.name.toLowerCase() === name.toLowerCase())
      ),
      switchMap((pokemon) => {
        if (!pokemon) {
          return throwError(
            () => new Error(`Pokemon with name "${name}" not found`)
          );
        }
        return of(pokemon);
      })
    );
  }

  getPokeForms(): Observable<Variety[]> {
    if (!this.pokeForms) {
      this.pokeForms = this.http.get<Variety[]>(this.formsURL).pipe(
        shareReplay(1) // cache result
      );
    }
    return this.pokeForms;
  }

  getPokeFormsByName(formName: string): Observable<Variety | undefined> {
    return this.getPokeForms().pipe(
      map((forms) =>
        forms.find(
          (v) =>
            v.name?.toLowerCase() === formName.toLowerCase() ||
            v.name?.toLowerCase().replace(/[^a-z0-9]/g, '') ===
              formName.toLowerCase().replace(/[^a-z0-9]/g, '')
        )
      )
    );
  }
  // Sorting
  bases: Pokemon[] = [];
  forms: Variety[] = [];
  private baseDex = new Map<string, number>();
  allPokemon: (Pokemon | Variety)[] = [];

  getPokemonMasterList(): Observable<(Pokemon | Variety)[]> {
    return forkJoin({
      bases: this.getPokemonList(),
      forms: this.getPokeForms(),
    }).pipe(map(({ bases, forms }) => this.mergeAndSort(bases, forms)));
  }

  private getBaseKey(p: Pokemon | Variety): string {
    const v: any = p as any;
    const s = v?.species;
    if (typeof s === 'string' && s.trim()) return s.toLowerCase();
    if (s && typeof s === 'object' && s.name)
      return String(s.name).toLowerCase();
    return p.name.toLowerCase();
  }

  private isForm(p: Pokemon | Variety): boolean {
    return this.getBaseKey(p) !== p.name.toLowerCase();
  }

  private mergeAndSort(
    bases: Pokemon[],
    forms: Variety[]
  ): (Pokemon | Variety)[] {
    this.baseDex.clear();
    for (const b of bases) this.baseDex.set(this.getBaseKey(b), b.dex_number);

    const original = [...bases, ...forms];
    const idx = new Map<any, number>();
    original.forEach((item, i) => idx.set(item, i));

    const merged = [...original];
    merged.sort((a, b) => {
      const ak = this.getBaseKey(a);
      const bk = this.getBaseKey(b);
      const ad =
        this.baseDex.get(ak) ?? a.dex_number ?? Number.MAX_SAFE_INTEGER;
      const bd =
        this.baseDex.get(bk) ?? b.dex_number ?? Number.MAX_SAFE_INTEGER;

      if (ad !== bd) return ad - bd;

      const aForm = this.isForm(a);
      const bForm = this.isForm(b);
      if (aForm !== bForm) return aForm ? 1 : -1;

      return (idx.get(a) ?? 0) - (idx.get(b) ?? 0);
    });

    return merged;
  }

  getEvolutionChains(): Observable<EvolutionChain[]> {
    if (!this.evolutionChains$) {
      this.evolutionChains$ = this.http
        .get<EvolutionChain[]>(this.evolutionChainsURL)
        .pipe(shareReplay(1));
    }
    return this.evolutionChains$;
  }

  getEvolutionChainById(id: number): Observable<EvolutionChain | undefined> {
    return this.getEvolutionChains().pipe(
      map((chains) => chains.find((chain) => chain.id === id))
    );
  }

  getAllSprites(): Observable<PokemonSprites[]> {
    if (!this.spriteData$) {
      this.spriteData$ = this.http
        .get<PokemonSprites[]>(this.spritesURL)
        .pipe(shareReplay(1));
    }
    return this.spriteData$;
  }

  getSpritesByDexNumber(dex: number): Observable<PokemonSprites | undefined> {
    return this.getAllSprites().pipe(
      map((entries) => entries.find((s) => s.id === dex))
    );
  }

  getAllNatures(): Observable<Natures[]> {
    if (!this.natures) {
      this.natures = this.http.get<Natures[]>(this.naturesURL).pipe(
        shareReplay(1) // cache result
      );
    }
    return this.natures;
  }

  getAllBattleItems(): Observable<BattleItems[]> {
    if (!this.battleItems) {
      this.battleItems = this.http.get<BattleItems[]>(this.battleItemsURL).pipe(
        shareReplay(1) // cache result
      );
    }
    return this.battleItems;
  }

  getItemByName(name: string): Observable<BattleItems> {
    return this.getAllBattleItems().pipe(
      map((item) =>
        item.find((i) => i.name.toLowerCase() === name.toLowerCase())
      ),
      switchMap((i) => {
        if (!i) {
          return throwError(
            () => new Error(`ability with name "${name}" not found`)
          );
        }
        return of(i);
      })
    );
  }

  getAllAbilities(): Observable<AllAbilities[]> {
    if (!this.abilities) {
      this.abilities = this.http
        .get<AllAbilities[]>(this.allAbilitiesURL)
        .pipe(shareReplay(1));
    }
    return this.abilities;
  }

  getAbility(name: string): Observable<AllAbilities> {
    return this.getAllAbilities().pipe(
      map((ability) =>
        ability.find((a) => a.name.toLowerCase() === name.toLowerCase())
      ),
      switchMap((a) => {
        if (!a) {
          return throwError(
            () => new Error(`ability with name "${name}" not found`)
          );
        }
        return of(a);
      })
    );
  }

  getAllEggGrroups(): Observable<EggGroups[]> {
    if (!this.eggGroups) {
      this.eggGroups = this.http
        .get<EggGroups[]>(this.allEggGroupsURL)
        .pipe(shareReplay(1));
    }
    return this.eggGroups;
  }

  getEggGroup(name: string): Observable<EggGroups> {
    return this.getAllEggGrroups().pipe(
      map((group) =>
        group.find((egg) => egg.name.toLowerCase() === name.toLowerCase())
      ),
      switchMap((egg) => {
        if (!egg) {
          return throwError(
            () => new Error(`ability with name "${name}" not found`)
          );
        }
        return of(egg);
      })
    );
  }

  getCharacteristics(): Observable<Character[]> {
    if (!this.characteristics) {
      this.characteristics = this.http
        .get<Character[]>(this.characteristicsURL)
        .pipe(shareReplay(1));
    }
    return this.characteristics;
  }

  getAllPokeTypes(): Observable<PokeTypes[]> {
    if (!this.pokeTypes) {
      this.pokeTypes = this.http
        .get<PokeTypes[]>(this.pokeTypesURL)
        .pipe(shareReplay(1));
    }
    return this.pokeTypes;
  }

  getPokeType(name: string): Observable<PokeTypes> {
    return this.getAllPokeTypes().pipe(
      map((pTypes) =>
        pTypes.find((ptype) => ptype.name.toLowerCase() === name.toLowerCase())
      ),
      switchMap((ptype) => {
        if (!ptype) {
          return throwError(
            () => new Error(`ability with name "${name}" not found`)
          );
        }
        return of(ptype);
      })
    );
  }
}
