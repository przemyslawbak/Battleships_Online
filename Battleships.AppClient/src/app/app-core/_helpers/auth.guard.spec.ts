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

  it('canActivate_OnNotLoggedInUser_ReturnsFalseAndRedirectsToJoinSite', async () => {
    let promise: Promise<boolean> = Promise.resolve(true);
    routerMock.navigate.and.returnValue(promise);
    authMock.getAuth.and.returnValue(null);
    let result = await authGuard.canActivate(<any>{}, <any>{});
    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['join-site'], {
      queryParams: { returnUrl: undefined },
    });
  });

  it('canActivate_OnLoggedInUserAndNotCorrectRole_ReturnsTrueAndRedirectsToHome', async () => {
    let promise: Promise<boolean> = Promise.resolve(true);
    routerMock.navigate.and.returnValue(promise);
    authMock.getAuth.and.returnValue({} as LoginResponse);
    authMock.isRoleCorrect.and.returnValue(false);
    let result = await authGuard.canActivate(<any>{}, <any>{});
    expect(result).toBe(true);
    expect(routerMock.navigate).toHaveBeenCalledWith(['']);
  });

  it('canActivate_OnLoggedInUserAndCorrectRole_ReturnsTrue', async () => {
    authMock.getAuth.and.returnValue({} as LoginResponse);
    authMock.isRoleCorrect.and.returnValue(true);
    expect(await authGuard.canActivate(<any>{}, <any>{})).toBe(true);
  });
});
