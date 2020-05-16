import { TestBed } from '@angular/core/testing';

import { CompanyAuthGuard } from './company-auth.guard';

describe('CompanyAuthGuard', () => {
  let guard: CompanyAuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CompanyAuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
