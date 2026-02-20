import { Stat } from "./Pokemon/poke-details";

export interface StatMap {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}
export interface PokemonTeam {
  id: number;
  dex_number: number;
  name: string;
  nickname: string;
  level: number;
  gender: string;
  isShiny: boolean;
  ability: string;
  nature: string;
  heldItem: string;
  ballType: string;
  image: string;
  types: string[];
  baseStats: Stat[];
  evs: StatMap;
  ivs: StatMap;
  moves: string[];
}
