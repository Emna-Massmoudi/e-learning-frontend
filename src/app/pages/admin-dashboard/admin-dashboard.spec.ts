import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDashobard } from './admin-dashboard';

describe('AdminDashobard', () => {
  let component: AdminDashobard;
  let fixture: ComponentFixture<AdminDashobard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashobard],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashobard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
