import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { LearnsetEntry, Move } from '../../../services/movedata';
import { Movedata } from '../../../services/movedata'; // adjust path
import { Pokemon } from '../../../models/Pokemon/poke-details';

interface MovesByMethod {
  [method: string]: (LearnsetEntry & { moveDetails: any })[];
}

interface MovesByVersion {
  [version: string]: MovesByMethod;
}

@Component({
  selector: 'app-pokemon-moves',
  standalone: false,
  templateUrl: './pokemon-moves.html',
  styleUrl: './pokemon-moves.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonMoves implements OnChanges {
  @Input() pokemon: Pokemon | null = null;
  @Input() moves: (LearnsetEntry & { moveDetails: Move })[] = [];
  @Input() loading: boolean = true;
  isMobile = window.innerWidth <= 1000;


  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 1000;
  }

  constructor(private movedata: Movedata) {}
  borderColor = '#007bff'; // default border color
  // moves
  movesByVersion: MovesByVersion = {};
  versions: string[] = [];
  selectedVersion: string | null = null;
  methodOrder = [
    'Level up',
    'Evolution',
    'Egg',
    'Tutor',
    'TM/HM',
    'Stadium Surfing Pikachu',
    'Light Ball Egg',
    'Form Change',
    'Other',
  ];

  methodLabelMap: Record<string, string> = {
    'level-up': 'Level up',
    machine: 'TM/HM',
    egg: 'Egg',
    tutor: 'Tutor',
    'stadium-surfing-pikachu': 'Stadium Surfing Pikachu',
    'light-ball-egg': 'Light Ball Egg',
    'form-change': 'Form Change',
    other: 'Other',
    reminder: 'Reminder',
  };
  groupLabelGenerationMap: Record<string, number> = {
    'Red/Blue': 1,
    Yellow: 1,
    'Gold/Silver': 2,
    Crystal: 2,
    'Ruby/Sapphire': 3,
    Emerald: 3,
    'FireRed/LeafGreen': 3,
    'Diamond/Pearl': 4,
    Platinum: 4,
    'HeartGold/SoulSilver': 4,
    Colosseum: 4,
    XD: 4,
    'Black/White': 5,
    'Black 2/White 2': 5,
    'X/Y': 6,
    'Omega Ruby/Alpha Sapphire': 6,
    'Sun/Moon': 7,
    'Ultra Sun/Ultra Moon': 7,
    "Let's Go Pikachu/Eevee": 7,
    'Sword/Shield': 8,
    'Brilliant Diamond/Shining Pearl': 8,
    'Legends Arceus': 8,
    'Scarlet/Violet': 9,
  };
  versionGroupToLabelMap: Record<string, string> = {
    'red-blue': 'Red/Blue',
    yellow: 'Yellow',
    'gold-silver': 'Gold/Silver',
    crystal: 'Crystal',
    'ruby-sapphire': 'Ruby/Sapphire',
    emerald: 'Emerald',
    'firered-leafgreen': 'FireRed/LeafGreen',
    'diamond-pearl': 'Diamond/Pearl',
    platinum: 'Platinum',
    'heartgold-soulsilver': 'HeartGold/SoulSilver',
    colosseum: 'Colosseum',
    xd: 'XD',
    'black-white': 'Black/White',
    'black-2-white-2': 'Black 2/White 2',
    'x-y': 'X/Y',
    'omega-ruby-alpha-sapphire': 'Omega Ruby/Alpha Sapphire',
    'sun-moon': 'Sun/Moon',
    'ultra-sun-ultra-moon': 'Ultra Sun/Ultra Moon',
    'lets-go-pikachu-lets-go-eevee': "Let's Go Pikachu/Eevee",
    'sword-shield': 'Sword/Shield',
    'brilliant-diamond-and-shining-pearl': 'Brilliant Diamond/Shining Pearl',
    'legends-arceus': 'Legends Arceus',
    'scarlet-violet': 'Scarlet/Violet',
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['moves'] && this.moves?.length) {
    this.groupMovesByVersionAndMethod(this.moves);
  }
  }

  onFocus() {
    this.borderColor = '#0056b3'; // focused border color
  }

  onBlur() {
    this.borderColor = '#007bff'; // reset border color
  }

  onVersionChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectVersion(selectElement.value);
  }

  /*
   * =========================
   *            MOVES
   * =========================
   */

  hasValidEggMoves(pokemon: {
    egg_groups: string[];
    is_baby: boolean;
  }): boolean {
    // Baby Pokémon cannot breed, but can have egg moves via evolution line
    if (pokemon.is_baby) return true;

    // Pokémon that belong to the "no-eggs" group can't breed at all → no egg moves
    return !pokemon.egg_groups.includes('no-eggs');
  }

  formatMoveName(name: string): string {
    return name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getMachinesForSelectedVersion(
    move: LearnsetEntry & { moveDetails: Move }
  ): { machine: string; version_group: string }[] {
    if (!move.moveDetails.machines) return [];

    // Normalize selectedVersion to lowercase
    const selectedLower = this.selectedVersion?.toLowerCase() ?? '';

    // Get all machines that match the selected version directly
    const directMatches = move.moveDetails.machines.filter((m) => {
      const label = this.versionGroupToLabelMap[m.version_group]?.toLowerCase();
      return label === selectedLower;
    });

    if (directMatches.length > 0) {
      return directMatches;
    }

    // Only fallback if no direct match was found
    const fallbackMap: Record<string, string[]> = {
      'brilliant diamond/shining pearl': ['diamond/pearl'],
      'omega ruby/alpha sapphire': ['ruby/sapphire'],
      'ultra sun/ultra moon': ['sun/moon'],
      'black 2/white 2': ['black/white'],
      'lets go pikachu/lets go eevee': ['yellow'],
      // Add more as needed
    };

    const fallbackVersions = fallbackMap[selectedLower] ?? [];

    return move.moveDetails.machines.filter((m) => {
      const label = this.versionGroupToLabelMap[m.version_group]?.toLowerCase();
      return fallbackVersions.includes(label);
    });
  }

  groupMovesByVersionAndMethod(
    moves: (LearnsetEntry & { moveDetails: any })[]
  ): void {
    this.movesByVersion = {};

    const isNoEggs =
      this.pokemon &&
      this.pokemon.egg_groups?.includes('no-eggs') &&
      !this.pokemon.is_baby;

    moves.forEach((move) => {
      const rawVersionGroup = move.version_group.toLowerCase();
      const groupLabel =
        this.versionGroupToLabelMap[rawVersionGroup] ?? rawVersionGroup;

      let rawMethod = move.learn_method.toLowerCase();
      if (rawMethod === 'egg' && isNoEggs) {
        rawMethod = 'reminder';
      }

      let method = this.methodLabelMap[rawMethod] ?? rawMethod;

      // Special case: level-up but no valid level (e.g., evolution-only moves)
      if (method === 'Level up' && (!move.level || move.level <= 0)) {
        method = 'Evolution';
      }

      if (!this.movesByVersion[groupLabel]) {
        this.movesByVersion[groupLabel] = {};
      }

      if (!this.movesByVersion[groupLabel][method]) {
        this.movesByVersion[groupLabel][method] = [];
      }

      this.movesByVersion[groupLabel][method].push(move);
    });

    // Sort each list
    Object.entries(this.movesByVersion).forEach(([version, methodMap]) => {
      Object.entries(methodMap).forEach(([method, moveList]) => {
        if (method === 'Level up') {
          moveList.sort((a, b) => {
            if (a.level === b.level) {
              return a.moveDetails.name.localeCompare(b.moveDetails.name);
            }
            return a.level - b.level;
          });
        } else if (['TM', 'HM', 'TR'].includes(method)) {
          moveList.sort((a, b) => {
            const getMachineNumber = (
              move: LearnsetEntry & { moveDetails: Move }
            ): number => {
              const machine =
                this.getMachinesForSelectedVersion(move)[0]?.machine ?? '';
              const match = machine.match(/\d+/);
              return match ? parseInt(match[0], 10) : 999;
            };

            const aNum = getMachineNumber(a);
            const bNum = getMachineNumber(b);

            if (aNum === bNum) {
              return a.moveDetails.name.localeCompare(b.moveDetails.name);
            }

            return aNum - bNum;
          });
        } else {
          // Alphabetical sort fallback
          moveList.sort((a, b) =>
            a.moveDetails.name.localeCompare(b.moveDetails.name)
          );
        }
      });
    });

    this.versions = Object.keys(this.movesByVersion);
    this.versions.sort((a, b) => {
      const genA = this.groupLabelGenerationMap[a] ?? 99;
      const genB = this.groupLabelGenerationMap[b] ?? 99;
      return genA === genB ? a.localeCompare(b) : genA - genB;
    });

    this.selectedVersion = this.versions[this.versions.length - 1] ?? null;
  }

  getCategoryStatusImage(category: string): string {
    if (!category) return ''; // or a default image path if you want
    return `../../../../assets/moves/categ/${category.toLowerCase()}.png`;
  }

  selectVersion(version: string): void {
    this.selectedVersion = version;
  }

  getOrderedMethodsForSelectedVersion(): string[] {
    if (!this.selectedVersion || !this.movesByVersion[this.selectedVersion]) {
      return [];
    }
    const methods = Object.keys(this.movesByVersion[this.selectedVersion]);
    // Sort methods according to methodOrder
    methods.sort((a, b) => {
      const indexA = this.methodOrder.indexOf(a);
      const indexB = this.methodOrder.indexOf(b);
      const posA = indexA === -1 ? this.methodOrder.length : indexA;
      const posB = indexB === -1 ? this.methodOrder.length : indexB;
      return posA - posB;
    });
    return methods;
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
}
