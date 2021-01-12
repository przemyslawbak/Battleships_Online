import { HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { getTestBed, TestBed } from '@angular/core/testing';
import { ErrorInterceptor } from './error.interceptor';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { HttpService } from './../_services/http.service';
import { ErrorService } from '@services/error.service';

describe('ErrorInterceptor', () => {
  let httpMock: HttpTestingController;
  let injector: TestBed;
  let service: HttpService;
  const errorsMock = jasmine.createSpyObj('ErrorService', [
    'handleBackendError',
    'handleAuthError',
    'handleBotError',
    'handleOtherError',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
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
    service = TestBed.inject(HttpService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('Injector_ShouldBeCreated', () => {
    expect(injector).toBeTruthy();
    expect(service).toBeTruthy();
  });

  it('ErrorInterceptor_OnStatsCode200_ShouldReceiveData', (done) => {
    let sample_data: string = 'All is fine';
    service.getGameState('1').subscribe(
      (data) => {
        expect(data).toBe(sample_data);
        done();
      },
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(200);
        expect(error.ok).toBe(true);
        expect(error.statusText).toBe('Ok');
        done();
      }
    );

    const testRequest = httpMock.expectOne(
      'http://localhost:50962/api/game/join?id=1'
    );
    expect(testRequest.request.method).toBe('GET');
    testRequest.flush(sample_data, {
      status: 200,
      statusText: 'Ok',
    });
  });

  it('ErrorInterceptor_OnHttpError401_ShouldReceiveNoDataAndCallHandleAuthError', (done) => {
    service.getGameState('1').subscribe(
      (data) => {
        expect(data).toBeNull();
        expect(errorsMock.handleAuthError).toHaveBeenCalled();
        done();
      },
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(401);
        expect(error.ok).toBe(false);
        expect(error.statusText).toBe('Unauthorized request');
        done();
      }
    );

    const testRequest = httpMock.expectOne(
      'http://localhost:50962/api/game/join?id=1'
    );
    expect(testRequest.request.method).toBe('GET');
    testRequest.flush(null, {
      status: 401,
      statusText: 'Unauthorized request',
    });
  });

  it('ErrorInterceptor_OnHttpError0_ShouldReceiveNoDataAndCallHandleBackendError', (done) => {
    service.getGameState('1').subscribe(
      (data) => {
        expect(data).toBeNull();
        expect(errorsMock.handleBackendError).toHaveBeenCalled();
        done();
      },
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(0);
        expect(error.ok).toBe(false);
        expect(error.statusText).toBe('Server error');
        done();
      }
    );

    const testRequest = httpMock.expectOne(
      'http://localhost:50962/api/game/join?id=1'
    );
    expect(testRequest.request.method).toBe('GET');
    testRequest.flush(null, {
      status: 0,
      statusText: 'Server error',
    });
  });

  it('ErrorInterceptor_OnHttpError429_ShouldReceiveNoDataAndCallHandleBotError', (done) => {
    service.getGameState('1').subscribe(
      (data) => {
        expect(data).toBeNull();
        expect(errorsMock.handleBotError).toHaveBeenCalled();
        done();
      },
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(429);
        expect(error.ok).toBe(false);
        expect(error.statusText).toBe('Bot error');
        done();
      }
    );

    const testRequest = httpMock.expectOne(
      'http://localhost:50962/api/game/join?id=1'
    );
    expect(testRequest.request.method).toBe('GET');
    testRequest.flush(null, {
      status: 429,
      statusText: 'Bot error',
    });
  });
});
