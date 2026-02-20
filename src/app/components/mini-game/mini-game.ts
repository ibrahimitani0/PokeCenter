import { Component, NgZone } from '@angular/core';
import { FetchNationalDex } from '../../services/fetch-national-dex';
import { ChangeDetectorRef } from '@angular/core';
import { Pokemon } from '../../models/Pokemon/poke-details';

type BallType = 'pokeball' | 'greatball' | 'ultraball' | 'masterball';
type ItemType = BallType | 'berries';

@Component({
  selector: 'app-mini-game',
  standalone: false,
  templateUrl: './mini-game.html',
  styleUrl: './mini-game.css',
})
export class MiniGame {
  currentPokemon: Pokemon | null = null;
  caughtPokemon: Set<number> = new Set();
  throwInProgress = false;
  message = '';
  failCount = 0;
  pokeballAnimation = false;
  usedBerry = false;
  showPokemonAfterThrow = true;
  shakeBallVisible = false;
  showSparkle = false;

  bag = {
    pokeball: Infinity,
    greatball: 0,
    ultraball: 0,
    masterball: 0,
    berries: 0,
  };

  showPokedexView = false;
  showBagView = false;
  allPokemonList: Pokemon[] = [];

  dataLoaded = false; // <-- NEW flag to control rendering

  private berryCatchBoost = 1.5;

  constructor(
    private fetchDex: FetchNationalDex,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCaughtFromStorage();

    this.fetchDex.getPokemonList().subscribe((pokedex) => {
      this.allPokemonList = pokedex;
      this.spawnRandomPokemon();

      this.dataLoaded = true; // Set flag true after data is ready
      this.cdr.detectChanges(); // Trigger change detection for UI update
    });
  }

  spawnRandomPokemon() {
    if (this.throwInProgress) return;

    this.fetchDex.getPokemonList().subscribe((pokedex) => {
      const random = Math.floor(Math.random() * pokedex.length);
      this.currentPokemon = pokedex[random];
      this.failCount = 0;
      this.message = `A wild ${this.currentPokemon.name} appeared!`;
      this.usedBerry = false;
      this.pokeballAnimation = false;
      this.showPokemonAfterThrow = true;
      this.cdr.detectChanges();

      // ✅ Play cry after appearance
      this.playCry(this.currentPokemon.cries.default);
    });
  }

  throwBall(type: BallType) {
    if (!this.currentPokemon || this.throwInProgress) return;

    if (this.bag[type] <= 0 && type !== 'pokeball') {
      this.message = `You don't have any ${type}s left!`;
      return;
    }

    if (type !== 'pokeball' && this.bag[type] !== Infinity) {
      this.bag[type]--;
    }

    this.pokeballAnimation = true;
    this.shakeBallVisible = false; // hide shaking ball
    this.showPokemonAfterThrow = false;
    this.message = `Throwing ${type}...`;

    this.catchSequence(type);
  }

  async catchSequence(type: BallType) {
    await this.delay(1000); // Wait for throw animation to finish
    this.shakeBallVisible = true; // Show shaking ball on ground
    this.cdr.detectChanges();
    await this.delay(300); // Optional delay before shaking starts

    this.zone.run(async () => {
      const caught = this.tryCatch(this.currentPokemon!, type);
      const shakes = Math.min(this.failCount + 1, 3);

      for (let i = 0; i < shakes; i++) {
        this.message = `Shake ${i + 1}...`;
        this.cdr.detectChanges(); // Trigger UI update
        await this.delay(1200);
      }

      this.message = caught
        ? `${this.currentPokemon?.name} was caught!`
        : `${this.currentPokemon?.name} broke free!`;

      this.pokeballAnimation = false;
      this.shakeBallVisible = false; // Hide shaking ball after shakes end
      this.cdr.detectChanges(); // Update UI again

      if (caught) {
        this.playCry(this.currentPokemon!.cries.default);
        this.caughtPokemon.add(this.currentPokemon!.dex_number);
        this.showSparkle = true;
        this.cdr.detectChanges();
        await this.delay(1500);
        this.saveCaughtToStorage();
        this.rewardPlayer();
        await this.delay(1500);
        this.showSparkle = false;
        this.throwInProgress = false;
        this.spawnRandomPokemon();
        this.cdr.detectChanges();
      } else {
        this.failCount++;
        this.throwInProgress = false;

        // ✅ Play cry when breaking out of Pokéball
        this.playCry(this.currentPokemon!.cries.default);

        if (this.failCount >= 3) {
          this.message = `${this.currentPokemon?.name} fled!`;
          this.cdr.detectChanges();
          await this.delay(1200);
          this.spawnRandomPokemon();
          this.cdr.detectChanges();
        } else {
          this.message += ' Try again!';
          this.showPokemonAfterThrow = true;
          this.cdr.detectChanges();
        }
      }
    });
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  tryCatch(pokemon: Pokemon, ball: BallType): boolean {
    const baseRate = pokemon.capture_rate || 0;
    let modifier = 1;

    switch (ball) {
      case 'pokeball':
        modifier = 1;
        break;
      case 'greatball':
        modifier = 1.5;
        break;
      case 'ultraball':
        modifier = 2;
        break;
      case 'masterball':
        return true;
    }

    if (this.usedBerry) {
      modifier *= this.berryCatchBoost;
      this.usedBerry = false;
    }

    const chance = Math.min((baseRate / 255) * modifier, 1);
    return Math.random() < chance;
  }

  rewardPlayer() {
    const rewards = ['greatball', 'ultraball', 'berries'] as const;
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    this.bag[reward]++;

    if (this.caughtPokemon.size % 10 === 0 && Math.random() < 0.5) {
      this.bag.masterball++;
      this.message += ' You found a Master Ball!';
    }
  }

  saveCaughtToStorage() {
    localStorage.setItem(
      'caughtPokemon',
      JSON.stringify(Array.from(this.caughtPokemon))
    );
    localStorage.setItem('bag', JSON.stringify(this.bag));
  }

  loadCaughtFromStorage() {
    const saved = localStorage.getItem('caughtPokemon');
    if (saved) this.caughtPokemon = new Set(JSON.parse(saved));

    const savedBag = localStorage.getItem('bag');
    if (savedBag) this.bag = { ...this.bag, ...JSON.parse(savedBag) };

    this.cdr.detectChanges(); // force UI update after loading
  }

  togglePokedex() {
    this.showPokedexView = !this.showPokedexView;
    this.showBagView = false;
  }

  toggleBag() {
    this.showBagView = !this.showBagView;
    this.showPokedexView = false;
  }

  useBerry() {
    if (this.bag.berries <= 0 || this.usedBerry) return;
    this.bag.berries--;
    this.usedBerry = true;
    this.message = 'Used a berry! Catch chance increased for next throw.';
    this.saveCaughtToStorage();
  }

  getPokemonByDexNumber(dex: number): Pokemon | undefined {
    return this.allPokemonList.find((p) => p.dex_number === dex);
  }

  playCry(url: string) {
    if (!url) return;
    const audio = new Audio(url);
    audio.volume = 0.3;
    audio.play().catch(() => {});
  }
}
