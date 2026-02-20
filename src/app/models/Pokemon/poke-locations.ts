import { NamedAPIResource } from './poke-name-url';

export interface LocationEncounter {
  location_area: string;
  version_details: VersionDetail[];
}

export interface VersionDetail {
  version: string;
  max_chance: number;
  encounter_details: EncounterDetail[];
}

export interface EncounterDetail {
  min_level: number;
  max_level: number;
  condition_values: NamedAPIResource[];
  chance: number;
  method: NamedAPIResource;
  location_area: string;
}

// important as a custom interface to combine encounters
export interface VersionEncounter {
  version: string;
  location_details: {
    location_area: string;
    max_chance: number;
    encounter_details: EncounterDetail[];
  }[];
}

export const versionOrder = [
  'red',
  'blue',
  'yellow',
  'gold',
  'silver',
  'crystal',
  'ruby',
  'sapphire',
  'emerald',
  'firered',
  'leafgreen',
  'diamond',
  'pearl',
  'platinum',
  'heartgold',
  'soulsilver',
  'black',
  'white',
  'black-2',
  'white-2',
  'x',
  'y',
  'omega-ruby',
  'alpha-sapphire',
  'sun',
  'moon',
  'ultra-sun',
  'ultra-moon',
  'lets-go-pikachu',
  'lets-go-eevee',
  'sword',
  'shield',
  'brilliant-diamond',
  'shining-pearl',
  'legends-arceus',
  'scarlet',
  'violet',
];
