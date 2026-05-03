import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEtudiants } from './admin-etudiants';

describe('AdminEtudiants', () => {
  let component: AdminEtudiants;
  let fixture: ComponentFixture<AdminEtudiants>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEtudiants],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminEtudiants);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
