import {
  ChangeDetectorRef,
  Component,
  OnInit,
  HostListener,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Pokemon, Variety } from '../../../models/Pokemon/poke-details';

@Component({
  selector: 'app-evs-info',
  standalone: false,
  templateUrl: './evs-info.html',
  styleUrl: './evs-info.css',
})
export class EvsInfo implements OnInit {
  pokemon: (Pokemon | Variety)[] = [];
  stat: string | null = null;

  filteredPokemon: (Pokemon | Variety)[] = [];

  // Search + infinite scroll
  searchQuery = '';
  visibleCount = 15;
  infiniteScrollEnabled = true;

  loading: boolean = true;

  evCounts = {
    hp: 0,
    attack: 0,
    defense: 0,
    spAttack: 0,
    spDefense: 0,
    speed: 0,
  };

  constructor(private route: ActivatedRoute, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loading = true;
    this.route.paramMap.subscribe((params) => {
      this.stat = params.get('stat');
      this.route.data.subscribe({
        next: (data) => {
          this.pokemon = data['pokemon'] || [];
          this.countEVsFromStats(this.pokemon);

          // Initial filter + search
          this.updateFiltered();

          this.loading = false;
          this.cd.detectChanges();
        },
      });
    });
  }

  /** Filter by stat + search + slice for visibleCount */
  private updateFiltered() {
    // Step 1: Filter by stat
    let statFiltered: (Pokemon | Variety)[] = [];
    switch (this.stat) {
      case 'all':
        statFiltered = this.pokemon;
        break;
      case 'hp':
        statFiltered = this.pokemon.filter((p) =>
          p.stats.some((s: any) => s.name === 'hp' && s.effort > 0)
        );
        break;
      case 'attack':
        statFiltered = this.pokemon.filter((p) =>
          p.stats.some((s: any) => s.name === 'attack' && s.effort > 0)
        );
        break;
      case 'defense':
        statFiltered = this.pokemon.filter((p) =>
          p.stats.some((s: any) => s.name === 'defense' && s.effort > 0)
        );
        break;
      case 'spAttack':
        statFiltered = this.pokemon.filter((p) =>
          p.stats.some((s: any) => s.name === 'special-attack' && s.effort > 0)
        );
        break;
      case 'spDefense':
        statFiltered = this.pokemon.filter((p) =>
          p.stats.some((s: any) => s.name === 'special-defense' && s.effort > 0)
        );
        break;
      case 'speed':
        statFiltered = this.pokemon.filter((p) =>
          p.stats.some((s: any) => s.name === 'speed' && s.effort > 0)
        );
        break;
      default:
        statFiltered = [];
        break;
    }

    // Step 2: Filter by search
    const query = this.searchQuery.trim().toLowerCase();
    const searched = !query
      ? statFiltered
      : statFiltered.filter((p) => p.name.toLowerCase().includes(query));

    // Step 3: Apply visibleCount for infinite scroll
    this.filteredPokemon = searched.slice(0, this.visibleCount);
  }

  onInput(q: string) {
    this.searchQuery = q;
    this.visibleCount = 15; // Reset when search changes
    this.updateFiltered();
  }

  loadMore(): void {
    this.visibleCount += 15;
    this.updateFiltered();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (!this.infiniteScrollEnabled) return;

    const threshold = 300;
    const position = window.innerHeight + window.scrollY;
    const height = document.documentElement.scrollHeight;

    if (
      position > height - threshold &&
      this.visibleCount < this.pokemon.length
    ) {
      this.loadMore();
    }
  }

  countEVsFromStats(pokemonList: any[]) {
    for (const p of pokemonList) {
      for (const stat of p.stats) {
        if (stat.effort > 0) {
          switch (stat.name) {
            case 'hp':
              this.evCounts.hp++;
              break;
            case 'attack':
              this.evCounts.attack++;
              break;
            case 'defense':
              this.evCounts.defense++;
              break;
            case 'special-attack':
              this.evCounts.spAttack++;
              break;
            case 'special-defense':
              this.evCounts.spDefense++;
              break;
            case 'speed':
              this.evCounts.speed++;
              break;
          }
        }
      }
    }
  }

  onImgError(event: Event, poke: Pokemon | Variety) {
    const target = event.target as HTMLImageElement;
    target.src = poke.images['official_artwork-default'];
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
}
