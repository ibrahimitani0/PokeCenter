import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  Renderer2,
  HostListener,
} from '@angular/core';
import { FetchNationalDex } from '../../../../services/fetch-national-dex';
import { LocalStorage } from '../../../../services/local-storage';
import { PokemonTeam } from '../../../../models/pokemon-team';
import { forkJoin } from 'rxjs';
import { SPECIAL_FORM_ITEMS } from '../../../../models/form-changing-items';
import { Pokemon, Variety } from '../../../../models/Pokemon/poke-details';

@Component({
  selector: 'app-pokemon-search',
  standalone: false,
  templateUrl: './pokemon-search.html',
  styleUrl: './pokemon-search.css',
})
export class PokemonSearch implements OnInit, OnDestroy {
  searchQuery = '';
  allPokemon: (Pokemon | Variety)[] = [];
  filtered: (Pokemon | Variety)[] = [];
  visibleCount = 15; // number of results initially visible
  infiniteScrollEnabled = true;
  showDropdown = false;
  private clickListener!: () => void;

  // Sorting
  private bases: Pokemon[] = [];
  private forms: Variety[] = [];
  private baseDex = new Map<string, number>();

  constructor(
    private dex: FetchNationalDex,
    private teamService: LocalStorage,
    private elRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    forkJoin({
      bases: this.dex.getPokemonList(),
      forms: this.dex.getPokeForms(),
    }).subscribe(({ bases, forms }) => {
      this.bases = bases;
      this.forms = forms;
      this.allPokemon = this.mergeAndSort(bases, forms);
      this.updateFiltered();
    });

    this.clickListener = this.renderer.listen('document', 'click', (event) => {
      if (!this.elRef.nativeElement.contains(event.target)) {
        this.showDropdown = false;
      }
    });
  }

  onInput(q: string) {
    this.searchQuery = q;
    this.visibleCount = 15; // reset visible count on new search
    this.updateFiltered();
  }

  private updateFiltered() {
    const query = this.searchQuery.trim().toLowerCase();
    let results = !query
      ? this.allPokemon
      : this.allPokemon.filter((p) => p.name.toLowerCase().includes(query));

    // Limit the results to the visibleCount
    this.filtered = results.slice(0, this.visibleCount);
  }

  loadMore(): void {
    this.visibleCount += 15; // load 15 more each time
    this.updateFiltered();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (!this.infiniteScrollEnabled) return;

    const threshold = 300; // px from bottom
    const position = window.innerHeight + window.scrollY;
    const height = document.documentElement.scrollHeight;

    if (
      position > height - threshold &&
      this.visibleCount < this.allPokemon.length
    ) {
      this.loadMore();
    }
  }

  // ---------------------------
  // Keep all other methods as before
  // ---------------------------
  onImgError(event: Event, poke: Pokemon | Variety) {
    const target = event.target as HTMLImageElement;
    target.src = poke.images['official_artwork-default'];
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

  select(p: Pokemon | Variety) {
    // Determine held item for Mega, Primal, or Ultra forms
    const heldItem = SPECIAL_FORM_ITEMS[p.name] ?? '';

    const mon: PokemonTeam = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      dex_number: p.dex_number,
      name: p.name,
      nickname: p.name,
      level: 100,
      gender: '—',
      isShiny: false,
      ability: p.abilities.length ? p.abilities[0].name : '',
      nature: '',
      heldItem: heldItem,
      ballType: 'Poké Ball',
      image: p.images['sprite-default'],
      types: p.types,
      baseStats: p.stats,
      evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      moves: ['', '', '', ''],
    };
    this.teamService.addPokemonToActive(mon);
    this.searchQuery = '';
    this.visibleCount = 15;
    this.updateFiltered();
    this.showDropdown = false;
  }

  ngOnDestroy() {
    if (this.clickListener) this.clickListener();
  }
}
