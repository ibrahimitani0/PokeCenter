import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparePoke } from './compare-poke';

describe('ComparePoke', () => {
  let component: ComparePoke;
  let fixture: ComponentFixture<ComparePoke>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComparePoke]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparePoke);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
