import { NamedAPIResource } from "./poke-name-url";

export interface AllAbilities {
  id: number;
  name: string;
  is_main_series: boolean;
  names: LocalizedName[];
  generation: NamedAPIResource;
  effect_entries: EffectEntry[];
  flavor_text_entries: FlavorTextEntry[];
  effect_changes: EffectChange[];
  pokemon: pokemonWithAbility[];
}

export interface LocalizedName {
  name: string;
  language: NamedAPIResource;
}

export interface EffectEntry {
  effect: string;
  short_effect: string;
  language: NamedAPIResource;
}

export interface FlavorTextEntry {
  flavor_text: string;
  language: NamedAPIResource;
  version_group: NamedAPIResource;
}

export interface EffectChange {
  version_group: NamedAPIResource;
  effect_entries: EffectEntry[];
}

export interface pokemonWithAbility {
  is_hidden: boolean;
  pokemon: {
    name: string;
    url: string;
  };
  slot: number;
}
