import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonEvolutionChains } from './pokemon-evolution-chains';

describe('PokemonEvolutionChains', () => {
  let component: PokemonEvolutionChains;
  let fixture: ComponentFixture<PokemonEvolutionChains>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PokemonEvolutionChains]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonEvolutionChains);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
