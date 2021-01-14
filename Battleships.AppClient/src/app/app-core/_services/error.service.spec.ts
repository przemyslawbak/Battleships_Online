import { HttpErrorResponse } from '@angular/common/http';

import { ErrorService } from './error.service';

describe('ErrorService', () => {
  let errorService: ErrorService;
  const routerMock = jasmine.createSpyObj('Router', ['navigate']);
  const authServiceMock = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
  const modalServiceMock = jasmine.createSpyObj('ModalService', [
    'displayErrorMessage',
  ]);
  const securityServiceMock = jasmine.createSpyObj('SecurityService', [
    'delayForBruteForce',
  ]);

  beforeEach(() => {
    var store = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string): string => {
      return store[key] || null;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key: string): void => {
      delete store[key];
    });
    spyOn(localStorage, 'setItem').and.callFake(
      (key: string, value: string): string => {
        return (store[key] = <string>value);
      }
    );
    spyOn(localStorage, 'clear').and.callFake(() => {
      store = {};
    });
  });

  beforeEach(() => {
    errorService = new ErrorService(
      modalServiceMock,
      authServiceMock,
      routerMock,
      securityServiceMock
    );
    modalServiceMock.displayErrorMessage.calls.reset();
    securityServiceMock.delayForBruteForce.calls.reset();
  });

  it('Service_ShouldBeCreated', () => {
    expect(errorService).toBeTruthy();
  });

  it('handleAuthError_OnNullUserValue_RedirectsToJoinSiteView', () => {
    localStorage.clear();
    let error: HttpErrorResponse = new HttpErrorResponse({});
    errorService.handleAuthError(error);

    expect(routerMock.navigate).toHaveBeenCalledWith(['join-site']);
  });

  it('handleAuthError_OnUserValue_CallsModalServiceOpen', () => {
    authServiceMock.isLoggedIn.and.returnValue(true);
    let error: HttpErrorResponse = new HttpErrorResponse({});
    errorService.handleAuthError(error);

    expect(modalServiceMock.displayErrorMessage).toHaveBeenCalledTimes(1);
  });
});
