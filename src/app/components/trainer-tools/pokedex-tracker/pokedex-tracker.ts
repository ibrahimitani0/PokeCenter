import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Pokemon } from '../../../models/Pokemon/poke-details';

@Component({
  selector: 'app-pokedex-tracker',
  standalone: false,
  templateUrl: './pokedex-tracker.html',
  styleUrl: './pokedex-tracker.css',
})
export class PokedexTracker implements OnInit {
  nationalDex: Pokemon[] = [];
  caughtSet: Set<number> = new Set();
  searchQuery: string = '';

  visibleCount = 15;
  infiniteScrollEnabled = true;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.nationalDex = data['pokedex'];
      this.loadCaughtData();
    });
  }

  get filteredPokedex(): Pokemon[] {
    const query = this.searchQuery.toLowerCase().trim();
    return this.nationalDex.filter((pokemon) => {
      return (
        !query ||
        pokemon.name.toLowerCase().includes(query) ||
        pokemon.dex_number.toString().includes(query)
      );
    });
  }

  loadMore(): void {
    this.visibleCount += 15;
    
  }

  resetVisibleCount(): void {
    this.visibleCount = 15;
  }

  toggleCaught(pokemonId: number): void {
    if (this.caughtSet.has(pokemonId)) {
      this.caughtSet.delete(pokemonId);
    } else {
      this.caughtSet.add(pokemonId);
    }
    this.saveCaughtData();
  }

  isCaught(pokemonId: number): boolean {
    return this.caughtSet.has(pokemonId);
  }

  saveCaughtData(): void {
    localStorage.setItem('caughtPokemon', JSON.stringify([...this.caughtSet]));
  }

  loadCaughtData(): void {
    const saved = localStorage.getItem('caughtPokemon');
    if (saved) {
      this.caughtSet = new Set(JSON.parse(saved));
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (!this.infiniteScrollEnabled) return;

    const threshold = 300;
    const position = window.innerHeight + window.scrollY;
    const height = document.documentElement.scrollHeight;

    if (
      position > height - threshold &&
      this.visibleCount < this.filteredPokedex.length
    ) {
      this.loadMore();
    }
  }
}
