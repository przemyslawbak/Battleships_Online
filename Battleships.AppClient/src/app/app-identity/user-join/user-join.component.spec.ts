import { JoinComponent } from './user-join.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { LoginExternalProvidersComponent } from '../external-login-providers/external-login-providers.component';
import { WindowService } from '@services/window.service';
import { TextService } from '@services/text.service';
import { NgxSpinnerService } from 'ngx-spinner';

let component: JoinComponent;
let fixture: ComponentFixture<JoinComponent>;
const routerMock = jasmine.createSpyObj('Router', ['navigate']);
const authServiceMock = jasmine.createSpyObj('AuthService', [
  'isLoggedIn',
  'login',
]);
const windowsServiceMock = jasmine.createSpyObj('WindowService', [
  'closePopUpWindow',
  'openExternalLoginWindow',
  'handleCloseExternalProvider',
]);
const textServiceMock = jasmine.createSpyObj('TextService', [
  'splitToken',
  'replaceSpecialCharacters',
]);
const spinnersMock = jasmine.createSpyObj('NgxSpinnerService', [
  'show',
  'hide',
]);

describe('JoinComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [JoinComponent, LoginExternalProvidersComponent],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParams: { returnUrl: 'any_url' } },
          },
        },
        { provide: TextService, useValue: textServiceMock },
        { provide: WindowService, useValue: windowsServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: NgxSpinnerService, useValue: spinnersMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JoinComponent);
    component = fixture.componentInstance;

    routerMock.navigate.calls.reset();
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit_OnLoggedInUser_NavigateToHomeView', () => {
    authServiceMock.isLoggedIn.and.returnValue(true);
    component.ngOnInit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['']);
    expect(routerMock.navigate).toHaveBeenCalledTimes(1);
  });

  it('ngOnInit_OnNotLoggedInUser_NavigateToHomeView', () => {
    authServiceMock.isLoggedIn.and.returnValue(false);
    component.ngOnInit();

    expect(routerMock.navigate).toHaveBeenCalledTimes(0);
  });

  it('ngOnInit_OnProperEmailAndPassValues_SetsValidFormStatus', () => {
    authServiceMock.isLoggedIn.and.returnValue(false);
    let join: any = { Password: 'any_pass', Email: 'proper@email.com' };
    component.ngOnInit();
    component.form.controls['Password'].setValue(join.Password);
    component.form.controls['Email'].setValue(join.Email);

    expect(component.form.status).toBe('VALID');
  });

  it('ngOnInit_OnProperEmptyEmailAndProperPassValues_SetsInValidFormStatus', () => {
    authServiceMock.isLoggedIn.and.returnValue(false);
    let join: any = { Password: 'any_pass', Email: '' };
    component.ngOnInit();
    component.form.controls['Password'].setValue(join.Password);
    component.form.controls['Email'].setValue(join.Email);

    expect(component.form.status).toBe('INVALID');
  });

  it('ngOnInit_OnProperProperEmailAndEmptyPassValues_SetsInValidFormStatus', () => {
    authServiceMock.isLoggedIn.and.returnValue(false);
    let join: any = { Password: '', Email: 'proper@email.com' };
    component.ngOnInit();
    component.form.controls['Password'].setValue(join.Password);
    component.form.controls['Email'].setValue(join.Email);

    expect(component.form.status).toBe('INVALID');
  });

  it('ngOnInit_OnProperInvalidEmailAndProperPassValues_SetsInValidFormStatus', () => {
    authServiceMock.isLoggedIn.and.returnValue(false);
    let join: any = { Password: 'any_pass', Email: 'not_email' };
    component.ngOnInit();
    component.form.controls['Password'].setValue(join.Password);
    component.form.controls['Email'].setValue(join.Email);

    expect(component.form.status).toBe('INVALID');
  });
});
