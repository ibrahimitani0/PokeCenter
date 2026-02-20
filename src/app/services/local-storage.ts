import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Team } from '../models/team';
import { PokemonTeam, StatMap } from '../models/pokemon-team';
import { FetchNationalDex} from './fetch-national-dex';
import { firstValueFrom } from 'rxjs';
import { Pokemon } from '../models/Pokemon/poke-details';

const STORAGE_KEY = 'pokemon_teams_v2';

@Injectable({
  providedIn: 'root',
})
export class LocalStorage {
  private teamsSubject = new BehaviorSubject<Team[]>(this.load());
  teams$ = this.teamsSubject.asObservable();

  private activeIndexSubject = new BehaviorSubject<number>(0);
  activeIndex$ = this.activeIndexSubject.asObservable();

  constructor(private pokemonDexService: FetchNationalDex) {}

  private load(): Team[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      return JSON.parse(raw) as Team[];
    } catch {
      return [{ id: Date.now(), name: 'Team 1', pokemon: [] }];
    }
  }

  private persist() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(this.teamsSubject.getValue())
    );
  }

  get teams() {
    return this.teamsSubject.getValue();
  }

  setActive(index: number) {
    this.activeIndexSubject.next(index);
  }

  getActiveTeam() {
    const teams = this.teams;
    const idx = this.activeIndexSubject.value;
    return teams[idx] ?? null;
  }

  addTeam(name = `Team ${this.teams.length + 1}`) {
    const newTeam: Team = { id: Date.now(), name, pokemon: [] };
    this.teamsSubject.next([...this.teams, newTeam]);
    this.persist();
    this.setActive(this.teams.length - 1);
  }

  removeTeam(index: number) {
    const t = this.teams.slice();
    t.splice(index, 1);

    this.teamsSubject.next(t);
    this.persist();

    this.setActive(
      t.length ? Math.min(this.activeIndexSubject.value, t.length - 1) : 0
    );
  }

  renameTeam(index: number, name: string) {
    const t = this.teams.slice();
    if (!t[index]) return;
    t[index] = { ...t[index], name };
    this.teamsSubject.next(t);
    this.persist();
  }

  reorderTeams(previousIndex: number, currentIndex: number) {
    const arr = this.teams.slice();
    const [moved] = arr.splice(previousIndex, 1);
    arr.splice(currentIndex, 0, moved);
    this.teamsSubject.next(arr);
    this.persist();
  }

  // Pokemon operations on active team
  addPokemonToActive(mon: PokemonTeam) {
    const teams = this.teams.slice();
    const idx = this.activeIndexSubject.value;
    if (!teams[idx]) return;

    if (teams[idx].pokemon.length >= 6) {
      alert('Team already has 6 Pokémon, cannot add more.');
      return;
    }

    teams[idx] = { ...teams[idx], pokemon: [...teams[idx].pokemon, mon] };
    this.teamsSubject.next(teams);
    this.persist();
  }

  updatePokemonInActive(updated: PokemonTeam) {
    const teams = this.teams.slice();
    const idx = this.activeIndexSubject.value;
    const t = teams[idx];
    if (!t) return;
    const pi = t.pokemon.findIndex((p) => p.id === updated.id);
    if (pi === -1) return;
    t.pokemon[pi] = { ...updated };
    teams[idx] = { ...t };
    this.teamsSubject.next(teams);
    this.persist();
  }

  removePokemonFromActive(pokemonId: number) {
    const teams = this.teams.slice();
    const idx = this.activeIndexSubject.value;
    const t = teams[idx];
    if (!t) return;
    t.pokemon = t.pokemon.filter((p) => p.id !== pokemonId);
    teams[idx] = { ...t };
    this.teamsSubject.next(teams);
    this.persist();
  }

  reorderPokemonsInActive(previousIndex: number, currentIndex: number) {
    const teams = this.teams.slice();
    const idx = this.activeIndexSubject.value;
    const t = teams[idx];
    if (!t) return;
    const arr = t.pokemon.slice();
    const [moved] = arr.splice(previousIndex, 1);
    arr.splice(currentIndex, 0, moved);
    t.pokemon = arr;
    teams[idx] = { ...t };
    this.teamsSubject.next(teams);
    this.persist();
  }

  async importFromText(showdownText: string) {
    try {
      const teamBlocks = showdownText
        .split(/\n(?=#)/)
        .map((t) => t.trim())
        .filter(Boolean);

      const teams: Team[] = [];

      for (const block of teamBlocks) {
        const lines = block.split('\n').map((l) => l.trim());
        let teamName = 'Imported Team';

        if (lines[0].startsWith('#')) {
          teamName = lines[0].replace(/^#\s*/, '');
          lines.shift();
        }

        // split Pokémon blocks
        const monBlocks: string[][] = [];
        let currentMonLines: string[] = [];

        for (const line of lines) {
          if (!line) {
            if (currentMonLines.length) {
              monBlocks.push(currentMonLines);
              currentMonLines = [];
            }
          } else {
            currentMonLines.push(line);
          }
        }
        if (currentMonLines.length) monBlocks.push(currentMonLines);

        const pokemon = monBlocks
          .map((monLines) => this.parseShowdownPokemon(monLines))
          .filter(Boolean) as PokemonTeam[];

        // Fetch data for each Pokémon
        await Promise.all(
          pokemon.map(async (p) => {
            let dexEntry: Pokemon | undefined;

            // First try main Dex
            try {
              dexEntry = await firstValueFrom(
                this.pokemonDexService.getPokemonByName(p.name.toLowerCase())
              );
            } catch {}

            // If not found, check varieties (Alolan, Galarian, Hisuian, Mega)
            if (!dexEntry) {
              const varietyName = p.name
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '');
              const variety = await firstValueFrom(
                this.pokemonDexService.getPokeFormsByName(varietyName)
              );

              if (variety) {
                p.dex_number = variety.dex_number;
                p.types = variety.types;
                p.baseStats = variety.stats;
                p.image = p.isShiny
                  ? variety.images['sprite-shiny']
                  : variety.images['sprite-default'];
              } else {
                console.warn(`Pokémon not found: "${p.name}"`);
                p.dex_number = 0;
                p.types = [];
                p.baseStats = [];
                p.image = '';
              }

              return;
            }

            // If main Dex found, fill normally
            p.dex_number = dexEntry.dex_number;
            p.types = dexEntry.types;
            p.baseStats = dexEntry.stats;
            p.image = p.isShiny
              ? dexEntry.images['sprite-shiny']
              : dexEntry.images['sprite-default'];
          })
        );

        teams.push({
          id: Date.now() + Math.floor(Math.random() * 10000),
          name: teamName,
          pokemon,
        });
      }

      this.teamsSubject.next(teams);
      this.persist();
      this.setActive(0);
    } catch (e) {
      console.error('Import failed', e);
    }
  }

  private parseShowdownPokemon(lines: string[]): PokemonTeam | null {
    if (lines.length === 0) return null;

    const firstLine = lines[0];
    let nickname = '';
    let name = '';
    let ballType = 'Poké Ball'; // default ball
    let heldItem = ''; // default held item empty

    // Extract held item from '@' in first line (optional)
    const atMatch = firstLine.match(/@ (.+)$/);
    if (atMatch) {
      heldItem = atMatch[1].trim();
    }

    // Remove '@ ...' from first line for name parse
    const namePart = firstLine.replace(/@ .+$/, '').trim();

    // Check for nickname (Nick (Name)) format
    const nickParenMatch = namePart.match(/^(.+?) \((.+)\)$/);
    if (nickParenMatch) {
      nickname = nickParenMatch[1].trim();
      name = nickParenMatch[2].trim();
    } else {
      nickname = '';
      name = namePart;
    }

    // Default stats etc.
    let level = 50;
    let shiny = false;
    let ability = '';
    let nature = '';
    let gender = '—';
    let evs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    let ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
    const moves: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.toLowerCase().startsWith('ability:')) {
        ability = line.substring(8).trim();
      } else if (line.toLowerCase().startsWith('level:')) {
        const val = parseInt(line.substring(6).trim(), 10);
        if (!isNaN(val)) level = val;
      } else if (line.toLowerCase().startsWith('shiny:')) {
        const val = line.substring(6).trim().toLowerCase();
        shiny = val === 'yes' || val === 'true';
      } else if (line.toLowerCase().startsWith('nature:')) {
        nature = line.substring(7).trim();
      } else if (line.toLowerCase().startsWith('gender:')) {
        gender = line.substring(7).trim();
      } else if (line.toLowerCase().startsWith('evs:')) {
        evs = this.parseStatLine(line.substring(4).trim());
      } else if (line.toLowerCase().startsWith('ivs:')) {
        ivs = this.parseStatLine(line.substring(4).trim());
      } else if (line.toLowerCase().startsWith('item:')) {
        heldItem = line.substring(5).trim();
      } else if (line.toLowerCase().startsWith('ball:')) {
        ballType = line.substring(5).trim();
      } else if (line.startsWith('- ')) {
        const move = line.substring(2).trim();
        if (move.length > 0) {
          moves.push(move);
        } else {
          moves.push(''); // preserve empty move slot
        }
      }
    }

    while (moves.length < 4) {
      moves.push('');
    }

    return {
      id: Date.now() + Math.floor(Math.random() * 10000),
      dex_number: 0,
      name,
      nickname: nickname || name,
      level,
      gender,
      isShiny: shiny,
      ability,
      nature,
      heldItem,
      ballType,
      image: '',
      types: [],
      baseStats: [],
      evs,
      ivs,
      moves,
    };
  }

  private parseStatLine(statLine: string): StatMap {
    const stats: StatMap = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };

    const parts = statLine.split('/').map((p) => p.trim());

    parts.forEach((part) => {
      const match = part.match(/^(\d+)\s+(\w+)$/);
      if (!match) return;

      const [, valStr, statName] = match;
      const val = parseInt(valStr, 10);
      if (isNaN(val)) return;

      let key = statName.toLowerCase();
      if (key === 'spatk') key = 'spa';
      else if (key === 'spdef') key = 'spd';

      if (key in stats) {
        stats[key as keyof StatMap] = val;
      }
    });

    return stats;
  }

  exportAsShowdownText(): string {
    return this.teams
      .map((team) => {
        const monsText = team.pokemon
          .map((p) => {
            // nickname (name) @ heldItem (or no @ if none)
            const nickPart =
              p.nickname && p.nickname !== p.name
                ? `${p.nickname} (${p.name})`
                : p.name;
            const heldItemPart = p.heldItem ? ` @ ${p.heldItem}` : '';

            // Always output exactly 4 moves (fill empty with '- ')
            const movesLines = [];
            for (let i = 0; i < 4; i++) {
              if (p.moves && p.moves[i]) {
                movesLines.push(`- ${p.moves[i]}`);
              } else {
                movesLines.push(`- `);
              }
            }

            const lines = [
              `${nickPart}${heldItemPart}`,
              p.ability ? `Ability: ${p.ability}` : '',
              `Level: ${p.level}`,
              p.isShiny ? 'Shiny: Yes' : '',
              this.formatStatLine('EVs', p.evs),
              this.formatStatLine('IVs', p.ivs),
              p.nature ? `Nature: ${p.nature}` : '',
              p.gender && p.gender !== '—' ? `Gender: ${p.gender}` : '',
              p.ballType ? `Ball: ${p.ballType}` : '',
              ...movesLines,
            ].filter(Boolean);
            return lines.join('\n');
          })
          .join('\n\n');

        return `# ${team.name}\n${monsText}`;
      })
      .join('\n\n');
  }

  formatStatLine(label: string, stats: StatMap): string {
    const parts: string[] = [];
    const statKeys: (keyof StatMap)[] = [
      'hp',
      'atk',
      'def',
      'spa',
      'spd',
      'spe',
    ];

    for (const stat of statKeys) {
      if (stats[stat] && stats[stat] > 0) {
        parts.push(`${stats[stat]} ${stat}`);
      }
    }
    return parts.length ? `${label}: ${parts.join(' / ')}` : '';
  }
}
