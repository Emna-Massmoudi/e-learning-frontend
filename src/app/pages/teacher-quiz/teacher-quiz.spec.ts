import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherQuiz } from './teacher-quiz';

describe('TeacherQuiz', () => {
  let component: TeacherQuiz;
  let fixture: ComponentFixture<TeacherQuiz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TeacherQuiz],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherQuiz);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
