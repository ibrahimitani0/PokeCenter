import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  NgZone,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { LocalStorage } from '../../../../services/local-storage';
import { PokemonTeam, StatMap } from '../../../../models/pokemon-team';
import { FetchNationalDex } from '../../../../services/fetch-national-dex';
import { Movedata, LearnsetEntry, Move } from '../../../../services/movedata';
import { Subscription } from 'rxjs';
import { BattleItems } from '../../../../models/battle-items';
import { Ability, Pokemon } from '../../../../models/Pokemon/poke-details';
import { Natures } from '../../../../models/Pokemon/all-natures';
import { AllAbilities } from '../../../../models/Pokemon/all-abilities';
@Component({
  selector: 'app-pokemon-editor',
  standalone: false,
  templateUrl: './pokemon-editor.html',
  styleUrl: './pokemon-editor.css',
})
export class PokemonEditor implements OnInit, OnDestroy {
  @ViewChild('radarChart', { static: false })
  radarChartRef!: ElementRef<HTMLCanvasElement>;

  chart?: Chart<'radar', number[], string>;
  statsLabels: (keyof StatMap)[] = ['hp', 'atk', 'def', 'spe', 'spd', 'spa'];

  selected: PokemonTeam | null = null;
  listener!: EventListener;
  teamsSub!: Subscription;
  allPokemonList: Pokemon[] = [];

