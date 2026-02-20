import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokeLocEncounters } from './poke-loc-encounters';

describe('PokeLocEncounters', () => {
  let component: PokeLocEncounters;
  let fixture: ComponentFixture<PokeLocEncounters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PokeLocEncounters]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokeLocEncounters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
