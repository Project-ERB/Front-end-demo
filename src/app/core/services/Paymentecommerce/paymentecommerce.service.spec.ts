import { TestBed } from '@angular/core/testing';

import { PaymentecommerceService } from './paymentecommerce.service';

describe('PaymentecommerceService', () => {
  let service: PaymentecommerceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentecommerceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
