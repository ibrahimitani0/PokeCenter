import { Component, OnInit } from '@angular/core';
import { LearnsetEntry, Move, Movedata } from '../../../services/movedata';
import { ActivatedRoute } from '@angular/router';
import { FetchNationalDex } from '../../../services/fetch-national-dex';
import { forkJoin } from 'rxjs';
import { Pokemon, Variety } from '../../../models/Pokemon/poke-details';

@Component({
  selector: 'app-move-info',
  standalone: false,
  templateUrl: './move-info.html',
  styleUrl: './move-info.css',
})
export class MoveInfo implements OnInit {
  move: Move | null = null;
  pokemonThatLearnIt: { pokemon: string; methods: LearnsetEntry[] }[] = [];
  fullLearnerData: (Pokemon & {
    methods: LearnsetEntry[];
  })[] = [];

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
    private route: ActivatedRoute,
    private moveData: Movedata,
    private pokedexService: FetchNationalDex
  ) {}

  ngOnInit(): void {
    this.loading = true;

    this.route.data.subscribe({
      next: (data) => {
        this.move = data['move'];

        if (!this.move) {
          this.loading = false;
          return;
        }

        // Step 1: get Pokémon that learn this move
        this.moveData.getPokemonThatLearnMove(this.move.id).subscribe({
          next: (learners) => {
            this.pokemonThatLearnIt = learners;

            // Step 2: fetch all base Pokémon and forms
            forkJoin({
              bases: this.pokedexService.getPokemonList(),
              forms: this.pokedexService.getPokeForms(),
            }).subscribe({
              next: ({ bases, forms }) => {
                // Merge bases + forms
                const allPokemon: (Pokemon | Variety)[] = [...bases, ...forms];

                // Step 3: for each learner, find its full Pokémon object
                this.fullLearnerData = learners
                  .map((learner) => {
                    const poke = allPokemon.find(
                      (p) =>
                        p.name.toLowerCase() ===
                          learner.pokemon.toLowerCase() ||
                        p.species?.toLowerCase() ===
                          learner.pokemon.toLowerCase()
                    );
                    if (!poke) return null;
                    return {
                      ...poke,
                      methods: learner.methods,
                    };
                  })
                  .filter(
                    (p): p is Pokemon & { methods: LearnsetEntry[] } => !!p
                  );

                // Step 4: sort by dex number, keeping forms after base
                this.fullLearnerData.sort((a, b) => {
                  const aDex = this.getBaseDex(a);
                  const bDex = this.getBaseDex(b);

                  if (aDex !== bDex) return aDex - bDex;

                  const aIsForm =
                    !!a.species &&
                    a.species.toLowerCase() !== a.name.toLowerCase();
                  const bIsForm =
                    !!b.species &&
                    b.species.toLowerCase() !== b.name.toLowerCase();
                  if (aIsForm !== bIsForm) return aIsForm ? 1 : -1;

                  return a.name.localeCompare(b.name);
                });

                this.loading = false;
              },
              error: (err) => {
                this.error = err.message || 'Failed to load Pokémon';
                this.loading = false;
              },
            });
          },
          error: (err) => {
            this.error = err.message || 'Failed to load move learners';
            this.loading = false;
          },
        });
      },
      error: (err) => {
        this.error = err.message || 'Failed to load move';
        this.loading = false;
      },
    });
  }

  getPokemonRoute(poke: Pokemon | Variety): string {
    const targetSpecies = (poke.species || poke.name).toLowerCase();

    // Search in the full learner data, not a non-existent `this.pokemon`
    const basePokemon = this.fullLearnerData.find(
      (p) => (p.species || p.name).toLowerCase() === targetSpecies
    );

    const routeName = basePokemon?.name || poke.name || '';

    return routeName.toLowerCase().replace(/\s+/g, '-');
  }

  private getBaseDex(p: Pokemon | Variety): number {
    const baseName = p.species?.toLowerCase() || p.name.toLowerCase();
    const base = this.fullLearnerData.find(
      (poke) => poke.name.toLowerCase() === baseName
    );
    return base?.dex_number ?? p.dex_number ?? Number.MAX_SAFE_INTEGER;
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

  getTypeColor(type: string): string {
    return this.typeColors[type.toLowerCase()] || '#A8A878'; // fallback to normal type color
  }
  getTypeLabelStyle(type: string) {
    return { color: this.getTypeColor(type) };
  }

  getCategoryStatusImage(category: string): string {
    if (!category) return ''; // or a default image path if you want
    return `../../../../assets/moves/categ/${category.toLowerCase()}.png`;
  }

  getGenerations(): string[] {
    if (!this.move?.generation_introduced) return [];

    const genMap: Record<string, string> = {
      i: 'Generation 1',
      ii: 'Generation 2',
      iii: 'Generation 3',
      iv: 'Generation 4',
      v: 'Generation 5',
      vi: 'Generation 6',
      vii: 'Generation 7',
      viii: 'Generation 8',
      ix: 'Generation 9',
    };

    const rawGen = this.move.generation_introduced
      .replace('generation-', '')
      .toLowerCase();
    const genLabel = genMap[rawGen] || `Generation ${rawGen.toUpperCase()}`;

    return [genLabel];
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
}
