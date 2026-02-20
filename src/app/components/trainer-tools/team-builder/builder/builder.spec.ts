import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Builder } from './builder';

describe('Builder', () => {
  let component: Builder;
  let fixture: ComponentFixture<Builder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Builder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Builder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
