import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeDefenses } from './type-defenses';

describe('TypeDefenses', () => {
  let component: TypeDefenses;
  let fixture: ComponentFixture<TypeDefenses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TypeDefenses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeDefenses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
