import { SpinnerInterceptor } from './spinner.interceptor';
import { HttpService } from './../_services/http.service';
import { HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { getTestBed, TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { NgxSpinnerService } from 'ngx-spinner';

describe('SpinnerInterceptor', () => {
  let httpMock: HttpTestingController;
  let injector: TestBed;
  let service: HttpService;
  const spinnersMock = jasmine.createSpyObj('NgxSpinnerService', [
    'show',
    'hide',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        HttpService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: SpinnerInterceptor,
          multi: true,
        },
        { provide: NgxSpinnerService, useValue: spinnersMock },
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

  it('SpinnerInterceptor_OnHttpRequestExecuted_CallsOpenAndHideSpinner', (done) => {
    let sample_data: string = 'All is fine';
    service.getGameState('1').subscribe(
      (data) => {
        expect(data).toBe(sample_data);
        expect(spinnersMock.show).toHaveBeenCalled();
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
    expect(spinnersMock.hide).toHaveBeenCalled();
  });
});
