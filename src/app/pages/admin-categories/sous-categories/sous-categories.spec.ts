import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SousCategories } from './sous-categories';

describe('SousCategories', () => {
  let component: SousCategories;
  let fixture: ComponentFixture<SousCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SousCategories],
    }).compileComponents();

    fixture = TestBed.createComponent(SousCategories);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
