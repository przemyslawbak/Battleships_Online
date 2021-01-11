import { HttpService } from './../_services/http.service';
import {
  HttpClient,
  HttpHeaders,
  HttpRequest,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { fakeAsync, getTestBed, inject, TestBed } from '@angular/core/testing';
import { JtwInterceptor } from './jtw.interceptor';
import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { AuthService } from '@services/auth.service';

describe('JtwInterceptor', () => {
  let httpMock: HttpTestingController;
  let injector: TestBed;
  const authMock = jasmine.createSpyObj('AuthService', [
    'isLoggedIn',
    'addAuthHeader',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HttpService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: JtwInterceptor,
          multi: true,
        },
        { provide: AuthService, useValue: authMock },
      ],
    });

    injector = getTestBed();
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('intercept_OnNotLoggedInUser_ReturnsRequestWithoutAuthHeader', inject(
    [HttpClient],
    (http: HttpClient) => {
      let url: string = '/dummy';
      let method: string = 'GET';
      authMock.isLoggedIn.and.returnValue(false);
      http.get(url).subscribe();
      const httpRequest: TestRequest = httpMock.expectOne({
        method: method,
      });
      expect(httpRequest.request.url).toEqual(url);
      expect(httpRequest.request.headers.has('Authorization')).toBeFalsy();
    }
  ));

  it('intercept_OnLoggedInUser_ReturnsRequestWithAuthHeader', inject(
    [HttpClient],
    (http: HttpClient) => {
      let url: string = '/dummy';
      let method: string = 'GET';
      let headers = new HttpHeaders();
      headers = headers.set('Authorization', 'some_header');
      authMock.isLoggedIn.and.returnValue(true);
      authMock.addAuthHeader.and.returnValue({
        url: url,
        method: method,
        headers: headers,
      } as HttpRequest<any>);
      http.get(url).subscribe();
      const httpRequest: TestRequest = httpMock.expectOne({
        method: method,
      });
      expect(httpRequest.request.url).toEqual(url);
      expect(httpRequest.request.headers.has('Authorization')).toBeTruthy();
    }
  ));
});
