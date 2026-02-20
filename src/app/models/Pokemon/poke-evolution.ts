export interface EvolutionDetail {
  trigger: string;
  min_level: number | null;
  item: string | null;
  held_item: string | null;
  known_move: string | null;
  known_move_type: string | null;
  location: string | null;
  min_affection: number | null;
  min_beauty: number | null;
  min_happiness: number | null;
  needs_overworld_rain: boolean;
  party_species: string | null;
  party_type: string | null;
  relative_physical_stats: number | null;
  time_of_day: string;
  trade_species: string | null;
  turn_upside_down: boolean;
  gender: number | null;
}

export interface EvolutionChain {
  id: number;
  chain: EvolutionChainNode[];
}

export interface EvolutionChainNode {
  species: string;
  evolution_details: EvolutionDetail[];
  evolves_to: EvolutionChainNode[];
  image: string;
  types: string[];
  is_default: boolean;
  is_form: boolean;
}
