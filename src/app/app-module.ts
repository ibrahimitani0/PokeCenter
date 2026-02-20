import {
  NgModule,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Home } from './components/home/home';
import { NationalDex } from './components/Pokedex/national-dex/national-dex';
import { PokemonDetails } from './components/Pokedex/pokemon-details/pokemon-details';
import { HttpClientModule } from '@angular/common/http';
import { LeadingZeroPipe } from './leading-zero-pipe';
import { CapitalizeFirstLetterPipe } from './capitalize-first-letter-pipe';
import { TypeDefenses } from './components/type-defenses/type-defenses/type-defenses';
import { FormsModule } from '@angular/forms';
import { PokemonEvolutionChains } from './components/Pokedex/pokemon-evolution-chains/pokemon-evolution-chains';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PokeLocEncounters } from './components/Pokedex/poke-loc-encounters/poke-loc-encounters';
import { PokemonStats } from './components/Pokedex/pokemon-stats/pokemon-stats';
import { PokemonMoves } from './components/Pokedex/pokemon-moves/pokemon-moves';
import { PokemonEntries } from './components/Pokedex/pokemon-entries/pokemon-entries';
import { MiniGame } from './components/mini-game/mini-game';
import { GuideLandingPage } from './components/guides/guide-landing-page/guide-landing-page';
import { AbilityInfo } from './components/guides/ability-info/ability-info';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EggGroupInfo } from './components/guides/egg-group-info/egg-group-info';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { MoveInfo } from './components/guides/move-info/move-info';
import { TypeInfo } from './components/guides/type-info/type-info';
import { PokedexTracker } from './components/trainer-tools/pokedex-tracker/pokedex-tracker';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Builder } from './components/trainer-tools/team-builder/builder/builder';
import { TeamManager } from './components/trainer-tools/team-builder/team-manager/team-manager';
import { PokemonList } from './components/trainer-tools/team-builder/pokemon-list/pokemon-list';
import { PokemonEditor } from './components/trainer-tools/team-builder/pokemon-editor/pokemon-editor';
import { PokemonSearch } from './components/trainer-tools/team-builder/pokemon-search/pokemon-search';
import { ItemInfo } from './components/guides/item-info/item-info';
import { TeamWeaknesses } from './components/trainer-tools/team-builder/team-weaknesses/team-weaknesses';
import { ComparePoke } from './components/trainer-tools/compare-poke/compare-poke';
import { EvsInfo } from './components/guides/evs-info/evs-info';
import { EvTrainingTool } from './components/trainer-tools/ev-training-tool/ev-training-tool';


@NgModule({
  declarations: [
    App,
    Header,
    Footer,
    Home,
    NationalDex,
    PokemonDetails,
    CapitalizeFirstLetterPipe,
    TypeDefenses,
    PokemonEvolutionChains,
    PokeLocEncounters,
    PokemonStats,
    PokemonMoves,
    PokemonEntries,
    MiniGame,
    GuideLandingPage,
    AbilityInfo,
    EggGroupInfo,
    MoveInfo,
    TypeInfo,
    PokedexTracker,
    Builder,
    TeamManager,
    PokemonList,
    PokemonEditor,
    PokemonSearch,
    ItemInfo,
    TeamWeaknesses,
    ComparePoke,
    EvsInfo,
    EvTrainingTool
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FontAwesomeModule,
    FormsModule,
    BrowserAnimationsModule,
    LeadingZeroPipe,
    DragDropModule,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch()),
  ],
  bootstrap: [App],
})
export class AppModule {}
