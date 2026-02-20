import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonEntries } from './pokemon-entries';

describe('PokemonEntries', () => {
  let component: PokemonEntries;
  let fixture: ComponentFixture<PokemonEntries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PokemonEntries]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonEntries);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
