export interface BattleItems {
  id: number;
  name: string;
  category: string;
  cost: number;
  fling_power: number | null;
  fling_effect: string | null;
  sprites: {
    default: string;
  };
  effect_entries: {
    effect: string;
    short_effect: string;
    language: string; // <-- Changed from object to string
  }[];
  flavor_text_entries: {
    flavor_text: string;
    language: string; // <-- Same here
    version?: string;
  }[];
}
