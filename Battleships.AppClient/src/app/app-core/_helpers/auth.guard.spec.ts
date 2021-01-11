import { LoginResponse } from '@models/login-response.model';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  const routerMock = jasmine.createSpyObj('Router', ['navigate']);
  const authMock = jasmine.createSpyObj('AuthService', [
    'getAuth',
    'isRoleCorrect',
  ]);

  beforeEach(() => {
    authGuard = new AuthGuard(authMock, routerMock);
  });

  it('AuthGuard_ShouldBeCreated', () => {
    expect(authGuard).toBeTruthy();
  });

  it('canActivate_OnNotLoggedInUser_ReturnsFalseAndRedirectsTo[join-site]', () => {
    authMock.getAuth.and.returnValue(null);
    expect(authGuard.canActivate(<any>{}, <any>{})).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['join-site'], {
      queryParams: { returnUrl: undefined },
    });
  });

  it('canActivate_OnLoggedInUserAndNotCorrectRole_ReturnsFalseAndRedirectsToHome', () => {
    authMock.getAuth.and.returnValue({} as LoginResponse);
    authMock.isRoleCorrect.and.returnValue(false);
    expect(authGuard.canActivate(<any>{}, <any>{})).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['']);
  });

  it('canActivate_OnLoggedInUserAndCorrectRole_ReturnsTrue', () => {
    authMock.getAuth.and.returnValue({} as LoginResponse);
    authMock.isRoleCorrect.and.returnValue(true);
    expect(authGuard.canActivate(<any>{}, <any>{})).toBe(true);
  });
});
