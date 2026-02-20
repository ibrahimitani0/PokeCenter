import { Component, OnInit } from '@angular/core';
import { LocalStorage } from '../../../../services/local-storage';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { BehaviorSubject, Observable } from 'rxjs';
import { PokemonTeam, StatMap } from '../../../../models/pokemon-team';
import { Team } from '../../../../models/team';
import { Natures } from '../../../../models/Pokemon/all-natures';
import { FetchNationalDex } from '../../../../services/fetch-national-dex';
import { BattleItems } from '../../../../models/battle-items';

@Component({
  selector: 'app-pokemon-list',
  standalone: false,
  templateUrl: './pokemon-list.html',
  styleUrl: './pokemon-list.css',
})
export class PokemonList implements OnInit {
  teams$: Observable<Team[]>;
  activeIndex$: Observable<number>;

  // local selection for editor (simple shared state)
  selected$ = new BehaviorSubject<PokemonTeam | null>(null);

  naturesList: Natures[] = [];
  item: BattleItems | null = null;

  constructor(
    private teamService: LocalStorage,
    private dex: FetchNationalDex
  ) {
    this.teams$ = this.teamService.teams$;
    this.activeIndex$ = this.teamService.activeIndex$;
  }

  hoverShadow: string = '';
  evStats: (keyof StatMap)[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

  ngOnInit(): void {
    this.dex.getAllNatures().subscribe((n) => {
      this.naturesList = n;
    });
  }

  getItem(itemName: string) {
    if (!itemName) return null;
    return this.dex.getItemByName(itemName);
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

  drop(event: CdkDragDrop<PokemonTeam[]>) {
    if (!event.previousIndex && event.previousIndex !== 0) return;
    this.teamService.reorderPokemonsInActive(
      event.previousIndex,
      event.currentIndex
    );
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

  /** Absolute global max values (Lv100, 31 IV, 252 EV, positive nature where relevant) */
  private getGlobalMax(statKey: keyof StatMap): number {
    return statKey === 'hp' ? 714 : 514;
  }

  getEVUsage(mon: PokemonTeam) {
    if (!mon || !mon.evs) return { used: 0, remaining: 508 };
    const used = this.evStats.reduce((sum, stat) => sum + mon.evs[stat], 0);
    return { used, remaining: 508 - used };
  }

  getNatureSign(mon: PokemonTeam, statKey: keyof StatMap): string {
    const natureMods = this.getNatureModifiers(mon.nature || '');
    if (natureMods[statKey] > 1) return '+';
    if (natureMods[statKey] < 1) return '–';
    return '';
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

  getCalculatedStat(mon: PokemonTeam, stat: keyof StatMap): number {
    if (!mon) return 0;

    const keyToBaseStatName: Record<keyof StatMap, string> = {
      hp: 'hp',
      atk: 'attack',
      def: 'defense',
      spa: 'special-attack',
      spd: 'special-defense',
      spe: 'speed',
    };

    const base =
      mon.baseStats.find((s) => s.name === keyToBaseStatName[stat])
        ?.base_stat || 0;
    const iv = mon.ivs[stat] ?? 31;
    const ev = mon.evs[stat] ?? 0;
    const level = mon.level ?? 100;
    const natureMods = this.getNatureModifiers(mon.nature || '');

    return this.calculateStat(
      base,
      iv,
      ev,
      level,
      natureMods[stat] || 1,
      stat === 'hp'
    );
  }

  /** Fill width: scale to absolute max */
  getStatFillWidth(mon: PokemonTeam, statKey: keyof StatMap): number {
    if (!mon) return 0;
    const value = this.getCalculatedStat(mon, statKey);
    const max = this.getGlobalMax(statKey);
    let percent = (value / max) * 100;
    if (percent > 150) percent = 150;
    return percent;
  }

  /** Color: matches Showdown's general "stat tiers" */
  getStatColorByValue(mon: PokemonTeam, statKey: keyof StatMap): string {
    if (!mon) return 'stat-red';
    const value = this.getCalculatedStat(mon, statKey);
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

  showDefCoverage = false;

  toggleDefCoverage() {
    this.showDefCoverage = !this.showDefCoverage;
  }

  openEditor(mon: PokemonTeam) {
    window.dispatchEvent(new CustomEvent('select-pokemon', { detail: mon }));
  }

  remove(mon: PokemonTeam) {
    if (confirm(`Remove ${mon.nickname || mon.name}?`)) {
      this.teamService.removePokemonFromActive(mon.id);

      // Tell the editor to close if it was showing this Pokémon
      const event = new CustomEvent('select-pokemon', { detail: null });
      window.dispatchEvent(event);
    }
  }
}
