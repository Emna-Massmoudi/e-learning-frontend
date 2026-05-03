import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCoursDetail } from './admin-cours-detail';

describe('AdminCoursDetail', () => {
  let component: AdminCoursDetail;
  let fixture: ComponentFixture<AdminCoursDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCoursDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminCoursDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
