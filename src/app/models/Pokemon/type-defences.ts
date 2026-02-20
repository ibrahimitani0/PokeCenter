export interface PokeTypes {
  damage_relations: DamageRelations;
  game_indices: GameIndex[];
  generation: Generation;
  id: number;
  move_damage_class: MoveDamageClass;
  moves: Move[];
  name: string;
  names: LocalizedName[];
  past_damage_relations: any[];
  pokemon: PokemonSlot[];
  description: string;
  effects: TypeEffectEntry[];
}

export interface DamageRelations {
  double_damage_from: DamageRelationEntry[];
  double_damage_to: DamageRelationEntry[];
  half_damage_from: DamageRelationEntry[];
  half_damage_to: DamageRelationEntry[];
  no_damage_from: DamageRelationEntry[];
  no_damage_to: DamageRelationEntry[];
}

export interface DamageRelationEntry {
  name: string;
}

export interface GameIndex {
  game_index: number;
  generation: Generation;
}

export interface Generation {
  name: string;
}

export interface Move {
  name: string;
}

export interface MoveDamageClass {
  name: string;
}

export interface LocalizedName {
  languages: Language;
  name: string;
}
export interface Language {
  name: string;
}

export interface PokemonSlot {
  pokemon: PokemonReference;
  slot: number;
}

export interface PokemonReference {
  name: string;
}

export interface TypeEffectEntry {
  effect: string;
  category: string;
}
