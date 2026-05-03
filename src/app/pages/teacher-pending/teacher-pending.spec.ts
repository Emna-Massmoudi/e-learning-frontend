import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherPending } from './teacher-pending';

describe('TeacherPending', () => {
  let component: TeacherPending;
  let fixture: ComponentFixture<TeacherPending>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TeacherPending],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherPending);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
