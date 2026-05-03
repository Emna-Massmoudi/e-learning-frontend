import { TestBed } from '@angular/core/testing';

import { Cours } from './cours';

describe('Cours', () => {
  let service: Cours;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cours);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
