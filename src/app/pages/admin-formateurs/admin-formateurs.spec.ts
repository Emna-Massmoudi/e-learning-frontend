import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFormateurs } from './admin-formateurs';

describe('AdminFormateurs', () => {
  let component: AdminFormateurs;
  let fixture: ComponentFixture<AdminFormateurs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminFormateurs],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminFormateurs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
