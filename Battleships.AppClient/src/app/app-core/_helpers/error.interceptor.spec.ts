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
import { ErrorService } from '@services/error.service';

describe('JtwInterceptor', () => {
  let httpMock: HttpTestingController;
  let injector: TestBed;
  const errorsMock = jasmine.createSpyObj('ErrorService', [
    'handleBackendError',
    'handleAuthError',
    'handleBotError',
    'handleOtherError',
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
        { provide: ErrorService, useValue: errorsMock },
      ],
    });

    injector = getTestBed();
    httpMock = injector.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
