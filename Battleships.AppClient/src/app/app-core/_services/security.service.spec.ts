import { NgxSpinnerService } from 'ngx-spinner';
import { SecurityService } from './security.service';

describe('SecurityService', () => {
  let securityService: SecurityService;
  let spinnerService: NgxSpinnerService;

  beforeEach(() => {
    securityService = new SecurityService(spinnerService);
  });

  it('Service_ShouldBeCreated', () => {
    expect(securityService).toBeTruthy();
  });
});
