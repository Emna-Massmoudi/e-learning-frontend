import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherApplication } from './teacher-application';

describe('TeacherApplication', () => {
  let component: TeacherApplication;
  let fixture: ComponentFixture<TeacherApplication>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TeacherApplication],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherApplication);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
