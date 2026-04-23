import { TestBed } from '@angular/core/testing';

import { JopService } from './jop.service';

describe('JopService', () => {
  let service: JopService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JopService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
