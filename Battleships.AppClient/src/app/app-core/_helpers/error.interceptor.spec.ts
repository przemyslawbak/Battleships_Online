import { RouterTestingModule } from '@angular/router/testing';
import { HttpService } from './../_services/http.service';
import {
  HttpClient,
  HttpHeaders,
  HttpRequest,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { getTestBed, inject, TestBed } from '@angular/core/testing';
import { ErrorInterceptor } from './error.interceptor';
import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';
import { ModalService } from '@services/modal.service';
import { SecurityService } from '@services/security.service';

describe('JtwInterceptor', () => {
  let httpMock: HttpTestingController;
  let injector: TestBed;
  const authMock = jasmine.createSpyObj('AuthService', [
    'isLoggedIn',
    'isTokenExpired',
    'addAuthHeader',
    'logout',
    'refreshToken',
  ]);
  const routerMock = jasmine.createSpyObj('Router', ['navigate']);
  const modalMock = jasmine.createSpyObj('ModalService', ['open']);
  const securityMock = jasmine.createSpyObj('SecurityService', [
    'delayForBruteForce',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        HttpService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ErrorInterceptor,
          multi: true,
        },
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
        { provide: ModalService, useValue: modalMock },
        { provide: SecurityService, useValue: securityMock },
      ],
    });

    injector = getTestBed();
    httpMock = injector.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
