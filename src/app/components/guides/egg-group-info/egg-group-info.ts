import { Component } from '@angular/core';
import { FetchNationalDex } from '../../../services/fetch-national-dex';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { EggGroups } from '../../../models/Pokemon/all-egg-groups';
import { Pokemon, Variety } from '../../../models/Pokemon/poke-details';

@Component({
  selector: 'app-egg-group-info',
  standalone: false,
  templateUrl: './egg-group-info.html',
  styleUrl: './egg-group-info.css',
})
export class EggGroupInfo {
  pokemon: (Pokemon | Variety)[] = [];
  eggGroup: EggGroups | null = null;
  loading = true;
  error: string | null = null;

  eggGroupColors: { [key: string]: string } = {
    monster: '#8B4A32',
    water1: '#3BAFDA',
    bug: '#A8B820',
    flying: '#A890F0',
    field: '#E0C068',
    fairy: '#EE99AC',
    grass: '#78C850',
    'human-like': '#C183C1',
    water3: '#6890F0',
    mineral: '#B8A038',
    amorphous: '#705898',
    water2: '#98D8D8',
    ditto: '#DDAEFF',
    dragon: '#7038F8',
    undiscovered: '#C0C0C0',
  };
  typeColors: Record<string, string> = {
    grass: '#78C850',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dark: '#705848',
    dragon: '#7038F8',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
    normal: '#A8A878',
  };

  private baseDex = new Map<string, number>();

  constructor(private route: ActivatedRoute, private dex: FetchNationalDex) {}

  ngOnInit(): void {
    this.loading = true;

    this.route.data
      .pipe(
        switchMap((data) => {
          this.eggGroup = data['info'];
          const bases = data['pokemon'];
          return forkJoin({
            bases: of(bases),
            forms: this.dex.getPokeForms(),
          });
        })
      )
      .subscribe({
        next: ({ bases, forms }) => {
          this.pokemon = this.mergeAndSort(bases, forms);
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message || 'Error loading egg group data';
          this.loading = false;
        },
      });
  }

  private getBaseKey(p: Pokemon | Variety): string {
    // Works whether `species` is a string or an object with `.name`
    const v: any = p as any;
    const s = v?.species;
    if (typeof s === 'string' && s.trim()) return s.toLowerCase();
    if (s && typeof s === 'object' && s.name)
      return String(s.name).toLowerCase();
    return p.name.toLowerCase(); // base mon
  }

  private isForm(p: Pokemon | Variety): boolean {
    return this.getBaseKey(p) !== p.name.toLowerCase();
  }

  private mergeAndSort(
    bases: Pokemon[],
    forms: Variety[]
  ): (Pokemon | Variety)[] {
    // Map baseKey -> base dex number
    this.baseDex.clear();
    for (const b of bases) {
      this.baseDex.set(this.getBaseKey(b), b.dex_number);
    }

    // Keep the original order index to preserve forms’ incoming order
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

      // 1) Sort by the *base* dex number so all forms follow their base line
      if (ad !== bd) return ad - bd;

      // 2) Within same base: base first, then forms
      const aForm = this.isForm(a);
      const bForm = this.isForm(b);
      if (aForm !== bForm) return aForm ? 1 : -1;

      // 3) If both forms (or both base — rare duplicate), keep original order
      return (idx.get(a) ?? 0) - (idx.get(b) ?? 0);
    });

    return merged;
  }

  getTypeColor(type: string): string {
    return this.typeColors[type.toLowerCase()] || '#A8A878'; // fallback to normal type color
  }

  geteggGroupColor(egg: string): string {
    return this.eggGroupColors[egg.toLowerCase()];
  }

  getPokemonWithThisGroup(): (Pokemon | Variety)[] {
    if (!this.eggGroup || !this.pokemon.length) return [];

    const eggSpecies = new Set(this.eggGroup.pokemon_species.map((p) => p));

    // return Pokémon whose species or name matches the egg group
    return this.pokemon.filter((poke) =>
      eggSpecies.has(poke.species || poke.name)
    );
  }

  getPokemonRoute(poke: Pokemon | Variety): string {
    // Try to find the base Pokémon by species
    const basePokemon = this.pokemon.find(
      (p) => p.name === poke.species || p.species === poke.species
    );

    // If found, use its name; otherwise fallback to current poke.name
    const routeName = basePokemon?.name || poke.name || '';

    return routeName.toLowerCase().replace(/\s+/g, '-');
  }

  getDisplayName(name: string): string {
    const capitalize = (str: string) =>
      str.charAt(0).toUpperCase() + str.slice(1);
    if (name.endsWith('-f')) {
      return capitalize(name.slice(0, -2)) + ' ♀';
    } else if (name.endsWith('-m')) {
      return capitalize(name.slice(0, -2)) + ' ♂';
    }
    return capitalize(name);
  }

  /**
  * OR 
  *onImgError(event: Event) {
  (event.target as HTMLImageElement).style.display = 'none';
}
  */
  onImgError(event: Event, poke: Pokemon | Variety) {
    const target = event.target as HTMLImageElement;
    target.src = poke.images['official_artwork-default'];
  }
}
