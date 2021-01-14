import { LoginResponse } from '@models/login-response.model';
import { HttpHeaders, HttpRequest } from '@angular/common/http';
import { AuthService } from './auth.service';
import { of } from 'rxjs';

describe('AuthService', () => {
  let request: HttpRequest<any>;
  let user: LoginResponse;
  let authService: AuthService;
  const routerMock = jasmine.createSpyObj('Router', ['navigate']);
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
      role: 'User',
    } as LoginResponse;
    authService = new AuthService(routerMock, httpServiceMock);
    httpServiceMock.addAuthHeader.calls.reset();
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
      done();
    });
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
      done();
    });
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
});
