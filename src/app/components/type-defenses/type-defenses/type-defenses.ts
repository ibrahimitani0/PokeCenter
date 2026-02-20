import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges
} from '@angular/core';
import { TYPE_CHART } from '../type-chart';
@Component({
  selector: 'app-type-defenses',
  standalone: false,
  templateUrl: './type-defenses.html',
  styleUrl: './type-defenses.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypeDefenses implements OnChanges {
  @Input() name = 'this Pokémon'; // Optional for label
  @Input() types: string[] = [];
  @Input() context: 'pokemon' | 'type' = 'pokemon'; // Add this line
  allTypes = Object.keys(TYPE_CHART);
  typeMultipliers: Record<string, number> = {};

  topRow = [
    'normal',
    'fire',
    'water',
    'electric',
    'grass',
    'ice',
    'fighting',
    'poison',
    'ground',
  ];
  bottomRow = [
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

  typeColors: Record<string, string> = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
  };

  ngOnChanges() {
    const defendTypes = this.types.map((t) => t.toLowerCase());

    for (const attackType of this.allTypes) {
      let multiplier = 1;
      for (const defendType of defendTypes) {
        const value = TYPE_CHART[attackType]?.[defendType] ?? 1;
        multiplier *= value;
      }
      this.typeMultipliers[attackType] = multiplier;
    }
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

  formatMultiplier(val: number): string {
    return val === 0 ? '0×' : val % 1 === 0 ? `${val}×` : `${val.toFixed(1)}×`;
  }

  getClass(val: number): string {
    if (val === 0) return 'immune';
    if (val > 1) return 'weak';
    if (val < 1) return 'resist';
    return 'neutral';
  }
  
}
