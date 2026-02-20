import { Component, OnInit } from '@angular/core';
import { FetchNationalDex } from '../../../services/fetch-national-dex';
import { ActivatedRoute } from '@angular/router';
import { Pokemon, Variety } from '../../../models/Pokemon/poke-details';
import { AllAbilities } from '../../../models/Pokemon/all-abilities';

@Component({
  selector: 'app-ability-info',
  standalone: false,
  templateUrl: './ability-info.html',
  styleUrl: './ability-info.css',
})
export class AbilityInfo implements OnInit {
  pokemon: (Pokemon | Variety)[] = [];
  ability: AllAbilities | null = null;
  loading = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private dex: FetchNationalDex) {}

  ngOnInit(): void {
    this.loading = true;

    this.route.data.subscribe({
      next: (data) => {
        this.ability = data['info'];
        const bases: Pokemon[] = data['pokemon'];

        this.dex.getPokeForms().subscribe((forms) => {
          // merge bases + forms and sort
          this.pokemon = this.mergeAndSort(bases, forms);
          this.loading = false;
        });
      },
      error: (err) => {
        this.error = err.message || 'Error loading data';
        this.loading = false;
      },
    });
  }

  private baseDex = new Map<string, number>();

  private getBaseKey(p: Pokemon | Variety): string {
    const v: any = p as any;
    const s = v?.species;
    if (typeof s === 'string' && s.trim()) return s.toLowerCase();
    if (s && typeof s === 'object' && s.name)
      return String(s.name).toLowerCase();
    return p.name.toLowerCase(); // base mon
  }

  private isForm(p: Pokemon | Variety): boolean {
    return this.getBaseKey(p) !== p.name.toLowerCase();
  }

  private mergeAndSort(
    bases: Pokemon[],
    forms: Variety[]
  ): (Pokemon | Variety)[] {
    // Map baseKey -> base dex number
    this.baseDex.clear();
    for (const b of bases) {
      this.baseDex.set(this.getBaseKey(b), b.dex_number);
    }

    // Keep original order index to preserve forms’ incoming order
    const original = [...bases, ...forms];
    const idx = new Map<any, number>();
    original.forEach((item, i) => idx.set(item, i));

    const merged = [...original];

    merged.sort((a, b) => {
      const ak = this.getBaseKey(a);
      const bk = this.getBaseKey(b);
      const ad =
        this.baseDex.get(ak) ?? a.dex_number ?? Number.MAX_SAFE_INTEGER;
      const bd =
        this.baseDex.get(bk) ?? b.dex_number ?? Number.MAX_SAFE_INTEGER;

      // 1) Sort by base dex number so all forms follow their base
      if (ad !== bd) return ad - bd;

      // 2) Base first, then forms
      const aForm = this.isForm(a);
      const bForm = this.isForm(b);
      if (aForm !== bForm) return aForm ? 1 : -1;

      // 3) Keep original order for multiple forms
      return (idx.get(a) ?? 0) - (idx.get(b) ?? 0);
    });

    return merged;
  }

  getPokemonWithThisAbility(): (Pokemon | Variety)[] {
    if (!this.pokemon.length) return [];

    return this.pokemon.filter((poke) =>
      poke.abilities.some((a) => a.name === this.ability?.name)
    );
  }

  getHiddenAbility(
    poke: Pokemon | Variety
  ): { name: string; is_hidden: boolean } | null {
    return poke.abilities.find((a) => a.is_hidden) || null;
  }

  getHiddenAbilityName(poke: Pokemon | Variety): string | null {
    const hidden = poke.abilities.find((a) => a.is_hidden);
    return hidden ? hidden.name : null;
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

  getPokemonRoute(poke: Pokemon | Variety): string {
    // Try to find the base Pokémon by species
    const basePokemon = this.pokemon.find(
      (p) => p.name === poke.species || p.species === poke.species
    );

    // If found, use its name; otherwise fallback to current poke.name
    const routeName = basePokemon?.name || poke.name || '';

    return routeName.toLowerCase().replace(/\s+/g, '-');
  }
  /**
  * OR 
  *onImgError(event: Event) {
  (event.target as HTMLImageElement).style.display = 'none';
}
  */
  onImgError(event: Event, poke: Pokemon | Variety) {
    const target = event.target as HTMLImageElement;
    target.src = poke.images['official_artwork-default'];
  }
}
