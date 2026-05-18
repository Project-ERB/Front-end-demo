import { TestBed } from '@angular/core/testing';

import { ReceivableService } from './receivable.service';

describe('ReceivableService', () => {
  let service: ReceivableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReceivableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
