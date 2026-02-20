// src/app/builder/models/team.model.ts
import { PokemonTeam } from './pokemon-team';

export interface Team {
  id: number;
  name: string;
  pokemon: PokemonTeam[];
}
