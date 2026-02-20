import { Component, OnInit } from '@angular/core';
import { FetchNationalDex } from '../../../services/fetch-national-dex';
import { ActivatedRoute } from '@angular/router';
import { Move, Movedata } from '../../../services/movedata';
import { Pokemon, Variety } from '../../../models/Pokemon/poke-details';
import { PokeTypes } from '../../../models/Pokemon/type-defences';

@Component({
  selector: 'app-type-info',
  standalone: false,
  templateUrl: './type-info.html',
  styleUrl: './type-info.css',
})
export class TypeInfo implements OnInit {
  pokemon: (Pokemon | Variety)[] = [];
  moves: Move[] = [];
  PTypes: PokeTypes | null = null;
  loading = true;
  error: string | null = null;

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

  constructor(
    private service: FetchNationalDex,
    private moveService: Movedata,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const name = params.get('name');
      if (!name) {
        this.error = 'No type name provided';
        this.loading = false;
        return;
      }

      this.loading = true;

      this.service.getPokeType(name).subscribe({
        next: (type) => {
          this.PTypes = type;

          // Fetch all Pokémon including forms
          this.service.getPokemonList().subscribe((bases) => {
            this.service.getPokeForms().subscribe((forms) => {
              // Merge bases + forms and sort so forms appear after their base
              this.pokemon = this.mergeAndSort(bases, forms);
              this.loading = false;
            });
          });

          // Fetch and filter moves (unchanged)
          this.moveService.getAllMoves().subscribe((allMoves) => {
            const moveNames = this.PTypes?.moves.map((m) => m.name) || [];
            this.moves = allMoves.filter((move) =>
              moveNames.includes(move.name)
            );
          });
        },
        error: (err) => {
          this.error = err.message || 'Type not found';
          this.loading = false;
        },
      });
    });
  }

  private baseDex = new Map<string, number>();

  private getBaseKey(p: Pokemon | Variety): string {
    const v: any = p;
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
    bases: (Pokemon | Variety)[],
    forms: (Pokemon | Variety)[]
  ): (Pokemon | Variety)[] {
    this.baseDex.clear();
    for (const b of bases) {
      this.baseDex.set(this.getBaseKey(b), b.dex_number);
    }

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

      // 1) Sort by base dex number
      if (ad !== bd) return ad - bd;

      // 2) Base first, then forms
      const aForm = this.isForm(a);
      const bForm = this.isForm(b);
      if (aForm !== bForm) return aForm ? 1 : -1;

      // 3) Keep original order for multiple forms
      return (idx.get(a) ?? 0) - (idx.get(b) ?? 0);
    });

    return merged;
  }

  getPokemonWithThisType(): (Pokemon | Variety)[] {
    if (!this.PTypes || !this.pokemon.length) return [];

    const typeName = this.PTypes.name.toLowerCase();

    return this.pokemon.filter((poke) =>
      poke.types?.some((t: any) => {
        if (typeof t === 'string') return t.toLowerCase() === typeName;
        if (t?.type?.name) return t.type.name.toLowerCase() === typeName;
        return false;
      })
    );
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

  getTypeColor(type: string): string {
    return this.typeColors[type.toLowerCase()] || '#A8A878'; // fallback to normal type color
  }

  getCategoryStatusImage(category: string): string {
    if (!category) return ''; // or a default image path if you want
    return `../../../../assets/moves/categ/${category.toLowerCase()}.png`;
  }

  sanitizeName(name: string): string {
    return name
      .split('-') // Split on dash
      .map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1) // Capitalize each word
      )
      .join(' '); // Join with a space (no dash)
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
