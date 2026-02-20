import { Component, Input } from '@angular/core';
import { TYPE_CHART } from '../../../type-defenses/type-chart';
import { PokemonTeam } from '../../../../models/pokemon-team';
import { ABILITY_EFFECTS } from '../../../../models/ability-effect';

@Component({
  selector: 'app-team-weaknesses',
  standalone: false,
  templateUrl: './team-weaknesses.html',
  styleUrl: './team-weaknesses.css',
})
export class TeamWeaknesses {
  @Input() team: PokemonTeam[] = [];
  teamWeaknesses: Record<string, number> = {};
  allTypes = Object.keys(TYPE_CHART);

  ngOnInit() {
    this.calculateWeaknesses();
  }

  ngOnChanges() {
    this.calculateWeaknesses();
  }
  getCoverageDisplay(mon: PokemonTeam, attackType: string): string {
    const val = this.getCoverageValue(mon, attackType);
    return val === 1 ? '' : this.formatMultiplier(val);
  }

  getTotalWeakDisplay(type: string): string {
    const val = this.getTotalWeak(type);
    return val > 0 ? val.toString() : '';
  }

  getTotalResistDisplay(type: string): string {
    const val = this.getTotalResist(type);
    return val > 0 ? val.toString() : '';
  }

  getTotalWeakClass(type: string) {
    return this.getTotalWeak(type) > 0 ? 'weak' : '';
  }

  getTotalResistClass(type: string) {
    return this.getTotalResist(type) > 0 ? 'resist' : '';
  }

  calculateWeaknesses() {
    if (!this.team?.length) return;

    this.teamWeaknesses = this.allTypes.reduce((acc, type) => {
      // Start neutral (1x) for each attack type
      acc[type] = 1;
      return acc;
    }, {} as Record<string, number>);

    this.allTypes.forEach((attackType) => {
      let teamMultiplier = 1; // Neutral by default

      this.team.forEach((pokemon) => {
        // Calculate Pokémon's multiplier against this attack type
        let monMultiplier = 1;
        pokemon.types.forEach((defType) => {
          monMultiplier *=
            TYPE_CHART[attackType.toLowerCase()][defType?.toLowerCase()] ?? 1;
        });

        // For team coverage, take the **max multiplier** (worst-case)
        if (monMultiplier > teamMultiplier) {
          teamMultiplier = monMultiplier;
        }
      });

      this.teamWeaknesses[attackType] = teamMultiplier;
    });
  }

  getMultiplierClass(mult: number): string {
    if (mult === 0) return 'immune';
    if (mult < 1) return 'resist';
    if (mult > 1) return 'weak';
    return 'neutral';
  }

  getCoverageValue(mon: PokemonTeam, attackType: string): number {
    let multiplier = 1;
    const typeLower = attackType.toLowerCase();

    // Check ability first
    const ability = mon.ability;
    if (ability) {
      const effects = ABILITY_EFFECTS[ability];
      if (effects?.immuneTo?.some((t) => t.toLowerCase() === typeLower)) {
        return 0; // immune due to ability
      }
      if (effects?.resist?.some((t) => t.toLowerCase() === typeLower)) {
        multiplier *= 0.5; // resist due to ability
      }
    }
    if (ability === 'wonder-guard') {
      // immune to any move that is not super-effective (multiplier <= 1)
      let typeMultiplier = 1;
      mon.types.forEach((defType) => {
        typeMultiplier *= TYPE_CHART[typeLower][defType.toLowerCase()] ?? 1;
      });
      if (typeMultiplier <= 1) return 0; // immune
    }

    // Then apply type chart normally
    mon.types.forEach((defType) => {
      multiplier *= TYPE_CHART[typeLower][defType.toLowerCase()] ?? 1;
    });

    return multiplier;
  }

  getCoverageClass(mon: PokemonTeam, attackType: string): string {
    const val = this.getCoverageValue(mon, attackType);
    return val === 0
      ? 'immune'
      : val < 1
      ? 'resist'
      : val > 1
      ? 'weak'
      : 'neutral';
  }

  // Count Pokémon weak (>1x)
  getTotalWeak(type: string): number {
    return this.team.filter((mon) => {
      const coverage = this.getCoverageValue(mon, type);
      return coverage > 1;
    }).length;
  }

  // Count Pokémon resist or immune (<1x or 0x)
  getTotalResist(type: string): number {
    return this.team.filter((mon) => {
      const coverage = this.getCoverageValue(mon, type);
      return coverage < 1; // includes 0 (immune) and 0.25/0.5
    }).length;
  }

  formatMultiplier(value: number): string {
    switch (value) {
      case 0:
        return 'immune';
      case 0.25:
        return '¼';
      case 0.5:
        return '½';
      case 1:
        return '1x';
      case 2:
        return '2x';
      case 4:
        return '4x';
      default:
        return value.toString();
    }
  }
}
