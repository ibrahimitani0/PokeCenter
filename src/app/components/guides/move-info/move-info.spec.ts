import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveInfo } from './move-info';

describe('MoveInfo', () => {
  let component: MoveInfo;
  let fixture: ComponentFixture<MoveInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoveInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoveInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
