import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Pokemon } from '../../../models/Pokemon/poke-details';


@Component({
  selector: 'app-pokemon-entries',
  standalone: false,
  templateUrl: './pokemon-entries.html',
  styleUrl: './pokemon-entries.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonEntries implements OnChanges {
  @Input() pokemon: Pokemon | null = null;

  groupedFlavorTexts: { label: string; text: string }[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pokemon'] && this.pokemon) {
      this.groupFlavorTexts();
    }
  }

  // *** Flavor Text ***
  groupFlavorTexts() {
    if (!this.pokemon?.flavor_texts_en) {
      this.groupedFlavorTexts = [];
      return;
    }
    const flavorTexts = this.pokemon.flavor_texts_en;
    // Official Pokemondb version groups
    const versionGroups = [
      { label: 'Red/Blue', versions: ['red', 'blue'] },
      { label: 'Yellow', versions: ['yellow'] },
      { label: 'Gold/Silver', versions: ['gold', 'silver'] },
      { label: 'Crystal', versions: ['crystal'] },
      { label: 'Ruby/Sapphire', versions: ['ruby', 'sapphire'] },
      { label: 'Emerald', versions: ['emerald'] },
      { label: 'FireRed/LeafGreen', versions: ['firered', 'leafgreen'] },
      { label: 'Diamond/Pearl', versions: ['diamond', 'pearl'] },
      { label: 'Platinum', versions: ['platinum'] },
      { label: 'HeartGold/SoulSilver', versions: ['heartgold', 'soulsilver'] },
      { label: 'Black/White', versions: ['black', 'white'] },
      { label: 'Black 2/White 2', versions: ['black-2', 'white-2'] },
      { label: 'X/Y', versions: ['x', 'y'] },
      {
        label: 'Omega Ruby/Alpha Sapphire',
        versions: ['omega-ruby', 'alpha-sapphire'],
      },
      { label: 'Sun/Moon', versions: ['sun', 'moon'] },
      { label: 'Ultra Sun/Ultra Moon', versions: ['ultra-sun', 'ultra-moon'] },
      {
        label: "Let's Go Pikachu/Eevee",
        versions: ['lets-go-pikachu', 'lets-go-eevee'],
      },
      {
        label: 'Legends Arceus',
        versions: ['legends-arceus'],
      },
      { label: 'Sword/Shield', versions: ['sword', 'shield'] },
      { label: 'Scarlet/Violet', versions: ['scarlet', 'violet'] },
    ];

    const normalizeText = (text: string) =>
      text
        .replace(/\f/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
    const groupedEntries: {
      [groupLabel: string]: {
        label: string;
        texts: {
          [normalizedText: string]: { original: string; versions: Set<string> };
        };
      };
    } = {};
    for (const group of versionGroups) {
      groupedEntries[group.label] = { label: group.label, texts: {} };
      const entriesInGroup = flavorTexts.filter((ft) =>
        group.versions.includes(ft.game.toLowerCase())
      );
      for (const entry of entriesInGroup) {
        const normText = normalizeText(entry.text);
        if (!groupedEntries[group.label].texts[normText]) {
          groupedEntries[group.label].texts[normText] = {
            original: entry.text.replace(/\f/g, ' ').trim(),
            versions: new Set(),
          };
        }
        groupedEntries[group.label].texts[normText].versions.add(
          entry.game.toLowerCase()
        );
      }
    }
    // Map version keys to display names
    const versionNameMap: Record<string, string> = {
      red: 'Red',
      blue: 'Blue',
      yellow: 'Yellow',
      gold: 'Gold',
      silver: 'Silver',
      crystal: 'Crystal',
      ruby: 'Ruby',
      sapphire: 'Sapphire',
      emerald: 'Emerald',
      firered: 'FireRed',
      leafgreen: 'LeafGreen',
      diamond: 'Diamond',
      pearl: 'Pearl',
      platinum: 'Platinum',
      heartgold: 'HeartGold',
      soulsilver: 'SoulSilver',
      black: 'Black',
      white: 'White',
      'black-2': 'Black 2',
      'white-2': 'White 2',
      x: 'X',
      y: 'Y',
      'omega-ruby': 'Omega Ruby',
      'alpha-sapphire': 'Alpha Sapphire',
      sun: 'Sun',
      moon: 'Moon',
      'ultra-sun': 'Ultra Sun',
      'ultra-moon': 'Ultra Moon',
      'lets-go-pikachu': "Let's Go Pikachu",
      'lets-go-eevee': "Let's Go Eevee",
      'legends-arceus': 'Legends Arceus',
      sword: 'Sword',
      shield: 'Shield',
      scarlet: 'Scarlet',
      violet: 'Violet',
    };
    const finalGrouped: { label: string; text: string }[] = [];
    for (const group of versionGroups) {
      const textMap = groupedEntries[group.label].texts;
      for (const key in textMap) {
        const entry = textMap[key];
        // Sort versions alphabetically by display name
        const sortedVersions = Array.from(entry.versions).sort((a, b) =>
          versionNameMap[a].localeCompare(versionNameMap[b])
        );
        const combinedLabel = sortedVersions
          .map((v) => versionNameMap[v])
          .join('/');
        finalGrouped.push({
          label: combinedLabel,
          text: entry.original,
        });
      }
    }
    this.groupedFlavorTexts = finalGrouped;
  }

  // *** Improved getColorForGame for pokemondb.net matching colors ***
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
    if (label.includes('legends arceus')) return '#307833ff'; // Legends Arceus
    if (label.includes('sword')) return '#1E90FF'; // Sword
    if (label.includes('shield')) return '#FF0000'; // Shield
    if (label.includes('scarlet')) return '#FF4500'; // Scarlet
    if (label.includes('violet')) return '#9400D3'; // Violet
    // Default fallback
    return '#000000';
  }
}
