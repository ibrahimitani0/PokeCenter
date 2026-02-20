import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonMoves } from './pokemon-moves';

describe('PokemonMoves', () => {
  let component: PokemonMoves;
  let fixture: ComponentFixture<PokemonMoves>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PokemonMoves]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonMoves);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
