import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemInfo } from './item-info';

describe('ItemInfo', () => {
  let component: ItemInfo;
  let fixture: ComponentFixture<ItemInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ItemInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
