import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Pokemon, Variety } from '../../../models/Pokemon/poke-details';

@Component({
  selector: 'app-ev-training-tool',
  standalone: false,
  templateUrl: './ev-training-tool.html',
  styleUrl: './ev-training-tool.css',
})
export class EvTrainingTool implements OnInit {
  pokemon: (Pokemon | Variety)[] = [];
  stat: string | null = null;

  evCounts = {
    hp: 0,
    attack: 0,
    defense: 0,
    spAttack: 0,
    spDefense: 0,
    speed: 0,
  };
  loading: boolean = true;

  constructor(private route: ActivatedRoute, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loading = true;
    this.route.data.subscribe({
      next: (data) => {
        this.pokemon = data['pokemon'] || [];
        this.countEVsFromStats(this.pokemon);

        this.loading = false;
        this.cd.detectChanges();
      },
    });
  }

  countEVsFromStats(pokemonList: any[]) {
    for (const p of pokemonList) {
      for (const stat of p.stats) {
        if (stat.effort > 0) {
          switch (stat.name) {
            case 'hp':
              this.evCounts.hp++;
              break;
            case 'attack':
              this.evCounts.attack++;
              break;
            case 'defense':
              this.evCounts.defense++;
              break;
            case 'special-attack':
              this.evCounts.spAttack++;
              break;
            case 'special-defense':
              this.evCounts.spDefense++;
              break;
            case 'speed':
              this.evCounts.speed++;
              break;
          }
        }
      }
    }
  }
}
