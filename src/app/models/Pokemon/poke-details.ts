import { LocationEncounter } from "./poke-locations";

export interface Pokemon {
  name: string;
  dex_number: number;
  types: string[];
  species: string;
  abilities: Ability[];
  height: number;
  weight: number;
  base_exp: number;
  stats: Stat[];
  images: Images;
  cries: Cries;
  location_area_encounters: LocationEncounter[];
  generation_introduced: string;
  genus: string;
  varieties: Variety[];
  flavor_texts_en: FlavorText[];
  habitat: string;
  color: string;
  shape: string;
  growth_rate: string;
  egg_groups: string[];
  evolves_from: string | null;
  evolution_chain: number;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  hatch_counter: number;
  has_gender_differences: boolean;
  pokedex_numbers: PokedexNumbers[];
}

export interface Ability {
  name: string;
  is_hidden: boolean;
}

export interface Stat {
  name: string;
  base_stat: number;
  effort: number;
}

export interface Images {
  'official_artwork-default': string;
  'official_artwork-shiny': string;
  'sprite-default': string;
  'sprite-shiny': string;
}

export interface Cries {
  default: string;
  legacy: string;
}

export interface Variety {
  name: string;
  form_id: number;
  dex_number: number;
  types: string[];
  abilities: Ability[];
  stats: Stat[];
  height: number;
  weight: number;
  base_exp: number;
  images: Images;
  cries: Cries;
  species: string;
  is_mega: boolean;
  egg_groups: string[];
}

export interface FlavorText {
  game: string;
  text: string;
}

export interface PokedexNumbers {
  pokedex: string;
  entry_number: number;
}