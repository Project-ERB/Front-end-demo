import { TestBed } from '@angular/core/testing';

import { ApolloservicesService } from './apolloservices.service';

describe('ApolloservicesService', () => {
  let service: ApolloservicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApolloservicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
