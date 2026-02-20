import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamWeaknesses } from './team-weaknesses';

describe('TeamWeaknesses', () => {
  let component: TeamWeaknesses;
  let fixture: ComponentFixture<TeamWeaknesses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TeamWeaknesses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamWeaknesses);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
