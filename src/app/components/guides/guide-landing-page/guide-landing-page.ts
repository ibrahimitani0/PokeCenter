import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TYPE_CHART } from '../../type-defenses/type-chart';
import { Move } from '../../../services/movedata';
import { BattleItems } from '../../../models/battle-items';
import { Natures } from '../../../models/Pokemon/all-natures';
import { AllAbilities } from '../../../models/Pokemon/all-abilities';
import { EggGroups } from '../../../models/Pokemon/all-egg-groups';
import { Character } from '../../../models/Pokemon/characteristics';
import { forkJoin } from 'rxjs';
import { FetchNationalDex } from '../../../services/fetch-national-dex';
import { Pokemon, Variety } from '../../../models/Pokemon/poke-details';

@Component({
  selector: 'app-guide-landing-page',
  standalone: false,
  templateUrl: './guide-landing-page.html',
  styleUrl: './guide-landing-page.css',
})
export class GuideLandingPage implements OnInit {
  natures: Natures[] = [];
  abilities: AllAbilities[] = [];
  eggGroups: EggGroups[] = [];
  characteristics: Character[] = [];
  moves: Move[] = [];
  items: BattleItems[] = [];
  activeTab = 'natures';
  loading = true;

  abilitySearch: string = '';
  moveSearch: string = '';
  selectedGeneration: string = '';
  selectedmoveGen: string = '';
  itemSearch: string = '';
  selectedItemCatego: string = '';

  // Sorting
  bases: Pokemon[] = [];
  forms: Variety[] = [];
  private baseDex = new Map<string, number>();
  allPokemon: (Pokemon | Variety)[] = [];

  tabs = [
    { id: 'training', label: 'Training' },
    { id: 'breeding', label: 'Breeding & Egg Groups' },
    { id: 'evs-ivs', label: 'EVs & IVs' },
    { id: 'natures', label: 'Natures' },
    { id: 'abilities', label: 'Abilities' },
    { id: 'type-chart', label: 'Type Chart' },
    { id: 'all-moves', label: 'Pokémon Moves' },
    { id: 'items', label: 'Items' },
    { id: 'battle-styles', label: 'Battle Styles' },
  ];

  stats = ['attack', 'defense', 'special-attack', 'special-defense', 'speed'];

  statDisplayNames: Record<string, string> = {
    attack: 'Attack',
    defense: 'Defense',
    'special-attack': 'Sp. Atk',
    'special-defense': 'Sp. Def',
    speed: 'Speed',
  };

  statMap = [
    'HP',
    'Attack',
    'Defense',
    'Speed',
    'Special Attack',
    'Special Defense',
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dex: FetchNationalDex,
    private cd: ChangeDetectorRef
  ) {}
  TYPE_CHART = TYPE_CHART;
  types = [
    'normal',
    'fire',
    'water',
    'electric',
    'grass',
    'ice',
    'fighting',
    'poison',
    'ground',
    'flying',
    'psychic',
    'bug',
    'rock',
    'ghost',
    'dragon',
    'dark',
    'steel',
    'fairy',
  ];

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

  geteggGroupColor(egg: string): string {
    return this.eggGroupColors[egg.toLowerCase()];
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
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
    return colors[type.toLowerCase()] || 'rgba(0,0,0,0.2)';
  }

  ngOnInit(): void {
    this.loading = true;

    // React to resolver data changes (on init and on :mode changes)
    this.route.data.subscribe((data) => {
      const guidesData = data['guidesData'] || {};
      this.natures = guidesData.natures || [];
      this.abilities = guidesData.abilities || [];
      this.eggGroups = guidesData.eggGroups || [];
      this.characteristics = guidesData.characteristics || [];
      this.moves = guidesData.moves || [];
      this.items = guidesData.items || [];
      this.loading = false;
    });

    // Initial active tab from URL param
    this.activeTab = this.route.snapshot.paramMap.get('mode') || 'training';

    // Watch for :mode param changes and update activeTab accordingly
    this.route.paramMap.subscribe((params) => {
      const mode = params.get('mode') || 'training';
      if (this.activeTab !== mode) {
        this.activeTab = mode;
      }
    });
    // Fetch the merged Pokémon master list
    this.dex.getPokemonMasterList().subscribe((allPokemon) => {
      this.allPokemon = allPokemon;

      // Optional: compute EV counts once full list is available
      this.countEVsFromStats(this.allPokemon);
      this.loading = false;
      this.cd.detectChanges();
    });
  }

  evCounts = {
    hp: 0,
    attack: 0,
    defense: 0,
    spAttack: 0,
    spDefense: 0,
    speed: 0,
  };

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

  getMultiplier(atk: string, def: string): number {
    // Return the multiplier for atk against def or 1 if not defined
    return this.TYPE_CHART[atk]?.[def] ?? 1;
  }

  getMultiplierClass(multiplier: number): string {
    if (multiplier === 0) return 'immune';
    if (multiplier === 0.5) return 'resist';
    if (multiplier === 2) return 'weak';
    return 'neutral';
  }
  formatMultiplier(multiplier: number): string {
    return multiplier === 1 ? '1×' : `${multiplier}×`;
  }

  onTabChange(tabId: string) {
    if (tabId === this.activeTab) return; // avoid redundant navigation
    this.router.navigate(['/guides', tabId]);
  }

