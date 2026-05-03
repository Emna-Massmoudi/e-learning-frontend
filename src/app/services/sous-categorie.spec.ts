import { TestBed } from '@angular/core/testing';

import { SousCategorie } from './sous-categorie';

describe('SousCategorie', () => {
  let service: SousCategorie;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SousCategorie);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
