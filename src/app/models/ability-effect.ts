export const ABILITY_EFFECTS: Record<string, { immuneTo?: string[]; resist?: string[] }> = {
  'lightning-rod': { immuneTo: ['electric'] },
  'volt-absorb': { immuneTo: ['electric'] },
  'motor-drive': { immuneTo: ['electric'] },
  'levitate': { immuneTo: ['ground'] },
  'sap-sipper': { immuneTo: ['grass'] },
  'flash-fire': { immuneTo: ['fire'] },
  'thick-fat': { resist: ['fire', 'ice'] },
  'heatproof': { resist: ['fire'] },
  'water-absorb': { immuneTo: ['water'] },
  'storm-drain': { immuneTo: ['water'] },
  'dry-skin': { immuneTo: ['water'] },
  'immunity': { immuneTo: ['poison'] },
  'wonder-guard': {}
};
