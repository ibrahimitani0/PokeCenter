import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonEditor } from './pokemon-editor';

describe('PokemonEditor', () => {
  let component: PokemonEditor;
  let fixture: ComponentFixture<PokemonEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PokemonEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
