import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EggGroupInfo } from './egg-group-info';

describe('EggGroupInfo', () => {
  let component: EggGroupInfo;
  let fixture: ComponentFixture<EggGroupInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EggGroupInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EggGroupInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
