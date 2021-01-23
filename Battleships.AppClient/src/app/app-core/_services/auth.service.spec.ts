import { HttpHeaders, HttpRequest } from '@angular/common/http';
import { of } from 'rxjs';
import { ActivatedRouteSnapshot, Data } from '@angular/router';

import { AuthService } from './auth.service';
import { UserRole } from '@models/user-role.model';
import { LoginResponse } from '@models/login-response.model';

describe('AuthService', () => {
  let request: HttpRequest<any>;
  let user: LoginResponse;
  let authService: AuthService;
  const routerMock = jasmine.createSpyObj('Router', ['navigate']);
  const textServiceMock = jasmine.createSpyObj('TextService', [
    'splitToken',
    'replaceSpecialCharacters',
  ]);
  const httpServiceMock = jasmine.createSpyObj('HttpService', [
    'addAuthHeader',
    'postForLoginResponse',
    'postRevokeData',
    'postForRefreshToken',
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
    request = {
      url: 'some_url',
      method: 'some_method',
      headers: new HttpHeaders(),
    } as HttpRequest<any>;
    user = {
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6Ijc3MjA3NmNkLTVkN2QtNGI1OS05NmE0LTZjOGM5MzE3YjFlYSIsInJvbGUiOiJVc2VyIiwibmJmIjoxNjEwNjE3NjM0LCJleHAiOjE2MTA2MTgyMzQsImlhdCI6MTYxMDYxNzYzNCwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MDk2Mi8iLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjUwOTYyLyJ9.VeVjvcooAO9A-7mZ1u5pW53m4MlZ-xYKQPrW9fNJ21s',
      email: 'bbb',
      user: 'ccc',
      refreshToken: 'ddd',
      displayName: 'eee',
      role: UserRole.User,
    } as LoginResponse;
    authService = new AuthService(routerMock, httpServiceMock, textServiceMock);
    httpServiceMock.addAuthHeader.calls.reset();
    httpServiceMock.postRevokeData.calls.reset();
    httpServiceMock.postForRefreshToken.calls.reset();
    textServiceMock.splitToken.and.returnValue(
      'eyJ1bmlxdWVfbmFtZSI6Ijc3MjA3NmNkLTVkN2QtNGI1OS05NmE0LTZjOGM5MzE3YjFlYSIsInJvbGUiOiJVc2VyIiwibmJmIjoxNjEwNjE3NjM0LCJleHAiOjE2MTA2MTgyMzQsImlhdCI6MTYxMDYxNzYzNCwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MDk2Mi8iLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjUwOTYyLyJ9'
    );
    textServiceMock.replaceSpecialCharacters.and.returnValue('somegoodtoken');
  });

  it('Service_ShouldBeCreated', () => {
    expect(authService).toBeTruthy();
  });

  it('localStorage_ShouldSetAnItem', () => {
    localStorage.setItem('foo', 'bar');

    expect(localStorage.getItem('foo')).toBe('bar');
  });

  it('login_OnNotReceivedUser_DoesNotSetAuth', (done) => {
    user = null;
    httpServiceMock.postForLoginResponse.and.returnValue(of(user));
    localStorage.setItem('auth', 'bar');

    authService.login('some_email', 'some_pass').subscribe((data) => {
      expect(data).toBeFalse;
      expect(localStorage.getItem('auth')).toBe(null);
    });
    done();
  });

  it('login_OnReceivedUser_DoesSetAuth', (done) => {
    httpServiceMock.postForLoginResponse.and.returnValue(of(user));
    httpServiceMock.postForRefreshToken.and.returnValue(of(user));
    localStorage.clear();

    authService.login('some_email', 'some_pass').subscribe((data) => {
      expect(data).toBeTrue;
      let value: LoginResponse = JSON.parse(localStorage.getItem('auth'));
      expect(value.token).toBe(user.token);
      expect(value.email).toBe(user.email);
      expect(value.user).toBe(user.user);
      expect(value.refreshToken).toBe(user.refreshToken);
      expect(value.displayName).toBe(user.displayName);
      expect(value.role).toBe(user.role);
    });
    done();
  });

  it('addAuthHeader_OnNullUser_NotCallsAddAuthHeader', () => {
    httpServiceMock.addAuthHeader.and.returnValue(request);
    localStorage.clear();
    authService.addAuthHeader(request);

    expect(httpServiceMock.addAuthHeader).toHaveBeenCalledTimes(0);
  });

  it('addAuthHeader_OnUserNotNull_CallsAddAuthHeader', () => {
    httpServiceMock.addAuthHeader.and.returnValue(request);
    localStorage.setItem('auth', JSON.stringify(user));
    authService.addAuthHeader(request);

    expect(httpServiceMock.addAuthHeader).toHaveBeenCalledTimes(1);
  });

  it('getAuth_OnNullUserValue_ReturnsNull', () => {
    user = null;
    localStorage.clear();
    let value: LoginResponse = authService.getAuth();

    expect(value).toBeNull;
  });

  it('getAuth_OnUserValue_ReturnsUser', () => {
    localStorage.setItem('auth', JSON.stringify(user));
    let value: LoginResponse = authService.getAuth();

    expect(value.token).toBe(user.token);
    expect(value.email).toBe(user.email);
    expect(value.user).toBe(user.user);
    expect(value.refreshToken).toBe(user.refreshToken);
    expect(value.displayName).toBe(user.displayName);
    expect(value.role).toBe(user.role);
  });

  it('setAuth_OnNullUserValue_RemovesUserFromStorage', () => {
    localStorage.setItem('auth', JSON.stringify(user));
    authService.setAuth(null);

    expect(localStorage.getItem('auth')).toBe(null);
  });

  it('setAuth_OnUserValue_AddsUserToTheStorage', () => {
    localStorage.clear();
    authService.setAuth(user);

    let value: LoginResponse = JSON.parse(localStorage.getItem('auth'));

    expect(value.token).toBe(user.token);
    expect(value.email).toBe(user.email);
    expect(value.user).toBe(user.user);
    expect(value.refreshToken).toBe(user.refreshToken);
    expect(value.displayName).toBe(user.displayName);
    expect(value.role).toBe(user.role);
  });

  it('logout_OnNullUserValue_NeverCallsPostRevokeData', () => {
    localStorage.clear();
    authService.logout();

    expect(httpServiceMock.postRevokeData).toHaveBeenCalledTimes(0);
  });

  it('logout_OnUserValue_CallsPostRevokeDataOnceAndSetsUserToNull', () => {
    httpServiceMock.postRevokeData.and.returnValue(of(null));
    localStorage.setItem('auth', JSON.stringify(user));
    authService.logout();

    expect(httpServiceMock.postRevokeData).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('auth')).toBe(null);
  });

  it('refreshToken_OnNullUserValue_NeverCallsPostForRefreshToken', () => {
    localStorage.clear();
    authService.refreshToken();

    expect(httpServiceMock.postForRefreshToken).toHaveBeenCalledTimes(0);
  });

  it('refreshToken_OnUserValue_CallsPostForRefreshToken', () => {
    let userBeforeUpdate = user;
    userBeforeUpdate.refreshToken = 'I am before refresh';
    userBeforeUpdate.token = 'I am before refresh';
    httpServiceMock.postForRefreshToken.and.returnValue(of(user));
    localStorage.setItem('auth', JSON.stringify(user));
    authService.refreshToken();
    let value: LoginResponse = JSON.parse(localStorage.getItem('auth'));

    expect(httpServiceMock.postForRefreshToken).toHaveBeenCalledTimes(1);
    expect(value.token).toBe(user.token);
    expect(value.email).toBe(user.email);
    expect(value.user).toBe(user.user);
    expect(value.refreshToken).toBe(user.refreshToken);
    expect(value.displayName).toBe(user.displayName);
    expect(value.role).toBe(user.role);
  });

  it('isAdmin_OnUserRole_ReturnsFalse', () => {
    user.role = UserRole.User;
    localStorage.setItem('auth', JSON.stringify(user));

    let value: boolean = authService.isAdmin();

    expect(value).toBe(false);
  });

  it('isAdmin_OnAdminRole_ReturnsTrue', () => {
    user.role = UserRole.Admin;
    localStorage.setItem('auth', JSON.stringify(user));

    let value: boolean = authService.isAdmin();

    expect(value).toBe(true);
  });

  it('isLoggedIn_OnNullUserValue_ReturnsFalse', () => {
    localStorage.clear();
    let value: boolean = authService.isLoggedIn();

    expect(value).toBe(false);
  });

  it('isLoggedIn_OnUserValue_ReturnsTrue', () => {
    localStorage.setItem('auth', JSON.stringify(user));
    let value: boolean = authService.isLoggedIn();

    expect(value).toBe(true);
  });

  it('isRoleCorrect_OnMatchingRoles_ReturnsTrue', () => {
    let activatedRoute: ActivatedRouteSnapshot = new ActivatedRouteSnapshot();
    let data: Data = { roles: 'User' } as Data;
    activatedRoute.data = data;

    let value: boolean = authService.isRoleCorrect(activatedRoute, user.role);

    expect(value).toBe(true);
  });

  it('isRoleCorrect_OnNotMatchingRoles_ReturnsFalse', () => {
    let activatedRoute: ActivatedRouteSnapshot = new ActivatedRouteSnapshot();
    let data: Data = { roles: 'Admin' } as Data;
    activatedRoute.data = data;

    let value: boolean = authService.isRoleCorrect(activatedRoute, user.role);

    expect(value).toBe(false);
  });

  it('isRoleCorrect_OnRoleNull_ReturnsTrue', () => {
    let activatedRoute: ActivatedRouteSnapshot = new ActivatedRouteSnapshot();
    let data: Data = { roles: null } as Data;
    activatedRoute.data = data;

    let value: boolean = authService.isRoleCorrect(activatedRoute, user.role);

    expect(value).toBe(true);
  });
});
