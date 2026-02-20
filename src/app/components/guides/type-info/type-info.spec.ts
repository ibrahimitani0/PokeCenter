import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeInfo } from './type-info';

describe('TypeInfo', () => {
  let component: TypeInfo;
  let fixture: ComponentFixture<TypeInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TypeInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
