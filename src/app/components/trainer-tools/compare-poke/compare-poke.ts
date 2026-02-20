import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { FetchNationalDex } from '../../../services/fetch-national-dex';
import { Pokemon, Variety } from '../../../models/Pokemon/poke-details';

@Component({
  selector: 'app-compare-poke',
  standalone: false,
  templateUrl: './compare-poke.html',
  styleUrl: './compare-poke.css',
})
export class ComparePoke implements OnInit, OnDestroy {
  searchQuery = '';
  allPokemon: (Pokemon | Variety)[] = [];
  filtered: (Pokemon | Variety)[] = [];
  visibleCount = 15;
  infiniteScrollEnabled = true;
  showDropdown = false;
  shinyMap = new Map<string, boolean>();
  private clickListener!: () => void;

  comparePoke: (Pokemon | Variety)[] = [];

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

  BodyColors: Record<string, string> = {
    grass: '#4E8234',
    fire: '#F15627',
    water: '#3B9AE1',
    electric: '#F9D030',
    ice: '#74CEC0',
    fighting: '#82351D',
    poison: '#6E2E8E',
    ground: '#D97732',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A7B723',
    rock: '#B69E31',
    ghost: '#70559B',
    dark: '#5A5847',
    dragon: '#7038F8',
    steel: '#B7B9D0',
    fairy: '#E69EAC',
    normal: '#A4ACAF',
  };

  constructor(
    private dex: FetchNationalDex,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.dex.getPokemonMasterList().subscribe((allPokemon) => {
      this.allPokemon = allPokemon;

      this.updateFiltered();

      this.loadCompareFromLocalStorage(); // Load saved selections
      this.cdr.detectChanges();
    });

    this.clickListener = this.renderer.listen('document', 'click', (event) => {
      if (!this.elRef.nativeElement.contains(event.target)) {
        this.showDropdown = false;
      }
    });
  }

  toggleShiny(p: Pokemon | Variety) {
    const current = this.shinyMap.get(p.name) || false;
    this.shinyMap.set(p.name, !current);
  }

  onInput(q: string) {
    this.searchQuery = q;
    this.visibleCount = 15;
    this.updateFiltered();
  }

  private updateFiltered() {
    const query = this.searchQuery.trim().toLowerCase();
    let results = !query
      ? this.allPokemon
      : this.allPokemon.filter((p) => p.name.toLowerCase().includes(query));

    this.filtered = results.slice(0, this.visibleCount);
  }

  loadMore(): void {
    this.visibleCount += 15;
    this.updateFiltered();
  }

  onImgError(event: Event, poke: Pokemon | Variety) {
    const target = event.target as HTMLImageElement;
    target.src = poke.images['official_artwork-default'];
  }


  shortenStatName(name: string): string {
    switch (name.toLowerCase()) {
      case 'hp':
        return 'HP';
      case 'attack':
        return 'Atk';
      case 'defense':
        return 'Def';
      case 'special-attack':
        return 'Sp. Atk';
      case 'special-defense':
      case 'special defense':
        return 'Sp. Def';
      case 'speed':
        return 'Spe';
      default:
        return name;
    }
  }

  getStatColorByValue(statValue: number): string {
    if (statValue >= 150) return 'stat-blue';
    if (statValue >= 120) return 'stat-dark-green';
    if (statValue >= 90) return 'stat-green';
    if (statValue >= 60) return 'stat-yellow';
    if (statValue >= 30) return 'stat-orange';
    return 'stat-red';
  }

  select(p: Pokemon | Variety) {
    if (
      !this.comparePoke.some(
        (c) => c.name.toLowerCase() === p.name.toLowerCase()
      )
    ) {
      this.comparePoke.push(p);
      this.saveCompareToLocalStorage();
    }

    this.searchQuery = '';
    this.visibleCount = 15;
    this.updateFiltered();
  }

  removeFromCompare(p: Pokemon | Variety) {
    this.comparePoke = this.comparePoke.filter(
      (c) => c.name.toLowerCase() !== p.name.toLowerCase()
    );
    this.saveCompareToLocalStorage();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (!this.infiniteScrollEnabled) return;

    const threshold = 300;
    const position = window.innerHeight + window.scrollY;
    const height = document.documentElement.scrollHeight;

    if (
      position > height - threshold &&
      this.visibleCount < this.allPokemon.length
    ) {
      this.loadMore();
    }
  }

  getTypeColor(type: string): string {
    return this.typeColors[type.toLowerCase()] || '#A8A878';
  }

  getBodyColor(type: string): string {
    const baseColor = this.getTypeColor(type);
    return `linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1)), ${baseColor}`;
  }

  private saveCompareToLocalStorage() {
    try {
      const data = JSON.stringify(this.comparePoke.map((p) => p.name));
      localStorage.setItem('comparePoke', data);
    } catch (e) {
      console.error('Failed to save compare list', e);
    }
  }

  private loadCompareFromLocalStorage() {
    try {
      const data = localStorage.getItem('comparePoke');
      if (!data) return;

      const names: string[] = JSON.parse(data);
      this.comparePoke = this.allPokemon.filter((p) => names.includes(p.name));
    } catch (e) {
      console.error('Failed to load compare list', e);
    }
  }

  ngOnDestroy() {
    if (this.clickListener) this.clickListener();
  }
}
