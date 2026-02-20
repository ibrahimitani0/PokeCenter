import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvTrainingTool } from './ev-training-tool';

describe('EvTrainingTool', () => {
  let component: EvTrainingTool;
  let fixture: ComponentFixture<EvTrainingTool>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EvTrainingTool]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvTrainingTool);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
