import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBloques } from './admin-bloques';

describe('AdminBloques', () => {
  let component: AdminBloques;
  let fixture: ComponentFixture<AdminBloques>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminBloques],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminBloques);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
