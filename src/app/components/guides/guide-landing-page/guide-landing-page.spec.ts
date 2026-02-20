import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuideLandingPage } from './guide-landing-page';

describe('GuideLandingPage', () => {
  let component: GuideLandingPage;
  let fixture: ComponentFixture<GuideLandingPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GuideLandingPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuideLandingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
