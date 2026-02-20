import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokedexTracker } from './pokedex-tracker';

describe('PokedexTracker', () => {
  let component: PokedexTracker;
  let fixture: ComponentFixture<PokedexTracker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PokedexTracker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokedexTracker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
