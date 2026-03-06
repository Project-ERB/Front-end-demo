import { TestBed } from '@angular/core/testing';

import { ApollocatoriesService } from './apollocatories.service';

describe('ApollocatoriesService', () => {
  let service: ApollocatoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApollocatoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
