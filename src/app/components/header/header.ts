import {
  Component,
  OnInit,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { FetchNationalDex } from '../../services/fetch-national-dex';
import { Theme } from '../../services/theme';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  @ViewChild('searchForm') searchForm!: ElementRef;

  menuOpen = false;
  isDarkTheme = false;
  searchQuery = '';
  pokemonEntries: { name: string; display: string }[] = [];
  suggestions: { name: string; display: string }[] = [];

  // Pokémon type colors
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

  constructor(
    private themeService: Theme,
    private dexService: FetchNationalDex,
    private router: Router
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInsideSearch = this.searchForm.nativeElement.contains(
      event.target
    );
    if (!clickedInsideSearch) {
      this.suggestions = [];
    }
  }

  ngOnInit() {
    this.isDarkTheme = this.themeService.isDark();

    this.dexService.getPokemonList().subscribe((pokedex) => {
      this.pokemonEntries = pokedex.map((p) => ({
        name: p.name.toLowerCase(), // identifier for routing
        display: this.getDisplayName(p.species || p.name), // pretty for UI
      }));
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const url = this.router.url;
        const match = url.match(/^\/pokemon\/([\w-]+)/);
        if (match) {
          this.updateHeaderColor(match[1]); // Pokémon page
        } else {
          this.resetHeaderColor(); // Default blue gradient
        }
      });

    // Same logic when user refreshes directly on a Pokémon route
    const initialMatch = this.router.url.match(/^\/pokemon\/([\w-]+)/);
    if (initialMatch) {
      this.updateHeaderColor(initialMatch[1]);
    } else {
      this.resetHeaderColor();
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

  resetHeaderColor() {
    this.isDarkTheme = this.themeService.isDark();

    const lightGradient = `linear-gradient(90deg, rgba(59,76,202,0.85), rgba(90,110,247,0.85), rgba(42,59,176,0.85))`;
    const darkGradient = `linear-gradient(90deg, rgba(30,30,47,0.88), rgba(44,44,73,0.88), rgba(20,20,40,0.88))`;

    const borderLight = '#ffcb05';
    const borderDark = '#a58d00';
    const shadowLight = 'rgba(90, 110, 247, 0.4)';
    const shadowDark = 'rgba(44, 44, 73, 0.6)';

    document.documentElement.style.setProperty(
      '--header-color',
      this.isDarkTheme ? darkGradient : lightGradient
    );
    document.documentElement.style.setProperty(
      '--header-border-color',
      this.isDarkTheme ? borderDark : borderLight
    );
    document.documentElement.style.setProperty(
      '--header-box-shadow',
      `0 4px 12px ${this.isDarkTheme ? shadowDark : shadowLight}`
    );
    document.documentElement.style.setProperty('--logo-color', '#ffffff');
    document.documentElement.style.setProperty('--nav-link-color', '#ffffff');
    document.documentElement.style.setProperty(
      '--nav-link-active-color',
      '#ffffff'
    );
    document.documentElement.style.setProperty(
      '--nav-link-active-bg',
      this.isDarkTheme
        ? 'linear-gradient(145deg, #2c2c49, #3b3b66)'
        : 'linear-gradient(145deg, #3b4cca, #5a6ef7)'
    );
    document.documentElement.style.setProperty(
      '--nav-link-active-border',
      this.isDarkTheme ? '#bda900' : '#5a6ef7'
    );
    document.documentElement.style.setProperty(
      '--nav-link-active-shadow',
      this.isDarkTheme ? 'rgba(189, 169, 0, 0.5)' : 'rgba(90,110,247,0.6)'
    );
  }

  updateHeaderColor(pokemonName: string) {
    this.dexService.getPokemonByName(pokemonName).subscribe((pokemon) => {
      const type = pokemon.types[0]?.toLowerCase() || 'normal';
      const baseColor = this.typeColors[type] || '#aaaaaa';
      const accentColor = this.typeAccentColors[type] || '#60a5fa';

      const gradient = `linear-gradient(90deg, ${baseColor}E0, ${accentColor}E0)`; // translucent
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
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkTheme = this.themeService.isDark();

    // Only reset gradient if NOT on a Pokémon detail page
    const match = this.router.url.match(/^\/pokemon\/([\w-]+)/);
    if (!match) {
      this.resetHeaderColor();
    } else {
      this.updateHeaderColor(match[1]); // reapply Pokémon gradient for new theme
    }
  }

  onInputFocus() {
    if (this.searchQuery.trim()) {
      this.onSearchChange();
    }
  }

  onSearchChange() {
    const query = this.searchQuery.toLowerCase();
    this.suggestions = this.pokemonEntries
      .filter((p) => p.display.toLowerCase().includes(query))
      .slice(0, 10);
  }

  onSelectSuggestion(pokemon: { name: string; display: string }) {
    this.searchQuery = '';
    this.suggestions = [];
    this.router.navigate(['/pokemon', pokemon.name]); // always use identifier
    this.menuOpen = false;
  }

  onSearchSubmit() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/pokemon', this.searchQuery.trim().toLowerCase()]);
      this.searchQuery = '';
      this.suggestions = [];
      this.menuOpen = false;
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
