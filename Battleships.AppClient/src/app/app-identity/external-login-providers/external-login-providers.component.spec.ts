import { LoginExternalProvidersComponent } from './external-login-providers.component';
import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { WindowService } from '@services/window.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { TextService } from '@services/text.service';

let component: LoginExternalProvidersComponent;
let fixture: ComponentFixture<LoginExternalProvidersComponent>;
const windowsServiceMock = jasmine.createSpyObj('WindowService', [
  'closePopUpWindow',
  'openExternalLoginWindow',
  'handleCloseExternalProvider',
]);
const textServiceMock = jasmine.createSpyObj('TextService', [
  'getExtarnalLoginUrl',
  'getWindowParameters',
  'getExternalLoginPageHtmlCode',
]);
const spinnersMock = jasmine.createSpyObj('NgxSpinnerService', [
  'show',
  'hide',
]);

describe('LoginExternalProvidersComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [LoginExternalProvidersComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParams: { returnUrl: 'any_url' } },
          },
        },
        { provide: WindowService, useValue: windowsServiceMock },
        { provide: NgxSpinnerService, useValue: spinnersMock },
        { provide: TextService, useValue: textServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginExternalProvidersComponent);
    component = fixture.componentInstance;

    windowsServiceMock.handleCloseExternalProvider.calls.reset();
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });

  it('callExternalLogin_OnExternalLoginWindowClosed_CallsOnceHandleClosedServiceMethod', fakeAsync(() => {
    let windowMock: Window = <any>{ closed: true };
    windowsServiceMock.openExternalLoginWindow.and.returnValue(windowMock);
    component.callExternalLogin('Facebook');
    tick(1000);
    discardPeriodicTasks();

    expect(
      windowsServiceMock.handleCloseExternalProvider
    ).toHaveBeenCalledTimes(1);
  }));

  it('callExternalLogin_OnExternalLoginWindowNotClosed_CallsNeverHandleClosedServiceMethod', fakeAsync(() => {
    let windowMock: Window = <any>{ closed: false, dupa: false };
    windowsServiceMock.openExternalLoginWindow.and.returnValue(windowMock);
    component.callExternalLogin('Facebook');
    tick(1000);
    discardPeriodicTasks();

    expect(
      windowsServiceMock.handleCloseExternalProvider
    ).toHaveBeenCalledTimes(0);
  }));
});
