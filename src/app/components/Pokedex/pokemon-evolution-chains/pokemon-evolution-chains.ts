import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { FetchNationalDex } from '../../../services/fetch-national-dex';
import { Subscription } from 'rxjs';
import {
  faArrowUp,
  faArrowDown,
  faArrowLeft,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { Pokemon } from '../../../models/Pokemon/poke-details';
import { EvolutionChainNode } from '../../../models/Pokemon/poke-evolution';

@Component({
  selector: 'app-pokemon-evolution-chains',
  standalone: false,
  templateUrl: './pokemon-evolution-chains.html',
  styleUrl: './pokemon-evolution-chains.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonEvolutionChains implements OnChanges, OnDestroy {
  @Input() pokemon: Pokemon | null = null;
  @Input() pokedex: Pokemon[] = []; // Make sure this input is provided
  faArrowUp = faArrowUp;
  faArrowDown = faArrowDown;
  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;

  evolutionChainFlat: EvolutionChainNode[] = []; // for standard chains
  evolutionChainRoots: EvolutionChainNode[] = []; // for exception chains (split)

  error: string | null = null;
  private subscription: Subscription | null = null;
  exceptionalChainType: string = '';

  evolutionChainExceptions_11 = [
    7, // rattata
    11, // sandshrew
    15, // vulpix
    25, // growlithe
    32, // ponyta
    35, // farfetched
    38, // mukk
    96, // wooper
    106, // qwilfish
    109, // sneasel
    113, // corsola
    287, // yamask
    378, // yungoose
    22, // meowth
  ];
  evolutionChainExceptions_111 = [
    31, // geodude
    134, //zigzagoon
  ];
  evolutionChainExceptions_14 = [
    213, // burmy
  ];

  evolutionChainExceptions_15 = [
    442, // applin
  ];

  evolutionChainExceptions_112 = [
    10, // pichu
    18, // oddish
    26, // poliwag
    80, // cyndaquill
    140, // ralts
    413, //cosmog
    374, // rowlet
  ];
  evolutionChainExceptions_12 = [
    33, // slowpoke
    144, // nincada
    188, // clamperl
    58, // scyther
    383, // rockruf
    45, // exegute
    46, // cubone
    49, // koffing
    103, // dunsparce
    186, // snorunt
    279, // petilil
    280, // basculin
    348, // espurr
    366, // bergmite
    446, // toxel
    470, // kubfu
    481, // lechonk
    485, // tandemaus
    490, // charcadet
  ];
  evolutionChainExceptions_122 = [
    135, //wurmple
    57, // mr.mime
    362, // goomy
  ];
  evolutionChainExceptions_13 = [
    47, //tyrogue
  ];
  evolutionChainExceptions_18 = [
    67, //eevee
  ];
  evoution: any;

  constructor(
    private dexService: FetchNationalDex,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pokemon'] && this.pokemon) {
      this.loadEvolutionChain(this.pokemon.evolution_chain);
    } else if (!this.pokemon) {
      this.evolutionChainFlat = [];
      this.error = null;
    }
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  private loadEvolutionChain(chainId: number) {
    this.error = null;
    this.evolutionChainFlat = [];
    this.unsubscribe();

    this.subscription = this.dexService
      .getEvolutionChainById(chainId)
      .subscribe({
        next: (chain) => {
          if (chain?.chain?.length) {
            this.error = null;

            this.exceptionalChainType = '';
            const chainRoots = chain.chain;

            // Exception chains rendered using nested structure (don't flatten)
            if (this.evolutionChainExceptions_112.includes(chain.id)) {
              this.exceptionalChainType = '112';
              this.evolutionChainFlat = this.flattenChain(chain.chain);
            } else if (this.evolutionChainExceptions_12.includes(chain.id)) {
              this.exceptionalChainType = '12';
              this.evolutionChainRoots = chainRoots;
              this.evolutionChainFlat = []; // not used
            } else if (this.evolutionChainExceptions_11.includes(chain.id)) {
              this.exceptionalChainType = '11';
              this.evolutionChainRoots = chainRoots;
              this.evolutionChainFlat = []; // not used
            } else if (this.evolutionChainExceptions_111.includes(chain.id)) {
              this.exceptionalChainType = '111';
              this.evolutionChainRoots = chainRoots;
              this.evolutionChainFlat = []; // not used
            } else if (this.evolutionChainExceptions_122.includes(chain.id)) {
              this.exceptionalChainType = '122';
              this.evolutionChainRoots = chainRoots;
              this.evolutionChainFlat = []; // not used
            } else if (this.evolutionChainExceptions_13.includes(chain.id)) {
              this.exceptionalChainType = '13';
              this.evolutionChainRoots = chainRoots;
              this.evolutionChainFlat = []; // not used
            } else if (this.evolutionChainExceptions_14.includes(chain.id)) {
              this.exceptionalChainType = '14';
              this.evolutionChainRoots = chainRoots;
              this.evolutionChainFlat = []; // not used
            } else if (this.evolutionChainExceptions_15.includes(chain.id)) {
              this.exceptionalChainType = '15';
              this.evolutionChainRoots = chainRoots;
              this.evolutionChainFlat = []; // not used
            } else if (this.evolutionChainExceptions_18.includes(chain.id)) {
              this.exceptionalChainType = '18';
              this.evolutionChainRoots = chainRoots;
              this.evolutionChainFlat = []; // not used
            } else {
              // Normal linear chains
              this.evolutionChainFlat = this.flattenSingleChain(chainRoots[0]);
              this.evolutionChainRoots = []; // not used
            }
          } else {
            this.evolutionChainFlat = [];
            this.evolutionChainRoots = [];
            this.error = 'No evolution chain available.';
          }

          this.cdr.detectChanges();
        },
        error: (err) => {
          this.evolutionChainFlat = [];
          this.evolutionChainRoots = [];
          this.error = 'Failed to load evolution chain.';
          console.error(err);
          this.cdr.detectChanges();
        },
      });
  }

  private flattenChain(chainNodes: EvolutionChainNode[]): EvolutionChainNode[] {
    let result: EvolutionChainNode[] = [];
    for (const node of chainNodes) {
      result.push(node);
      if (node.evolves_to?.length) {
        result = result.concat(this.flattenChain(node.evolves_to));
      }
    }
    return result;
  }

  private flattenSingleChain(node: EvolutionChainNode): EvolutionChainNode[] {
    const result: EvolutionChainNode[] = [node];
    if (node.evolves_to?.length === 1) {
      return result.concat(this.flattenSingleChain(node.evolves_to[0]));
    }
    return result; // if no or multiple evolutions, stop
  }

  private unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }
}
