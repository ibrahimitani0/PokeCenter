import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NationalDex } from './national-dex';

describe('NationalDex', () => {
  let component: NationalDex;
  let fixture: ComponentFixture<NationalDex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NationalDex]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NationalDex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
