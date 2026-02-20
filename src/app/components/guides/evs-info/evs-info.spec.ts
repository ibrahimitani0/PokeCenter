import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvsInfo } from './evs-info';

describe('EvsInfo', () => {
  let component: EvsInfo;
  let fixture: ComponentFixture<EvsInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EvsInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvsInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
