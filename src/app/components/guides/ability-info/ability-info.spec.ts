import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbilityInfo } from './ability-info';

describe('AbilityInfo', () => {
  let component: AbilityInfo;
  let fixture: ComponentFixture<AbilityInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AbilityInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbilityInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
