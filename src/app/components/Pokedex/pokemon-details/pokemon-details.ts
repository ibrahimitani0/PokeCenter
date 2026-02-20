import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FetchNationalDex } from '../../../services/fetch-national-dex';
import { LearnsetEntry, Move, Movedata } from '../../../services/movedata';
import { Pokemon } from '../../../models/Pokemon/poke-details';

@Component({
  selector: 'app-pokemon-details',
  standalone: false,
  templateUrl: './pokemon-details.html',
  styleUrl: './pokemon-details.css',
})
export class PokemonDetails implements OnInit {
  error: string | null = null;
  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    this.renderer.addClass(this.el.nativeElement, 'fade-out');

    // setTimeout(() => {
    //   window.location.reload();
    // }, 300);
  }
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dexService: FetchNationalDex,
    private renderer: Renderer2,
    private el: ElementRef,
    private movedata: Movedata
  ) {}

  pokemon: Pokemon | null = null;
  moves: (LearnsetEntry & { moveDetails: Move })[] = [];
  selectedVarietyIndex = 0;
  // Your existing method to fill spriteGallery must structure sprites like this:
  spriteGallery: {
    [generation: string]: {
      normal?: string;
      shiny?: string;
    };
  } = {};
  pokedex: Pokemon[] = []; // this is used for button navigation to next and prev pokemon
  prevPokemon: Pokemon | null = null;
  nextPokemon: Pokemon | null = null;
  loading = true;
  // Grouped flavor texts to display
  menuOpen: boolean = false;
  menuVisible = true;
  /************************************/
  Object = Object;
  showShiny: boolean = false;
  voices: SpeechSynthesisVoice[] = [];
  audio = new Audio();
  volume = 0.5;
  isPlaying = false;

  habitatBackgrounds: Record<string, string> = {
    cave: 'url(../../../../assets/cave.png)',
    forest: 'url(../../../../assets/forest.png)',
    grassland: 'url(../../../../assets/grassland.png)',
    mountain: 'url(../../../../assets/mountain.png)',
    rare: 'url(../../../../assets/rare.png)',
    rough_terrain: 'url(../../../../assets/rough-terrain.png)',
    sea: 'url(../../../../assets/sea.png)',
    urban: 'url(../../../../assets/urban.png)',
    waters_edge: 'url(../../../../assets/waters-edge.png)',
    default: 'url(../../../../assets/default.png)',
  };

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

  typeAccentColors: Record<string, string> = {
    grass: '#4CAF50',
    fire: '#E65100',
    water: '#1E88E5',
    electric: '#FBC02D',
    ice: '#4DD0E1',
    fighting: '#D32F2F',
    poison: '#8E24AA',
    ground: '#A1887F',
    flying: '#7986CB',
    psychic: '#D81B60',
    bug: '#689F38',
    rock: '#6D4C41',
    ghost: '#5D4037',
    dark: '#3E2723',
    dragon: '#512DA8',
    steel: '#90A4AE',
    fairy: '#F48FB1',
    normal: '#A1887F',
  };

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

  generations = [
    'generation-i',
    'generation-ii',
    'generation-iii',
    'generation-iv',
    'generation-v',
    'generation-vi',
    'generation-vii',
    'generation-viii',
    'generation-ix',
  ];

  ngOnDestroy(): void {
    window.speechSynthesis.onvoiceschanged = null;
  }

  ngOnInit(): void {
    this.renderer.removeClass(this.el.nativeElement, 'fade-out');
    this.loading = true;

    this.route.data.subscribe(({ pokemon, moves }) => {
      if (!pokemon) {
        this.error = 'Pokémon not found.';
        this.loading = false;
        return;
      }

      const isNewPokemon = !this.pokemon || this.pokemon.name !== pokemon.name;
      this.pokemon = pokemon;
      this.moves = moves;
      this.selectedVarietyIndex = 0; // start with base form

      if (pokemon.spriteGallery) {
        this.spriteGallery = pokemon.spriteGallery;
      }

      if (isNewPokemon) {
        this.setupPokemon();
      }

      this.loading = false;

      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    // Speech synthesis setup (unchanged)
    if ('speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.voices = window.speechSynthesis.getVoices();
      };
    }
  }
  // touchStartX = 0;
  // touchEndX = 0;

  // onTouchStart(event: TouchEvent) {
  //   this.touchStartX = event.changedTouches[0].screenX;
  // }

  // onTouchEnd(event: TouchEvent) {
  //   this.touchEndX = event.changedTouches[0].screenX;
  //   this.handleSwipe();
  // }

  // handleSwipe() {
  //   const deltaX = this.touchEndX - this.touchStartX;
  //   const swipeThreshold = 50; // Minimum swipe distance in px

  //   if (deltaX > swipeThreshold && this.prevPokemon) {
  //     this.goToPrevious();
  //   } else if (deltaX < -swipeThreshold && this.nextPokemon) {
  //     this.goToNext();
  //   }
  // }
  //  (touchstart)="onTouchStart($event)" add these in ARTICLE when i want
  // (touchend)="onTouchEnd($event)"

  /*
   * =========================
   *   NEXT PREVIOUS BUTTONS
   * =========================
   */
  padDexNumber(num?: number): string {
    return num !== undefined ? num.toString().padStart(4, '0') : '---';
  }

  updatePrevNext(): void {
    if (!this.pokemon || !this.pokedex.length) {
      this.prevPokemon = null;
      this.nextPokemon = null;
      this.showShiny = false;
      return;
    }
    const index = this.pokedex.findIndex(
      (p) => p.name.toLowerCase() === this.pokemon!.name.toLowerCase()
    );
    this.prevPokemon = this.pokedex[index - 1] ?? null;
    this.nextPokemon = this.pokedex[index + 1] ?? null;
  }

  goToPrevious(): void {
    if (this.prevPokemon) {
      this.selectedVarietyIndex = 0; // Reset form to base form
      this.router.navigate(['/pokemon', this.prevPokemon.name]).then(() => {
        this.showShiny = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  goToNext(): void {
    if (this.nextPokemon) {
      this.selectedVarietyIndex = 0; // Reset form to base form
      this.router.navigate(['/pokemon', this.nextPokemon.name]).then(() => {
        this.showShiny = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  private setupPokemon(): void {
    if (!this.pokemon) {
      return;
    }

    // Only fetch pokedex list if it's not already loaded
    if (this.pokedex.length > 0) {
      this.updatePrevNext();
      return;
    }

    this.dexService.getPokemonList().subscribe((list) => {
      this.pokedex = list;
      this.updatePrevNext();
    });
  }

  getPrimaryType(types: string[]): string {
    return types?.[0] ?? 'Unknown';
  }

  getSecondaryType(types: string[]): string {
    return types?.[1] ?? ''; // Optional: return 'None' or empty string
  }

  getTypeDisplay(types: string[]): string {
    return types.join(' / '); // e.g., "Grass / Poison"
  }

  // Example of filling spriteGallery (simplified):

  getSprites(dexnumber: number) {
    this.dexService.getSpritesByDexNumber(dexnumber).subscribe((sprite) => {
      this.spriteGallery = {};

      if (!sprite?.sprites) return;

      for (const genObj of sprite.sprites) {
        const generation = Object.keys(genObj)[0];
        const games = genObj[generation];

        // Take one game arbitrarily or pick a preferred game per gen
        const firstGameKey = Object.keys(games)[0];
        const spriteSet = games[firstGameKey];

        if (!this.spriteGallery[generation])
          this.spriteGallery[generation] = {};

        // Assume spriteSet has keys like front_default, front_shiny
        if (spriteSet.front_default) {
          this.spriteGallery[generation].normal = spriteSet.front_default;
        }
        if (spriteSet.front_shiny) {
          this.spriteGallery[generation].shiny = spriteSet.front_shiny;
        }
      }
    });
  }

  updateHeaderColor(pokemonName: string) {
    this.dexService.getPokemonByName(pokemonName).subscribe((pokemon) => {
      const type = pokemon.types[0]?.toLowerCase() || 'normal';
      const baseColor = this.typeColors[type] || '#aaaaaa';
      const accentColor = this.typeAccentColors[type] || '#60a5fa';

      const gradient = `linear-gradient(90deg, ${baseColor}, ${baseColor}CC)`;
      document.documentElement.style.setProperty('--header-color', gradient);
      document.documentElement.style.setProperty(
        '--header-border-color',
        accentColor
      );
      document.documentElement.style.setProperty('--logo-color', '#e0f2fe');

      // Update slider thumb color dynamically:
      this.updateSliderThumbColor(type);
    });
  }

  updateSliderThumbColor(type: string) {
    const accentColor = this.typeColors[type.toLowerCase()] || '#1e88e5';
    document.documentElement.style.setProperty(
      '--slider-thumb-color',
      accentColor
    );
  }

  // Returns a linear-gradient CSS string for slider track fill based on current volume and type
  getSliderStyle(type: string) {
    const gradient = this.getBackgroundGradient(type) || '#1e88e5';
    const percentage = this.volume * 100;

    // linear-gradient fills up to current volume, then gray
    return {
      background: `linear-gradient(to right, ${gradient} ${percentage}%, #ccc ${percentage}%)`,
    };
  }

  // Get knob color for slider thumb based on type
  getSliderThumbColor(type: string): string {
    return this.typeAccentColors[type.toLowerCase()] || '#1e88e5';
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getRegionGames(region: string): string {
    switch (region.toLowerCase()) {
      case 'national':
        return 'National Dex';

      case 'kanto':
        return '(Red/Blue/Yellow/FireRed/LeafGreen)';
      case 'letsgo-kanto':
        return "(Let's Go Pikachu / Let's Go Eevee)";
      case 'original-johto':
      case 'updated-johto':
        return '(Gold/Silver/Crystal/HeartGold/SoulSilver)';

      case 'hoenn':
        return '(Ruby/Sapphire/Emerald)';

      case 'updated-hoenn':
        return '(Omega Ruby/Alpha Sapphire)';

      case 'original-sinnoh':
        return '(Diamond/Pearl/Platinum)';

      case 'extended-sinnoh':
        return '(Brilliant Diamond/Shining Pearl)';

      case 'unova':
        return '(Black/White)';

      case 'updated-unova':
        return '(Black 2/White 2)';

      case 'kalos-central':
      case 'kalos-coastal':
      case 'kalos-mountain':
        return '(X/Y)';

      case 'original-alola':
      case 'original-melemele':
        return '(Sun/Moon)';

      case 'updated-alola':
      case 'updated-melemele':
        return '(Ultra Sun/Ultra Moon)';

      case 'galar':
        return '(Sword/Shield)';

      case 'isle-of-armor':
        return '(Sword/Shield: Isle of Armor)';

      case 'crown-tundra':
        return '(Sword/Shield: Crown Tundra)';

      case 'hisui':
        return '(Legends: Arceus)';

      case 'paldea':
        return '(Scarlet/Violet)';

      case 'kitakami':
        return '(Scarlet/Violet: Teal Mask)';

      case 'blueberry':
        return '(Scarlet/Violet: Indigo Disk)';

      case 'conquest-gallery':
        return '(Pokémon Conquest — Ransei)';

      default:
        return 'Unknown Region';
    }
  }

  showOtherNumbers(pokedex: string): boolean {
    return pokedex !== 'national';
  }

  readPokedexEntry(text: string | undefined) {
    if (!text) {
      return;
    }
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1; // Slightly faster to sound lively
      utterance.pitch = 1; // Lower pitch for robotic tone
      const selectedVoice =
        this.voices.find((v) => v.name.includes('Google US English')) ||
        this.voices[0];
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Sorry, your browser does not support speech synthesis.');
    }
  }

  playAudio() {
    const mon = this.selectedVariety ?? this.pokemon;
    if (!mon) return;

    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
      return;
    }

    let src = '';

    // Prefer official .ogg cry from PokeAPI if available
    if (mon.cries?.default) {
      src = mon.cries.default;
    } else {
      const name = mon.name.toLowerCase();

      // Handle special cases for Showdown .mp3 URLs
      if (name === 'mime-jr') {
        src = 'https://play.pokemonshowdown.com/audio/cries/mimejr.mp3';
      } else if (name === 'nidoran-f') {
        src = 'https://play.pokemonshowdown.com/audio/cries/nidoranf.mp3';
      } else if (name === 'nidoran-m') {
        src = 'https://play.pokemonshowdown.com/audio/cries/nidoranm.mp3';
      } else {
        src = `https://play.pokemonshowdown.com/audio/cries/${name}.mp3`;
      }
    }

    // Set up audio and play
    if (this.audio.src !== src) {
      this.audio.src = src;
      this.audio.load();
    }

    this.audio.volume = this.volume;

    this.audio
      .play()
      .then(() => {
        this.isPlaying = true;
      })
      .catch(() => {
        this.isPlaying = false;
      });

    this.audio.onended = () => {
      this.isPlaying = false;
    };
  }

  formatConditionName(name: string): string {
    if (!name) return '';
    return name.replace(/-/g, ' ');
  }

  isMobileScreen(): boolean {
    return window.innerWidth < 768; // or use a service for responsive detection
  }

  toggleMenu() {
    this.menuVisible = !this.menuVisible;
  }

  toggleShiny() {
    this.showShiny = !this.showShiny;
  }

  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  formatGrowthRate(name: string): string {
    return name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getDisplayName(name: string): string {
    if (!name) return '';

    // Normalize: lowercase → replace underscores with dashes → trim spaces
    let clean = name.toLowerCase().replace(/_/g, '-').trim();

    // Gendered forms
    if (clean.endsWith('-f')) {
      return this.capitalizeWords(clean.slice(0, -2).replace(/-/g, ' ')) + ' ♀';
    } else if (clean.endsWith('-m')) {
      return this.capitalizeWords(clean.slice(0, -2).replace(/-/g, ' ')) + ' ♂';
    }

    // General case: split on dashes/spaces and capitalize properly
    return this.capitalizeWords(clean.replace(/-/g, ' '));
  }

  private capitalizeWords(str: string): string {
    return (
      str
        .split(' ')
        .map(
          (w) => w.charAt(0).toUpperCase() + w.slice(1) // basic capitalization
        )
        .join(' ')
        // Special handling for Pokémon like Type: Null, Porygon-Z
        .replace(/\bNull\b/i, 'Null')
        .replace(/\bZ\b/i, 'Z')
    );
  }

  convertGenerationToNumber(generation: string): number | null {
    const generationMap: Record<string, number> = {
      'generation-i': 1,
      'generation-ii': 2,
      'generation-iii': 3,
      'generation-iv': 4,
      'generation-v': 5,
      'generation-vi': 6,
      'generation-vii': 7,
      'generation-viii': 8,
      'generation-ix': 9,
    };

    return generationMap[generation.toLowerCase()] ?? null;
  }

  getHabitatBackground(habitat: string | undefined): string {
    if (!habitat) return this.habitatBackgrounds['default'];

    const normalized = habitat.toLowerCase().replace(/-/g, '_');
    return (
      this.habitatBackgrounds[normalized] || this.habitatBackgrounds['default']
    );
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

  getTypeColor(type: string): string {
    return this.typeColors[type.toLowerCase()] || '#A8A878'; // fallback to normal type color
  }

  geteggGroupColor(egg: string): string {
    return this.eggGroupColors[egg.toLowerCase()];
  }

  getHeightInMeters(): string {
    return (this.selectedVariety?.height / 10).toFixed(1) + ' m';
  }

  getHeightFeetInches(): string {
    const heightInInches = this.selectedVariety?.height * 0.393701;
    const feet = Math.floor(heightInInches / 12);
    const inches = Math.round(heightInInches % 12);
    return `${feet}'${inches}"`;
  }

  getWeightInKg(): string {
    return (this.selectedVariety?.weight / 10).toFixed(1);
  }

  getWeightPounds(): string {
    const pounds = this.selectedVariety?.weight * 0.220462;
    return pounds.toFixed(1);
  }

  getEvYield(stats: any[]): string {
    return stats
      .filter((stat) => stat.effort > 0)
      .map((stat) => {
        const formattedName = stat.name
          .split('-') // Split at hyphens
          .map(
            (word: string) => word.charAt(0).toUpperCase() + word.slice(1) // Capitalize each part
          )
          .join(' '); // Join with spaces
        return `${stat.effort} ${formattedName}`;
      })
      .join(', ');
  }

  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getMaleRate(rate: number): string {
    return ((1 - rate / 8) * 100).toFixed(1);
  }

  getFemaleRate(rate: number): string {
    return ((rate / 8) * 100).toFixed(1);
  }

  getEggCycleDisplay(cycles: number): string {
    const minSteps = cycles * 255;
    const maxSteps = cycles * 257;
    return `${cycles} (${minSteps.toLocaleString()}–${maxSteps.toLocaleString()} steps)`;
  }

  getCatchRateDisplay(rate: number): string {
    const approximateCatchChance = (rate / 255) * 100;
    return `${rate} (${approximateCatchChance.toFixed(
      1
    )}% with PokéBall, full HP)`;
  }

  getBaseFriendshipDisplay(happiness: number): string {
    let label = 'normal';

    if (happiness >= 140) label = 'high';
    else if (happiness >= 70) label = 'above average';
    else if (happiness >= 35) label = 'normal';
    else if (happiness > 0) label = 'low';
    else if (happiness === 0) label = 'none';

    return `${happiness} (${label})`;
  }

  getGenderDifferenceDisplay(flag: boolean): string {
    return flag ? 'Yes' : 'No';
  }

  // Find image URL for a species from pokedex by name
  getPokemonImage(name: string): string {
    const found = this.pokedex.find(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );
    return found
      ? found.images['official_artwork-default']
      : 'assets/placeholder.png';
  }

  get allForms(): any[] {
    if (!this.pokemon) return [];

    const baseForm = {
      ...this.pokemon,
      form_name: this.getDisplayName(this.pokemon.name),
    };

    return this.pokemon.varieties?.length
      ? [baseForm, ...this.pokemon.varieties]
      : [baseForm];
  }

  get selectedVariety(): any {
    return this.allForms[this.selectedVarietyIndex] ?? this.allForms[0];
  }

  // Existing onVarietyChange method:
  onVarietyChange(index: number) {
    this.selectedVarietyIndex = index;
    this.loadMovesForSelectedVariety();

    const variety = this.selectedVariety;
    if (variety) {
      this.updateHeaderColorForVariety(variety);
    }
  }

  updateHeaderColorForVariety(variety: any) {
    if (!variety || !variety.types || variety.types.length === 0) {
      return;
    }
    // Use the primary type of the selected variety
    const type = variety.types[0].toLowerCase();

    const baseColor = this.typeColors[type] || '#aaaaaa';
    const accentColor = this.typeAccentColors[type] || '#60a5fa';

    const gradient = `linear-gradient(90deg, ${baseColor}, ${baseColor}CC)`;
    const shadow = accentColor + '66';

    document.documentElement.style.setProperty('--header-color', gradient);
    document.documentElement.style.setProperty(
      '--header-border-color',
      accentColor
    );
    document.documentElement.style.setProperty('--logo-color', '#ffffff');
    document.documentElement.style.setProperty('--nav-link-color', '#ffffff');
    document.documentElement.style.setProperty(
      '--nav-link-active-color',
      '#ffffff'
    );
    document.documentElement.style.setProperty(
      '--nav-link-active-bg',
      `linear-gradient(145deg, ${baseColor}, ${accentColor})`
    );
    document.documentElement.style.setProperty(
      '--nav-link-active-border',
      accentColor
    );
    document.documentElement.style.setProperty(
      '--nav-link-active-shadow',
      shadow
    );
    document.documentElement.style.setProperty(
      '--header-box-shadow',
      `0 4px 12px ${shadow}`
    );

    this.updateSliderThumbColor(type);
  }

  loadMovesForSelectedVariety() {
    if (!this.selectedVariety) return;
    this.loading = true;

    const formName = (
      this.selectedVariety.form_name || this.selectedVariety.name
    ).toLowerCase();

    this.movedata.getDetailedLearnset(formName).subscribe({
      next: (moves) => {
        this.moves = moves;
        this.loading = false;
      },
      error: () => {
        this.moves = [];
        this.loading = false;
      },
    });
  }

  get megaCount(): number {
    return this.pokemon?.varieties?.filter((v) => v.is_mega)?.length || 0;
  }

  get alternateForms(): string[] {
    if (!this.pokemon?.varieties) return [];
    return this.pokemon.varieties.map((v) => v.name);
  }

  get megaDescriptions(): string {
    if (!this.pokemon?.varieties) return '';

    const megaForms = this.pokemon.varieties.filter((v) => v.is_mega);
    if (megaForms.length === 0) return '';

    // Build descriptions like "Mega Charizard X the dragon/fire type"
    const descriptions = megaForms.map((v) => {
      const types = v.types.map((t) => t.toLowerCase()).join('/');
      return `${v.name} the ${types} type`;
    });

    if (descriptions.length === 1) {
      return descriptions[0];
    } else {
      // Join with commas and 'and' before last
      return (
        descriptions.slice(0, -1).join(', ') +
        ', and ' +
        descriptions[descriptions.length - 1]
      );
    }
  }

  get canGigantamax(): boolean {
    return (
      this.pokemon?.varieties?.some((v) =>
        v.name.toLowerCase().startsWith('gmax')
      ) || false
    );
  }

  get gigantamaxForms(): string {
    if (!this.pokemon?.varieties) return '';

    const gmaxForms = this.pokemon.varieties.filter((v) =>
      v.name.toLowerCase().startsWith('gmax')
    );

    if (gmaxForms.length === 0) return '';

    return gmaxForms.map((v) => v.name).join(' and ');
  }

  get megaEvolutionSentence(): string {
    if (!this.pokemon) return '';

    const name = this.getDisplayName(this.pokemon.name);

    if (this.megaCount === 0) {
      return '';
    }

    return `${name} has ${this.megaCount} Mega evolution${
      this.megaCount > 1 ? 's' : ''
    }, ${this.megaDescriptions}.`;
  }

  get gigantamaxSentence(): string {
    if (!this.pokemon || !this.canGigantamax) return '';

    const name = this.getDisplayName(this.pokemon.name);
    return `With the introduction of Gigantamaxing in Generation 8 sword/shield, ${name} can Gigantamax into ${this.gigantamaxForms}.`;
  }

  get regionalFormsSentence(): string {
    if (!this.pokemon) return '';

    // Filter regional forms from varieties (you'll need a way to identify them)
    // Example: Assume varieties with form_name containing region name, e.g. 'Alolan', 'Galarian', 'Hisuian'
    const regionalForms = this.pokemon.varieties.filter((v) =>
      /alolan|galarian|hisuian/i.test(v.name)
    );

    if (regionalForms.length === 0) return '';

    const name = this.getDisplayName(this.pokemon.name);

    const formNames = regionalForms
      .map((f) => this.getDisplayName(f.name))
      .join(', ');

    return `${name} has ${regionalForms.length} regional form${
      regionalForms.length > 1 ? 's' : ''
    }: ${formNames}.`;
  }

  goToPokemonDetails(name: string): void {
    this.router.navigate(['/pokemon', name]).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