  evStats: (keyof StatMap)[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
  ivStats: (keyof StatMap)[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

  // Searchable dropdown state
  abilitySearch = '';
  abilityDropdownOpen = false;
  natureSearch = '';
  natureDropdownOpen = false;
  itemSearch = '';
  itemDropdownOpen = false;
  ballSearch = '';
  ballDropdownOpen = false;

  // Data sources for dropdowns
  abilitiesList: string[] = [];
  naturesList: Natures[] = [];
  itemsList: BattleItems[] = [];
  ballsList: string[] = [
    'Poké Ball',
    'Great Ball',
    'Ultra Ball',
    'Master Ball',
    'Premier Ball',
    'Dive Ball',
    'Timer Ball',
    'Luxury Ball',
    'Heal Ball',
    'Net Ball',
    'Nest Ball',
    'Repeat Ball',
    'Fast Ball',
    'Friend Ball',
    'Level Ball',
    'Lure Ball',
    'Moon Ball',
    'Heavy Ball',
    'Love Ball',
    'Dream Ball',
    'Dusk Ball',
    'Quick Ball',
    'Safari Ball',
    'Sport Ball',
    'Beast Ball',
  ];
  speciesAbilities: Ability[] = [];
  allowedGenders: { label: string; value: string }[] = [];

  selectedLearnset: (LearnsetEntry & { moveDetails: Move })[] = [];
  moveSearches: string[] = [];
  moveDropdownOpen: boolean[] = [];

  showEVs: boolean = false;
  chartMode: 'base' | 'evs' | 'ivs' | 'all' = 'all';

  constructor(
    private teamService: LocalStorage,
    private dex: FetchNationalDex,
    private movedata: Movedata,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.dex.getPokemonList().subscribe((baseList) => {
      this.allPokemonList = baseList;

      this.dex.getPokeForms().subscribe((forms) => {
        const mappedForms: Pokemon[] = forms.map((v) => {
          const base = this.allPokemonList.find((p) => {
            for (let i = 0; i < p.varieties.length; i++) {
              if (p.varieties[i].dex_number === v.dex_number) {
                return true;
              }
            }
            return false;
          });
          return {
            name: v.name,
            dex_number: v.dex_number,
            types: v.types ?? [],
            species: base?.species ?? v.name, // fallback here
            abilities: v.abilities ?? [],
            height: v.height ?? 0,
            weight: v.weight ?? 0,
            base_exp: v.base_exp ?? 0,
            stats: v.stats ?? [],
            images: v.images ?? { 'sprite-default': '', 'sprite-shiny': '' },
            cries: v.cries ?? { normal: '', shiny: '' },
            location_area_encounters: base?.location_area_encounters ?? [],
            generation_introduced: base?.generation_introduced ?? 'unknown',
            genus: base?.genus ?? '',
            varieties: base?.varieties ?? [],
            flavor_texts_en: base?.flavor_texts_en ?? [],
            habitat: base?.habitat ?? '',
            color: base?.color ?? '',
            shape: base?.shape ?? '',
            growth_rate: base?.growth_rate ?? '',
            egg_groups: base?.egg_groups ?? [],
            evolves_from: base?.evolves_from ?? null,
            evolution_chain: base?.evolution_chain ?? 0,
            gender_rate: base?.gender_rate ?? -1,
            capture_rate: base?.capture_rate ?? 0,
            base_happiness: base?.base_happiness ?? 0,
            is_baby: base?.is_baby ?? false,
            is_legendary: base?.is_legendary ?? false,
            is_mythical: base?.is_mythical ?? false,
            hatch_counter: base?.hatch_counter ?? 0,
            has_gender_differences: base?.has_gender_differences ?? false,
            pokedex_numbers: base?.pokedex_numbers ?? [],
          };
        });

        this.allPokemonList = [...this.allPokemonList, ...mappedForms];
      });
    });

    this.dex.getAllNatures().subscribe((n) => {
      this.naturesList = n;
    });

    this.dex.getAllBattleItems().subscribe((item) => {
      this.itemsList = item;
    });

    this.listener = (ev: Event) => {
      const detail = (ev as CustomEvent).detail as PokemonTeam;
      this.selected = JSON.parse(JSON.stringify(detail)); // clone

      if (this.selected) {
        const selected = this.selected;

        if (!selected.moves) {
          selected.moves = [];
        }

        this.moveSearches = [...selected.moves];
        this.moveDropdownOpen = selected.moves.map(() => false);
      }
      // Delay chart creation to next microtask so view is ready
      setTimeout(() => {
        if (this.selected) {
          this.destroyChart(); // remove chart
          this.createRadarChart();
        }
      });
      this.loadSpeciesAbilities();
      this.loadMovesForSelected();
      this.updateSearchInputs();
      this.resetDropdownStates();
    };

    window.addEventListener('select-pokemon', this.listener as EventListener);
    window.addEventListener('click', this.onGlobalClick.bind(this));
  }

  getTypeColor(type: string): string {
    const typeColors: Record<string, string> = {
      Fire: '#F08030',
      Water: '#6890F0',
      Grass: '#78C850',
      Electric: '#F8D030',
      Ice: '#98D8D8',
      Fighting: '#C03028',
      Poison: '#A040A0',
      Ground: '#E0C068',
      Flying: '#A890F0',
      Psychic: '#F85888',
      Bug: '#A8B820',
      Rock: '#B8A038',
      Ghost: '#705898',
      Dark: '#705848',
      Dragon: '#7038F8',
      Steel: '#B8B8D0',
      Fairy: '#EE99AC',
      Normal: '#A8A878',
    };
    return typeColors[type] || '#000'; // fallback black
  }

  getTypeColorDarker(type: string): string {
    const typeColors: Record<string, string> = {
      Fire: '#C06020',
      Water: '#5070C0',
      Grass: '#5A9E3C',
      Electric: '#C0A820',
      Ice: '#70B8B8',
      Fighting: '#902020',
      Poison: '#702870',
      Ground: '#B09040',
      Flying: '#8070C0',
      Psychic: '#C04068',
      Bug: '#7A9018',
      Rock: '#8A7828',
      Ghost: '#504070',
      Dark: '#504038',
      Dragon: '#5028C0',
      Steel: '#8888A8',
      Fairy: '#CC7A90',
      Normal: '#787850',
    };
    return typeColors[type] || '#000';
  }

  ngAfterViewInit() {
    if (this.selected) this.createRadarChart();
  }

  getBackgroundGradient(type: string): string {
    const gradients: Record<string, string> = {
      normal: 'linear-gradient(135deg, #d3d3b8, #f4f4e4)',
      fire: 'linear-gradient(135deg, #ff9a7c, #ffd2b1)',
      water: 'linear-gradient(135deg, #7ec8e3, #cfefff)',
      electric: 'linear-gradient(135deg, #ffe873, #fffacd)',
      grass: 'linear-gradient(135deg, #a8e6a3, #e0ffe0)',
      ice: 'linear-gradient(135deg, #b0e0e6, #e8f9ff)',
      fighting: 'linear-gradient(135deg, #e67e7e, #ffd6d6)',
      poison: 'linear-gradient(135deg, #d09bdf, #f3e6f9)',
      ground: 'linear-gradient(135deg, #e4c97c, #faf0d7)',
      flying: 'linear-gradient(135deg, #c3bfff, #e9e5ff)',
      psychic: 'linear-gradient(135deg, #fcb6d0, #ffe0eb)',
      bug: 'linear-gradient(135deg, #bde06f, #f0f8d8)',
      rock: 'linear-gradient(135deg, #c6b98b, #f0e7d3)',
      ghost: 'linear-gradient(135deg, #b49bd7, #e8dcfa)',
      dragon: 'linear-gradient(135deg, #a787ff, #e6d6ff)',
      dark: 'linear-gradient(135deg, #a89a92, #e2ddd9)',
      steel: 'linear-gradient(135deg, #d3d3dc, #f0f0f5)',
      fairy: 'linear-gradient(135deg, #f6bde2, #ffe6f4)',
    };
    return gradients[type?.toLowerCase()] || '#ffffff';
  }

  setAllowedGenders(genderRate: number) {
    if (genderRate === -1) {
      // Genderless
      this.allowedGenders = [{ label: 'Genderless', value: 'Genderless' }];
      this.selected!.gender = 'Genderless';
    } else if (genderRate === 0) {
      // Male only
      this.allowedGenders = [{ label: '♂', value: '♂' }];
      this.selected!.gender = '♂';
    } else if (genderRate === 8) {
      // Female only
      this.allowedGenders = [{ label: '♀', value: '♀' }];
      this.selected!.gender = '♀';
    } else {
      // Both male and female
      this.allowedGenders = [
        { label: '♂', value: '♂' },
        { label: '♀', value: '♀' },
      ];
      if (this.selected!.gender !== '♂' && this.selected!.gender !== '♀') {
        this.selected!.gender = '♂'; // default to male if current value invalid
      }
    }
  }

  abilityDetailsMap: Record<string, AllAbilities> = {};

  loadSpeciesAbilities() {
    if (!this.selected) {
      this.speciesAbilities = [];
      this.allowedGenders = [];
      this.abilityDetailsMap = {};
      return;
    }

    const pokemonData = this.allPokemonList.find(
      (p) =>
        p.name.toLowerCase() === this.selected!.name.toLowerCase() ||
        p.dex_number === this.selected!.dex_number
    );

    if (pokemonData) {
      this.speciesAbilities = pokemonData.abilities;

      if (
        !this.speciesAbilities.some((a) => a.name === this.selected!.ability)
      ) {
        this.selected!.ability = this.speciesAbilities[0].name;
      }

      this.setAllowedGenders(pokemonData.gender_rate ?? -1);

      // Load all abilities’ full details
      this.speciesAbilities.forEach((a) => {
        this.dex.getAbility(a.name).subscribe({
          next: (details) => {
            this.abilityDetailsMap[a.name] = details;
            this.cd.detectChanges(); // update view
          },
          error: () => {},
        });
      });
    } else {
      this.speciesAbilities = [];
      this.allowedGenders = [];
      this.selected!.ability = '';
      this.abilityDetailsMap = {};
    }
  }

  filteredAbilities(): Ability[] {
    const q = this.abilitySearch.toLowerCase();
    return this.speciesAbilities.filter((a) =>
      a.name.toLowerCase().includes(q)
    );
  }

  // When an ability is selected from dropdown
  selectAbility(name: string, inputElement?: HTMLInputElement) {
    if (!this.selected) return;

    this.selected.ability = name;
    this.abilityDropdownOpen = false;
    this.abilitySearch = name;
    this.save();

    if (inputElement) setTimeout(() => inputElement.blur(), 0);
  }

  loadMovesForSelected() {
    if (!this.selected) {
      this.selectedLearnset = [];
      return;
    }
    this.movedata
      .getDetailedLearnset(this.selected.name)
      .subscribe((detailedMoves) => {
        // Sort moves alphabetically by move_name
        detailedMoves.sort((a, b) => a.move_name.localeCompare(b.move_name));

        const uniqueMovesMap = new Map<string, (typeof detailedMoves)[0]>();

        for (const move of detailedMoves) {
          if (!uniqueMovesMap.has(move.move_name)) {
            uniqueMovesMap.set(move.move_name, move);
          }
        }

        this.selectedLearnset = Array.from(uniqueMovesMap.values());
      });
  }

  addMove() {
    if (!this.selected) return;
    if (!this.selected.moves) this.selected.moves = [];

    const defaultMove =
      this.selectedLearnset.length > 0
        ? this.selectedLearnset[0].move_name
        : '';
    this.selected.moves.push(defaultMove);

    // Sync the moveSearches and dropdown states too
    this.moveSearches.push(defaultMove);
    this.moveDropdownOpen.push(false);
    this.moveClearedHighlight.push(false); // <-- initialize highlight
  }

  clearMove(index: number) {
    if (!this.selected) return;
    this.selected.moves[index] = '';
    this.moveSearches[index] = '';
    this.save();
  }

  filteredMoves(index: number) {
    const q = (this.moveSearches[index] || '').toLowerCase();
    return this.selectedLearnset.filter((m) =>
      m.move_name.toLowerCase().includes(q)
    );
  }

  onMoveChange(index: number) {
    if (!this.selected) return;

    // Sync selected.moves with moveSearches values
    this.selected.moves[index] = this.moveSearches[index] || '';

    this.save();
  }

  moveClearedHighlight: boolean[] = [];

  selectMove(index: number, moveName: string, inputElement?: HTMLInputElement) {
    if (!this.selected) return;
    const moves = this.selected.moves;

    moves.forEach((m, i) => {
      if (i !== index && m === moveName) {
        moves[i] = '';
        this.moveSearches[i] = '';

        // Highlight this input
        this.moveClearedHighlight[i] = true;

        // Remove highlight after a short delay
        setTimeout(() => {
          this.moveClearedHighlight[i] = false;
        }, 1000); // 1 second, adjust as needed
      }
    });

    moves[index] = moveName;
    this.moveSearches[index] = moveName;
    this.moveDropdownOpen[index] = false;

    this.save();
    if (inputElement) setTimeout(() => inputElement.blur(), 0);
  }

  trackByIndex(index: number) {
    return index;
  }

  getCategoryStatusImage(category: string): string {
    if (!category) return ''; // or a default image path if you want
    return `../../../../assets/moves/categ/${category.toLowerCase()}.png`;
  }

  updateSearchInputs() {
    if (!this.selected) return;
    this.abilitySearch = this.selected.ability || '';
    this.natureSearch = this.selected.nature || '';
    this.itemSearch = this.selected.heldItem || '';
    this.ballSearch = this.selected.ballType || '';
  }

  resetDropdownStates() {
    this.abilityDropdownOpen = false;
    this.natureDropdownOpen = false;
    this.itemDropdownOpen = false;
    this.ballDropdownOpen = false;
  }

  filteredNatures() {
    const q = this.natureSearch.toLowerCase();
    return this.naturesList.filter((n) =>
      n.natureName.toLowerCase().includes(q)
    );
  }

  filteredItems() {
    const q = this.itemSearch.toLowerCase();
    return this.itemsList.filter((i) => i.name.toLowerCase().includes(q));
  }

  get selectedItemSprite(): string | null {
    const found = this.itemsList.find((i) => i.name === this.itemSearch);
    return found?.sprites?.default || null;
  }

  getEnglishEffectText(item: BattleItems): string {
    return (
      item.effect_entries.find((e) => e.language === 'en')?.short_effect || ''
    );
  }

  filteredBalls() {
    const q = this.ballSearch.toLowerCase();
    return this.ballsList.filter((b) => b.toLowerCase().includes(q));
  }

  selectNature(name: string, inputElement?: HTMLInputElement) {
    if (!this.selected) return;
    this.selected.nature = name;
    this.natureDropdownOpen = false;
    this.natureSearch = name;
    this.save();

    if (inputElement) {
      // Remove focus immediately or with a tiny delay
      setTimeout(() => inputElement.blur(), 0);
    }
  }

  selectItem(name: string, inputElement?: HTMLInputElement) {
    if (!this.selected) return;
    this.selected.heldItem = name === 'None' ? '' : name;
    this.itemDropdownOpen = false;
    this.itemSearch = name;
    this.save();

    if (inputElement) {
      // Remove focus immediately or with a tiny delay
      setTimeout(() => inputElement.blur(), 0);
    }
  }

  selectBall(name: string, inputElement?: HTMLInputElement) {
    if (!this.selected) return;
    this.selected.ballType = name;
    this.ballDropdownOpen = false;
    this.ballSearch = name;
    this.save();

    if (inputElement) {
      // Remove focus immediately or with a tiny delay
      setTimeout(() => inputElement.blur(), 0);
    }
  }

  onShinyChange(isShiny: boolean) {
    if (!this.selected) return;

    const pokemonData = this.allPokemonList.find(
      (p) =>
        p.name.toLowerCase() === this.selected!.name.toLowerCase() ||
        p.dex_number === this.selected!.dex_number
    );

    if (!pokemonData) return;

    this.selected.image = isShiny
      ? pokemonData.images['sprite-shiny'] ||
        pokemonData.images['sprite-default']
      : pokemonData.images['sprite-default'];
  }

  shortenName(name: string): string {
    switch (name.toLowerCase()) {
      case 'hp':
        return 'HP';
      case 'attack':
        return 'Atk';
      case 'defense':
        return 'Def';
      case 'special-attack':
        return 'Sp. Atk';
      case 'special defense':
      case 'special-defense':
        return 'Sp. Def';
      case 'speed':
        return 'Spe';
      default:
        return name;
    }
  }

  shortenStatName(stat: string): string {
    switch (stat.toLowerCase()) {
      case 'hp':
        return 'HP';
      case 'atk':
        return 'Attack';
      case 'def':
        return 'Defense';
      case 'spa':
        return 'Sp. Atk';
      case 'spd':
        return 'Sp. Def';
      case 'spe':
        return 'Speed';
      default:
        return stat;
    }
  }

  getNatureModifiers(natureName: string) {
    const nature = this.naturesList.find((n) => n.natureName === natureName);

    const modifiers: Record<string, number> = {
      atk: 1,
      def: 1,
      spa: 1,
      spd: 1,
      spe: 1,
    };

    if (!nature) return modifiers;

    const statMap: Record<string, keyof typeof modifiers> = {
      attack: 'atk',
      defense: 'def',
      'special-attack': 'spa',
      'special-defense': 'spd',
      speed: 'spe',
    };

    const raiseStat = statMap[nature.raises] || null;
    const lowerStat = statMap[nature.lowers] || null;

    if (raiseStat && raiseStat !== lowerStat) modifiers[raiseStat] = 1.1;
    if (lowerStat && raiseStat !== lowerStat) modifiers[lowerStat] = 0.9;

    return modifiers;
  }

  getNatureSymbol(stat: keyof StatMap): string {
    if (!this.selected) return '';
    const mod = this.getNatureModifiers(this.selected.nature || '')[stat] || 1;
    this.updateRadarChart();
    return mod > 1 ? '+' : mod < 1 ? '−' : '';
  }

  totalEVsRemaining() {
    if (!this.selected) return 508; // all EVs available
    const used = this.evStats.reduce(
      (sum, stat) => sum + this.selected!.evs[stat],
      0
    );
    return 508 - used;
  }

  getEVUsage() {
    if (!this.selected) return { used: 0, remaining: 508 };
    const used = this.evStats.reduce(
      (sum, stat) => sum + this.selected!.evs[stat],
      0
    );
    return { used, remaining: 508 - used };
  }

  calculateStat(
    base: number,
    iv: number,
    ev: number,
    level: number,
    natureModifier: number,
    isHP: boolean = false
  ): number {
    if (isHP) {
      if (base === 1) return 1; // Shedinja
      return (
        Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) +
        level +
        10
      );
    } else {
      const stat =
        Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
      return Math.floor(stat * natureModifier);
    }
  }

  getCalculatedStat(stat: keyof StatMap): number {
    if (!this.selected) return 0;

    const keyToBaseStatName: Record<keyof StatMap, string> = {
      hp: 'hp',
      atk: 'attack',
      def: 'defense',
      spa: 'special-attack',
      spd: 'special-defense',
      spe: 'speed',
    };

    const base =
      this.selected.baseStats.find((s) => s.name === keyToBaseStatName[stat])
        ?.base_stat || 0;
    const iv = this.selected.ivs[stat] ?? 31;
    const ev = this.selected.evs[stat] ?? 0;
    const level = this.selected.level ?? 100;
    const natureMods = this.getNatureModifiers(this.selected.nature || '');

    return this.calculateStat(
      base,
      iv,
      ev,
      level,
      natureMods[stat] || 1,
      stat === 'hp'
    );
  }

  /** Absolute global max values (Lv100, 31 IV, 252 EV, positive nature where relevant) */
  private getGlobalMax(statKey: keyof StatMap): number {
    return statKey === 'hp' ? 714 : 514;
  }

  /** Fill width: scale to absolute max */
  getStatFillWidth(statKey: keyof StatMap): number {
    if (!this.selected) return 0;
    const value = this.getCalculatedStat(statKey);
    const max = this.getGlobalMax(statKey);
    let percent = (value / max) * 100;
    if (percent > 150) percent = 150;
    return percent;
  }

  /** Color: matches Showdown's general "stat tiers" */
  getStatColorByValue(statKey: keyof StatMap): string {
    if (!this.selected) return 'stat-red';
    const value = this.getCalculatedStat(statKey);
    const ratio = (value / this.getGlobalMax(statKey)) * 100;

    if (ratio >= 95) return 'stat-aqua';
    if (ratio >= 85) return 'stat-blue';
    if (ratio >= 75) return 'stat-dark-green';
    if (ratio >= 60) return 'stat-green';
    if (ratio >= 50) return 'stat-lime-green';
    if (ratio >= 35) return 'stat-yellow-green';
    if (ratio >= 20) return 'stat-yellow';
    if (ratio >= 15) return 'stat-orange';
    if (ratio >= 10) return 'stat-orange-red';
    return 'stat-red';
  }

  onLevelChange() {
    if (!this.selected) return;

    // Clamp level between 1-100
    this.selected.level = Math.max(1, Math.min(100, this.selected.level));

    this.save(); // persist changes if needed
    this.updateRadarChart(); // update all three layers immediately
  }

  onEVChange(stat: keyof StatMap) {
    if (!this.selected) return;
    const current = this.selected.evs[stat];

    // Clamp value to remaining EVs
    const remaining = this.totalEVsRemaining() + current; // add current because it's already counted
    if (current > remaining) this.selected.evs[stat] = remaining;

    this.save();

    this.updateRadarChart(); // <-- update chart live
  }

  onIVChange(stat: keyof StatMap, newValue: number) {
    if (!this.selected) return;

    // Clamp IV between 0–31
    this.selected.ivs[stat] = Math.max(0, Math.min(31, newValue));

    this.save(); // optional: save to storage if needed

    this.updateRadarChart(); // update blue + yellow layers live
  }

  /*
   ******************************
   *            GRAPH           *
   * ****************************
   */
  get currentNatureModifiers() {
    return this.getNatureModifiers(this.selected?.nature || '');
  }

  private getEVContributionValues(): number[] {
    if (!this.selected) return this.statsLabels.map(() => 0);

    const minRing = 1 / 6; // first ring = 1/6 of max (6 rings total)
    const maxEV = 252;

    return this.statsLabels.map((stat) => {
      const ev = this.selected?.evs[stat] ?? 0;
      const proportion = ev / maxEV;

      // Scale proportion to start at first ring
      return minRing * maxEV + proportion * (maxEV - minRing * maxEV);
    });
  }

  private getPokemonMaxStat(): number {
    if (!this.selected) return 714;

    const level = this.selected.level ?? 100;
    const natureMods = this.getNatureModifiers(this.selected.nature || '');

    const maxStats = this.statsLabels.map((stat) => {
      const base =
        this.selected?.baseStats.find((s) => s.name === stat)?.base_stat ?? 0;
      return this.calculateStat(
        base,
        31, // max IV
        252, // max EV
        level,
        natureMods[stat] || 1,
        stat === 'hp'
      );
    });

    return Math.max(...maxStats);
  }

  private getIVValues(): number[] {
    if (!this.selected) {
      return this.statsLabels.map(() => 0);
    }
    return this.statsLabels.map((stat) => this.selected?.ivs[stat] ?? 0);
  }

  setChartMode(mode: 'base' | 'evs' | 'ivs' | 'all') {
    this.chartMode = mode;
    this.updateRadarChart();
  }

  private getModeData() {
    if (!this.selected) return { datasets: [], max: 100 };

    const baseColor = {
      bg: 'rgba(30, 136, 229, 0.25)',
      border: 'rgba(30, 136, 229, 1)',
      point: 'rgba(30, 136, 229, 1)',
    };
    const evColor = {
      bg: 'rgba(255, 215, 0, 0.25)',
      border: 'rgba(218, 165, 32, 1)',
      point: 'rgba(255, 215, 0, 1)',
    };
    const ivColor = {
      bg: 'rgba(156, 39, 176, 0.25)',
      border: 'rgba(156, 39, 176, 1)',
      point: 'rgba(156, 39, 176, 1)',
    };

    const maxBase = this.getPokemonMaxStat();
    const maxEV = 252;
    const maxIV = 31;

    let chartMax: number;
    let datasets: any[] = [];

    if (this.chartMode === 'all') {
      chartMax = Math.max(maxBase, maxEV, maxIV);

      datasets.push({
        label: 'IVs',
        data: this.getIVValues().map((iv) => (iv / maxIV) * chartMax),
        backgroundColor: ivColor.bg,
        borderColor: ivColor.border,
        pointBackgroundColor: ivColor.point,
        fill: true,
      });

      datasets.push({
        label: 'EVs',
        data: this.getEVContributionValues().map(
          (ev) => (ev / maxEV) * chartMax
        ),
        backgroundColor: evColor.bg,
        borderColor: evColor.border,
        pointBackgroundColor: evColor.point,
        fill: true,
      });

      // CAP base stats to chartMax
      datasets.push({
        label: 'Base Stats',
        data: this.statsLabels.map((stat) =>
          Math.min(this.getCalculatedStat(stat), chartMax)
        ),
        backgroundColor: baseColor.bg,
        borderColor: baseColor.border,
        pointBackgroundColor: baseColor.point,
        fill: true,
      });

      return { datasets, max: chartMax };
    } else {
      const singleDataset = {
        base: {
          label: 'Base Stats',
          data: this.statsLabels.map((stat) =>
            Math.min(this.getCalculatedStat(stat), maxBase)
          ),
          backgroundColor: baseColor.bg,
          borderColor: baseColor.border,
          pointBackgroundColor: baseColor.point,
          fill: true,
        },
        evs: {
          label: 'EVs',
          data: this.getEVContributionValues(),
          backgroundColor: evColor.bg,
          borderColor: evColor.border,
          pointBackgroundColor: evColor.point,
          fill: true,
        },
        ivs: {
          label: 'IVs',
          data: this.getIVValues(),
          backgroundColor: ivColor.bg,
          borderColor: ivColor.border,
          pointBackgroundColor: ivColor.point,
          fill: true,
        },
      };

      chartMax =
        this.chartMode === 'base'
          ? maxBase
          : this.chartMode === 'evs'
          ? maxEV
          : maxIV;

      datasets.push(singleDataset[this.chartMode]);

      return { datasets, max: chartMax };
    }
  }

  createRadarChart() {
    if (!this.radarChartRef?.nativeElement || !this.selected) return;

    const { datasets, max } = this.getModeData();

    this.chart = new Chart(this.radarChartRef.nativeElement, {
      type: 'radar',
      data: {
        labels: this.statsLabels.map((s) => this.shortenStatName(s)),
        datasets,
      },
      options: {
        responsive: true,
        scales: {
          r: {
            min: 0,
            max,
            angleLines: { color: '#7d7d7dff', lineWidth: 1 },
            grid: { color: '#878787ff', lineWidth: 1 },
            ticks: { display: false, stepSize: max / 6 },
          },
        },
        plugins: {
          legend: { display: true },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (tooltipItem) => {
                const stat = this.statsLabels[tooltipItem.dataIndex];
                if (tooltipItem.dataset.label === 'EVs') {
                  return `${stat.toUpperCase()}: ${
                    this.selected?.evs[stat] ?? 0
                  }`;
                }
                if (tooltipItem.dataset.label === 'IVs') {
                  return `${stat.toUpperCase()}: ${
                    this.selected?.ivs[stat] ?? 0
                  }`;
                }
                return `${tooltipItem.dataset.label}: ${tooltipItem.formattedValue}`;
              },
            },
          },
        },
      },
    });
  }

  updateRadarChart() {
    if (!this.chart || !this.selected) {
      this.createRadarChart();
      return;
    }

    const baseColor = {
      bg: 'rgba(30, 136, 229, 0.25)',
      border: 'rgba(30, 136, 229, 1)',
      point: 'rgba(30, 136, 229, 1)',
    };
    const evColor = {
      bg: 'rgba(255, 215, 0, 0.25)',
      border: 'rgba(218, 165, 32, 1)',
      pointBackgroundColor: 'rgba(255, 215, 0, 1)',
    };
    const ivColor = {
      bg: 'rgba(156, 39, 176, 0.25)',
      border: 'rgba(156, 39, 176, 1)',
      pointBackgroundColor: 'rgba(156, 39, 176, 1)',
    };

    const maxBase = this.getPokemonMaxStat();
    const maxEV = 252;
    const maxIV = 31;

    let datasets: any[] = [];
    let chartMax: number;

    if (this.chartMode === 'all') {
      chartMax = Math.max(maxBase, maxEV, maxIV);

      datasets = [
        {
          label: 'IVs',
          data: this.getIVValues().map((iv) => (iv / maxIV) * chartMax),
          backgroundColor: ivColor.bg,
          borderColor: ivColor.border,
          pointBackgroundColor: ivColor.pointBackgroundColor,
          fill: true,
        },
        {
          label: 'EVs',
          data: this.getEVContributionValues().map(
            (ev) => (ev / maxEV) * chartMax
          ),
          backgroundColor: evColor.bg,
          borderColor: evColor.border,
          pointBackgroundColor: evColor.pointBackgroundColor,
          fill: true,
        },
        {
          label: 'Base Stats',
          data: this.statsLabels.map((stat) =>
            Math.min(this.getCalculatedStat(stat), chartMax)
          ),
          backgroundColor: baseColor.bg,
          borderColor: baseColor.border,
          pointBackgroundColor: baseColor.point,
          fill: true,
        },
      ];
    } else {
      chartMax =
        this.chartMode === 'base'
          ? maxBase
          : this.chartMode === 'evs'
          ? maxEV
          : maxIV;

      const singleDataset = {
        base: {
          label: 'Base Stats',
          data: this.statsLabels.map((stat) =>
            Math.min(this.getCalculatedStat(stat), maxBase)
          ),
          backgroundColor: baseColor.bg,
          borderColor: baseColor.border,
          pointBackgroundColor: baseColor.point,
          fill: true,
        },
        evs: {
          label: 'EVs',
          data: this.getEVContributionValues(),
          backgroundColor: evColor.bg,
          borderColor: evColor.border,
          pointBackgroundColor: evColor.pointBackgroundColor,
          fill: true,
        },
        ivs: {
          label: 'IVs',
          data: this.getIVValues(),
          backgroundColor: ivColor.bg,
          borderColor: ivColor.border,
          pointBackgroundColor: ivColor.pointBackgroundColor,
          fill: true,
        },
      };

      datasets.push(singleDataset[this.chartMode]);
    }

    this.chart.data.datasets = datasets;
    this.chart.options.scales!['r']!.max = chartMax;
    this.chart.options.scales!['r']!.ticks!.stepSize = chartMax / 6;

    this.chart.update('none');
  }

  destroyChart() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }

  save() {
    if (!this.selected) {
      return;
    }
    this.teamService.updatePokemonInActive(this.selected);
  }

  cancel() {
    this.selected = null;
    this.destroyChart(); // remove chart
    window.dispatchEvent(new CustomEvent('select-pokemon', { detail: null }));
  }

  onGlobalClick(event: MouseEvent) {
    // Check if the click target is outside your component element
    const target = event.target as HTMLElement;
    const editorRoot = document.querySelector('.editor-root');

    if (!editorRoot?.contains(target)) {
      this.natureDropdownOpen = false;
      this.abilityDropdownOpen = false;
      this.itemDropdownOpen = false;
      this.ballDropdownOpen = false;
      this.cd.detectChanges();
    }
  }

  onBlur(dropdown: 'ability' | 'nature' | 'item' | 'ball') {
    setTimeout(() => {
      this.ngZone.run(() => {
        if (dropdown === 'ability') this.abilityDropdownOpen = false;
        else if (dropdown === 'nature') this.natureDropdownOpen = false;
        else if (dropdown === 'item') this.itemDropdownOpen = false;
        else if (dropdown === 'ball') this.ballDropdownOpen = false;
        this.cd.detectChanges();
      });
    }, 50);
  }

  onMoveBlur(index: number) {
    setTimeout(() => {
      this.ngZone.run(() => {
        this.moveDropdownOpen[index] = false;
        this.cd.detectChanges();
      });
    }, 50);
  }

  ngOnDestroy() {
    window.removeEventListener('click', this.onGlobalClick.bind(this));
    window.removeEventListener(
      'select-pokemon',
      this.listener as EventListener
    );
    this.teamsSub?.unsubscribe();
  }
}
