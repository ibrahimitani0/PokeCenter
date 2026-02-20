import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './components/home/home';
import { NationalDex } from './components/Pokedex/national-dex/national-dex';
import { PokemonResolver } from './resolvers/pokemon-resolver';
import { PokemonDetails } from './components/Pokedex/pokemon-details/pokemon-details';
import { PokemonDetailResolver } from './resolvers/pokemon-details-resolver';
import { MovesResolver } from './resolvers/moves-resolver';
import { MiniGame } from './components/mini-game/mini-game';
import { GuideLandingPage } from './components/guides/guide-landing-page/guide-landing-page';
import { GuidesResolver } from './resolvers/guides-resolver-resolver';
import { AbilityInfo } from './components/guides/ability-info/ability-info';
import { AbilityResolver } from './resolvers/abilitiy-resolver';
import { EggGroupInfo } from './components/guides/egg-group-info/egg-group-info';
import { EggGroupsResolver } from './resolvers/egg-group-resolver';
import { TypeInfo } from './components/guides/type-info/type-info';
import { typeResolver } from './resolvers/type-resolver';
import { PokedexTracker } from './components/trainer-tools/pokedex-tracker/pokedex-tracker';
import { MoveInfo } from './components/guides/move-info/move-info';
import { MoveDetailResolver } from './resolvers/move-detials-resolver';
import { Builder } from './components/trainer-tools/team-builder/builder/builder';
import { ItemInfo } from './components/guides/item-info/item-info';
import { ItemResolver } from './resolvers/item-resolver';
import { ComparePoke } from './components/trainer-tools/compare-poke/compare-poke';
import { EvsInfo } from './components/guides/evs-info/evs-info';
import { PokeMasterListResolver } from './resolvers/poke-master-list-resolver';
import { EvTrainingTool } from './components/trainer-tools/ev-training-tool/ev-training-tool';

const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'pokedex',
    component: NationalDex,
    resolve: { pokedex: PokemonResolver },
  },
  {
    path: 'pokemon/:name',
    component: PokemonDetails,
    resolve: { pokemon: PokemonDetailResolver, moves: MovesResolver },
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'pokedex-tracker',
    component: PokedexTracker,
    resolve: { pokedex: PokemonResolver },
  },
  {
    path: 'team-builder',
    component: Builder,
    resolve: { pokemon: PokemonResolver, moves: MovesResolver },
  },
  { path: 'compare-pokemon', component: ComparePoke },
  {
    path: 'ev-tracker',
    component: EvTrainingTool,
    resolve: { PokeMasterListResolver },
  },
  {
    path: 'type/:name',
    component: TypeInfo,
    resolve: {
      info: typeResolver,
      pokemon: PokemonResolver,
      moves: MovesResolver,
    },
  },
  {
    path: 'ability/:name',
    component: AbilityInfo,
    resolve: { info: AbilityResolver, pokemon: PokemonResolver },
  },
  {
    path: 'egg-group/:name',
    component: EggGroupInfo,
    resolve: { info: EggGroupsResolver, pokemon: PokemonResolver },
  },
  {
    path: 'move/:name',
    component: MoveInfo,
    resolve: { move: MoveDetailResolver, learnset: MovesResolver },
  },
  {
    path: 'item/:name',
    component: ItemInfo,
    resolve: { item: ItemResolver },
  },
  {
    path: 'evs/:stat',
    component: EvsInfo,
    resolve: { pokemon: PokeMasterListResolver },
  },
  {
    path: 'guides',
    redirectTo: 'guides/training',
    pathMatch: 'full',
  },
  {
    path: 'guides/:mode',
    component: GuideLandingPage,
    resolve: { guidesData: GuidesResolver },
    runGuardsAndResolvers: 'paramsChange', // reload resolver when :mode param changes
  },
  {
    path: 'miniGame',
    component: MiniGame,
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload',
      scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
