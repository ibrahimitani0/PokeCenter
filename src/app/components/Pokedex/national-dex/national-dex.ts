import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Pokemon } from '../../../models/Pokemon/poke-details';

@Component({
  selector: 'app-national-dex',
  standalone: false,
  templateUrl: './national-dex.html',
  styleUrl: './national-dex.css',
})
export class NationalDex {
  pokedex: Pokemon[] = [];
  visibleCount = 15;
  infiniteScrollEnabled = false;
  menuVisible = true;

  searchQuery: string = '';
  selectedType: string = '';

  pokemonTypes: string[] = [
    'Normal',
    'Fire',
    'Water',
    'Grass',
    'Electric',
    'Ice',
    'Fighting',
    'Poison',
    'Ground',
    'Flying',
    'Psychic',
    'Bug',
    'Rock',
    'Ghost',
    'Dragon',
    'Dark',
    'Steel',
    'Fairy',
  ];

  selectedGeneration: string = '';
  generationDropdownOpen = false;


  pokemonGenerations: { label: string; value: string }[] = [
    { label: 'Generation 1', value: 'generation-i' },
    { label: 'Generation 2', value: 'generation-ii' },
    { label: 'Generation 3', value: 'generation-iii' },
    { label: 'Generation 4', value: 'generation-iv' },
    { label: 'Generation 5', value: 'generation-v' },
    { label: 'Generation 6', value: 'generation-vi' },
    { label: 'Generation 7', value: 'generation-vii' },
    { label: 'Generation 8', value: 'generation-viii' },
    { label: 'Generation 9', value: 'generation-ix' },
  ];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.data.subscribe((data) => {
      this.pokedex = data['pokedex'];
    });
  }

  typeDropdownOpen = false;

  toggleDropdown() {
    this.typeDropdownOpen = !this.typeDropdownOpen;
  }

 closeDropdown() {
  this.typeDropdownOpen = false;
  this.generationDropdownOpen = false;
}

getSelectedGenerationLabel(): string {
  const found = this.pokemonGenerations.find(
    (g) => g.value === this.selectedGeneration
  );
  return found ? found.label : 'Gen Filter';
}


  selectType(type: string) {
    this.selectedType = type;
    this.closeDropdown();
  }

  get filteredPokedex() {
    return this.pokedex.filter((pokemon) => {
      const matchesType =
        !this.selectedType || pokemon.types.includes(this.selectedType);

      const query = this.searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        pokemon.name.toLowerCase().includes(query) ||
        pokemon.dex_number.toString().includes(query);

      const matchesGeneration =
        !this.selectedGeneration ||
        pokemon.generation_introduced === this.selectedGeneration;

      return matchesType && matchesSearch && matchesGeneration;
    });
  }
  

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleMenu() {
    this.menuVisible = !this.menuVisible;
  }
  getDisplayName(name: string): string {
    if (name.endsWith('-f')) {
      return name.slice(0, -2) + ' ♀';
    } else if (name.endsWith('-m')) {
      return name.slice(0, -2) + ' ♂';
    }
    return name;
  }

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

  BodyColors: Record<string, string> = {
    grass: '#4E8234', // darker, leaf green
    fire: '#F15627', // bright orange-red
    water: '#3B9AE1', // vibrant blue
    electric: '#F9D030', // bright yellow
    ice: '#74CEC0', // pale cyan
    fighting: '#82351D', // brownish red
    poison: '#6E2E8E', // deep purple
    ground: '#D97732', // earthy brown-orange
    flying: '#A98FF3', // pastel purple
    psychic: '#F95587', // hot pink
    bug: '#A7B723', // olive green
    rock: '#B69E31', // mustard yellow
    ghost: '#70559B', // muted purple
    dark: '#5A5847', // dark grey-brown
    dragon: '#7038F8', // strong purple
    steel: '#B7B9D0', // silver-grey
    fairy: '#E69EAC', // soft pink
    normal: '#A4ACAF', // muted grey
  };

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

  getHabitatBackground(habitat: string | undefined): string {
    if (!habitat) return this.habitatBackgrounds['default'];

    const normalized = habitat.toLowerCase().replace(/-/g, '_');
    return (
      this.habitatBackgrounds[normalized] || this.habitatBackgrounds['default']
    );
  }

  getTypeColor(type: string): string {
    return this.typeColors[type.toLowerCase()] || '#A8A878'; // fallback to normal type color
  }

  getBodyColor(type: string): string {
    const baseColor = this.getTypeColor(type);
    return `linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1)), ${baseColor}`;
  }

  loadMore(): void {
    this.visibleCount += 15;
    if (!this.infiniteScrollEnabled) {
      this.infiniteScrollEnabled = true;
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.infiniteScrollEnabled) return;

    const threshold = 300; // px from bottom to trigger load
    const position = window.innerHeight + window.scrollY;
    const height = document.documentElement.scrollHeight;

    if (
      position > height - threshold &&
      this.visibleCount < this.pokedex.length
    ) {
      this.loadMore();
    }
  }

  goToDetails(pokemonName: string) {
    this.router.navigate(['/pokemon', pokemonName]);
  }
}