  getNatureByRaiseAndLower(raise: string, lower: string): string {
    const found = this.natures.find(
      (n) =>
        n.raises.toLowerCase() === raise.toLowerCase() &&
        n.lowers.toLowerCase() === lower.toLowerCase()
    );
    return found ? found.natureName : '';
  }

  isRaisedStat(stat: string): boolean {
    return this.natures.some(
      (n) => n.raises.toLowerCase() === stat.toLowerCase()
    );
  }

  isLoweredStat(stat: string): boolean {
    return this.natures.some(
      (n) => n.lowers.toLowerCase() === stat.toLowerCase()
    );
  }

  get generations(): string[] {
    const gens = this.abilities.map((a) =>
      a.generation.name.replace('generation-', '').toUpperCase()
    );
    return [...new Set(gens)].sort();
  }

  get moveGen(): string[] {
    const gens = this.moves.map((a) =>
      a.generation_introduced.replace('generation-', '').toUpperCase()
    );
    return [...new Set(gens)].sort();
  }

  sanitizeName(name: string): string {
    return name
      .split('-') // Split on dash
      .map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1) // Capitalize each word
      )
      .join(' '); // Join with a space (no dash)
  }

  filteredAbilities(): AllAbilities[] {
    const query = this.abilitySearch
      .trim()
      .toLowerCase()
      .replace(/[\s\-]+/g, '');

    return this.abilities
      .filter((a) => {
        const abilityName = a.name.toLowerCase().replace(/[\s\-]+/g, '');
        const nameMatch = abilityName.includes(query);

        const genName = a.generation.name
          .replace('generation-', '')
          .toUpperCase();
        const genMatch =
          !this.selectedGeneration || genName === this.selectedGeneration;

        return nameMatch && genMatch;
      })
      .sort((a, b) =>
        this.sanitizeName(a.name).localeCompare(this.sanitizeName(b.name))
      );
  }

  // Get the English short effect description from the ability data
  getEnglishEffect(a: AllAbilities): string {
    const entry = a.effect_entries.find((e) => e.language.name === 'en');
    return entry ? entry.short_effect : '(No English description)';
  }
  getCategoryStatusImage(category: string): string {
    if (!category) return ''; // or a default image path if you want
    return `../../../../assets/moves/categ/${category.toLowerCase()}.png`;
  }

  filtereditems(): BattleItems[] {
    const query = this.itemSearch
      .trim()
      .toLowerCase()
      .replace(/[\s\-]+/g, '');

    return this.items
      .filter((i) => {
        const itemName = i.name.toLowerCase().replace(/[\s\-]+/g, '');
        const nameMatch = itemName.includes(query);
        const categName = i.category.toLowerCase();
        const categMatch =
          !this.selectedItemCatego || categName === this.selectedItemCatego;
        return nameMatch && categMatch;
      })
      .sort((a, b) =>
        this.sanitizeName(a.name).localeCompare(this.sanitizeName(b.name))
      );
  }

  get itemCateg(): string[] {
    const categ = this.items.map((a) => a.category.toLowerCase());
    return [...new Set(categ)].sort();
  }

  filteredMoves(): Move[] {
    const query = this.moveSearch
      .trim()
      .toLowerCase()
      .replace(/[\s\-]+/g, '');

    return this.moves
      .filter((a) => {
        const moveName = a.name.toLowerCase().replace(/[\s\-]+/g, '');
        const nameMatch = moveName.includes(query);

        const genName = a.generation_introduced
          .replace('generation-', '')
          .toUpperCase();
        const genMatch =
          !this.selectedmoveGen || genName === this.selectedmoveGen;

        return nameMatch && genMatch;
      })
      .sort((a, b) =>
        this.sanitizeName(a.name).localeCompare(this.sanitizeName(b.name))
      );
  }

  getStatFromGeneModulo(geneModulo: number): string {
    // example mapping
    switch (geneModulo) {
      case 0:
        return 'HP';
      case 1:
        return 'ATK';
      case 2:
        return 'DEF';
      case 3:
        return 'SPATK';
      case 4:
        return 'SPDEF';
      case 5:
        return 'SPEED';
      default:
        return 'HP';
    }
  }
  get groupedCharacteristics() {
    if (!this.characteristics) return {};
    return this.getGroupedCharacteristics();
  }

  getGroupedStats(): string[] {
    return Object.keys(this.groupedCharacteristics || {});
  }

  getGroupedCharacteristics() {
    const groups: Record<
      string,
      { descriptions: string[]; possibleValues: number[] }
    > = {};

    this.characteristics.forEach((char) => {
      const stat = this.getStatFromGeneModulo(char.gene_modulo);

      if (!groups[stat]) {
        groups[stat] = {
          descriptions: [],
          possibleValues: [],
        };
      }

      // Avoid duplicate descriptions
      if (!groups[stat].descriptions.includes(char.description)) {
        groups[stat].descriptions.push(char.description);
      }

      // Merge possible values, avoid duplicates
      char.possible_values.forEach((val) => {
        if (!groups[stat].possibleValues.includes(val)) {
          groups[stat].possibleValues.push(val);
        }
      });
    });

    // Optional: sort possibleValues ascending
    for (const stat in groups) {
      groups[stat].possibleValues.sort((a, b) => a - b);
    }

    return groups;
  }
}
