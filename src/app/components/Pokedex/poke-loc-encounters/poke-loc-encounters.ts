import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Pokemon } from '../../../models/Pokemon/poke-details';
import { VersionEncounter, versionOrder } from '../../../models/Pokemon/poke-locations';

@Component({
  selector: 'app-poke-loc-encounters',
  standalone: false,
  templateUrl: './poke-loc-encounters.html',
  styleUrl: './poke-loc-encounters.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokeLocEncounters implements OnChanges {
  @Input() pokemon: Pokemon | null = null;
  @Input() selectedPokemon: Pokemon | null = null;

  locationEncounters: VersionEncounter[] = [];
  versionOrder = versionOrder;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pokemon'] && this.pokemon) {
      this.groupAndSortLocationEncounters();
    }
  }

  groupAndSortLocationEncounters() {
    if (!this.pokemon?.location_area_encounters) {
      this.locationEncounters = [];
      return;
    }

    const versionMap = new Map<string, VersionEncounter>();

    this.pokemon.location_area_encounters.forEach((locationEncounter) => {
      const locName = locationEncounter.location_area;

      locationEncounter.version_details.forEach((versionDetail) => {
        const versionKey = versionDetail.version.toLowerCase();

        if (!versionMap.has(versionKey)) {
          versionMap.set(versionKey, {
            version: versionDetail.version,
            location_details: [
              {
                location_area: locName,
                max_chance: versionDetail.max_chance,
                encounter_details: [...versionDetail.encounter_details],
              },
            ],
          });
        } else {
          const versionEntry = versionMap.get(versionKey)!;

          const existingLoc = versionEntry.location_details.find(
            (loc) => loc.location_area === locName
          );

          if (existingLoc) {
            existingLoc.encounter_details.push(
              ...versionDetail.encounter_details
            );
            existingLoc.max_chance = Math.max(
              existingLoc.max_chance,
              versionDetail.max_chance
            );
          } else {
            versionEntry.location_details.push({
              location_area: locName,
              max_chance: versionDetail.max_chance,
              encounter_details: [...versionDetail.encounter_details],
            });
          }
        }
      });
    });

    const mergedArray = Array.from(versionMap.values());

    this.locationEncounters = mergedArray.sort((a, b) => {
      const aIndex = this.versionOrder.indexOf(a.version.toLowerCase());
      const bIndex = this.versionOrder.indexOf(b.version.toLowerCase());

      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;

      return aIndex - bIndex;
    });
  }

  // Helper functions for template:

  formatTitleCase(str: string): string {
    if (!str) return '';
    return str.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  uniqueArray(arr: string[]): string[] {
    return arr.filter((v, i, a) => a.indexOf(v) === i);
  }

  cleanLocationName(rawName: string): string {
    if (!rawName) return '';

    // Define region prefixes you want to remove
    const regions = [
      'kanto-',
      'johto-',
      'hoenn-',
      'sinnoh-',
      'unova-',
      'kalos-',
      'alola-',
      'galar-',
      'paldea-',
    ];

    let name = rawName;

    // Remove region prefix if it matches
    for (const region of regions) {
      if (name.startsWith(region)) {
        name = name.slice(region.length);
        break;
      }
    }

    // Remove trailing '-Area' or '-area'
    name = name.replace(/-area$/i, '');

    name = name.replace(
      /unknown-all-bugs$/i,
      'Walking in tall grass or a cave'
    );
    name = name.replace(
      /unknown-all-rattata$/i,
      'Walking in tall grass or a cave'
    );
    name = name.replace(/unknown-all-poliwag$/i, 'Fishing with a rod');

    // Replace remaining dashes with spaces
    name = name.replace(/-/g, ' ');

    return this.formatTitleCase(name.trim());
  }

  getCombinedLocations(versionGroup: VersionEncounter): string {
    const locations = versionGroup.location_details.map((loc) =>
      this.cleanLocationName(loc.location_area)
    );
    return this.uniqueArray(locations).join(', ');
  }

  getCombinedMethods(versionGroup: VersionEncounter): string {
    const methods = versionGroup.location_details.flatMap((loc) =>
      loc.encounter_details.map((d) => this.formatTitleCase(d.method.name))
    );
    return this.uniqueArray(methods).join(', ');
  }

  getCombinedChances(versionGroup: VersionEncounter): string {
    const chances = versionGroup.location_details.flatMap((loc) =>
      loc.encounter_details.map((d) => d.chance.toString())
    );
    return chances.join(', ');
  }

  getCombinedLevels(versionGroup: VersionEncounter): string {
    const levels = versionGroup.location_details.flatMap((loc) =>
      loc.encounter_details.map((d) => `${d.min_level} - ${d.max_level}`)
    );
    return this.uniqueArray(levels).join(', ');
  }

  getCombinedConditions(versionGroup: VersionEncounter): string {
    const conds = versionGroup.location_details.flatMap((loc) =>
      loc.encounter_details.flatMap((d) =>
        d.condition_values.map((cv) => this.formatTitleCase(cv.name))
      )
    );
    const uniqueConds = this.uniqueArray(conds);
    return uniqueConds.length ? uniqueConds.join(', ') : 'None';
  }

  getTypeShadowColor(type: string): string {
    const colors: Record<string, string> = {
      normal: 'rgba(168, 168, 120, 0.4)', // #A8A878
      fire: 'rgba(240, 128, 48, 0.4)', // #F08030
      water: 'rgba(104, 144, 240, 0.4)', // #6890F0
      electric: 'rgba(248, 208, 48, 0.4)', // #F8D030
      grass: 'rgba(120, 200, 80, 0.4)', // #78C850
      ice: 'rgba(152, 216, 216, 0.4)', // #98D8D8
      fighting: 'rgba(192, 48, 40, 0.4)', // #C03028
      poison: 'rgba(160, 64, 160, 0.4)', // #A040A0
      ground: 'rgba(224, 192, 104, 0.4)', // #E0C068
      flying: 'rgba(168, 144, 240, 0.4)', // #A890F0
      psychic: 'rgba(248, 88, 136, 0.4)', // #F85888
      bug: 'rgba(168, 184, 32, 0.4)', // #A8B820
      rock: 'rgba(184, 160, 56, 0.4)', // #B8A038
      ghost: 'rgba(112, 88, 152, 0.4)', // #705898
      dragon: 'rgba(112, 56, 248, 0.4)', // #7038F8
      dark: 'rgba(112, 88, 72, 0.4)', // #705848
      steel: 'rgba(184, 184, 208, 0.4)', // #B8B8D0
      fairy: 'rgba(238, 153, 172, 0.4)', // #EE99AC
    };
    return colors[type.toLowerCase()] || 'rgba(0,0,0,0.2)';
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

  getColorForGame(label: string): string {
    label = label.toLowerCase();
    if (label.includes('red')) return '#FF0000'; // Red
    if (label.includes('blue')) return '#3399FF'; // Blue
    if (label.includes('yellow')) return '#FFEB3B'; // Yellow
    if (label.includes('gold')) return '#FFD700'; // Gold
    if (label.includes('silver')) return '#C0C0C0'; // Silver
    if (label.includes('crystal')) return '#00FFFF'; // Crystal
    if (label.includes('ruby')) return '#E0115F'; // Ruby
    if (label.includes('sapphire')) return '#0066CC'; // Sapphire
    if (label.includes('emerald')) return '#50C878'; // Emerald
    if (label.includes('firered')) return '#FF6347'; // FireRed
    if (label.includes('leafgreen')) return '#32CD32'; // LeafGreen
    if (label.includes('diamond')) return '#B9F2FF'; // Diamond
    if (label.includes('pearl')) return '#E5E4E2'; // Pearl
    if (label.includes('platinum')) return '#E6E8FA'; // Platinum
    if (label.includes('heartgold')) return '#FFD700'; // HeartGold
    if (label.includes('soulsilver')) return '#C0C0C0'; // SoulSilver
    if (label.includes('black 2')) return '#222222'; // Black 2
    if (label.includes('white 2')) return '#F5F5F5'; // White 2
    if (label.includes('black')) return '#000000'; // Black
    if (label.includes('white')) return '#e0e0e0'; // White
    if (label.includes('x')) return '#1E90FF'; // X
    if (label.includes('y')) return '#FF0000'; // Y
    if (label.includes('omega ruby')) return '#B22222'; // Omega Ruby
    if (label.includes('alpha sapphire')) return '#4682B4'; // Alpha Sapphire
    if (label.includes('sun')) return '#FFA500'; // Sun
    if (label.includes('moon')) return '#8A2BE2'; // Moon
    if (label.includes('ultra sun')) return '#FF8C00'; // Ultra Sun
    if (label.includes('ultra moon')) return '#6A5ACD'; // Ultra Moon
    if (label.includes("let's go pikachu")) return '#FFCB05'; // Pikachu yellow
    if (label.includes("let's go eevee")) return '#A0522D'; // Eevee brown
    if (label.includes('sword')) return '#1E90FF'; // Sword
    if (label.includes('shield')) return '#FF0000'; // Shield
    if (label.includes('scarlet')) return '#FF4500'; // Scarlet
    if (label.includes('violet')) return '#9400D3'; // Violet
    // Default fallback
    return '#000000';
  }
}
