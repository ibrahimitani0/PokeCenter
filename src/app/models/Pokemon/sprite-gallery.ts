export interface SpriteGeneration {
  [generation: string]: {
    [game: string]: {
      front_default: string | null;
      front_shiny?: string | null;
      back_default?: string | null;
      back_shiny?: string | null;
      [key: string]: string | null | undefined;
    };
  };
}

export interface PokemonSprites {
  id: number;
  name: string;
  sprites: SpriteGeneration[];
}