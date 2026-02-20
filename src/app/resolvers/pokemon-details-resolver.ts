import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { FetchNationalDex} from '../services/fetch-national-dex';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import { Pokemon } from '../models/Pokemon/poke-details';

@Injectable({ providedIn: 'root' })
export class PokemonDetailResolver implements Resolve<Pokemon | null> {
  constructor(private fetchNationalDex: FetchNationalDex, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Pokemon | null> {
    const name = route.paramMap.get('name');
    if (!name) {
      this.router.navigate(['/pokedex']);
      return of(null);
    }

    return this.fetchNationalDex.getPokemonByName(name).pipe(
      switchMap((pokemon) => {
        if (!pokemon?.dex_number) return of(pokemon); // fallback if somehow missing

        return this.fetchNationalDex.getSpritesByDexNumber(pokemon.dex_number).pipe(
          map((sprites) => ({
            ...pokemon,
            spriteGallery: this.transformSprites(sprites)
          }))
        );
      }),
      catchError((err) => {
        console.error(`Error loading Pokémon "${name}"`, err);
        this.router.navigate(['/pokedex']);
        return of(null);
      })
    );
  }

  private transformSprites(spriteData: any): {
    [generation: string]: { normal?: string; shiny?: string };
  } {
    const spriteGallery: { [generation: string]: { normal?: string; shiny?: string } } = {};

    if (!spriteData?.sprites) return spriteGallery;

    for (const genObj of spriteData.sprites) {
      const generation = Object.keys(genObj)[0];
      const games = genObj[generation];
      const firstGameKey = Object.keys(games)[0];
      const spriteSet = games[firstGameKey];

      if (!spriteGallery[generation]) spriteGallery[generation] = {};

      if (spriteSet.front_default) {
        spriteGallery[generation].normal = spriteSet.front_default;
      }
      if (spriteSet.front_shiny) {
        spriteGallery[generation].shiny = spriteSet.front_shiny;
      }
    }

    return spriteGallery;
  }
}
