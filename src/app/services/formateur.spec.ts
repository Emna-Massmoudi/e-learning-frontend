import { TestBed } from '@angular/core/testing';

import { Formateur } from './formateur';

describe('Formateur', () => {
  let service: Formateur;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Formateur);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
