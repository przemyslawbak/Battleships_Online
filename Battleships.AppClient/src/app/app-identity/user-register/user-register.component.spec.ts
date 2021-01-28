import { ReCaptchaV3Service } from 'ng-recaptcha';
import { RegisterComponent } from './user-register.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { TextService } from '@services/text.service';
import { FormBuilder } from '@angular/forms';
import { HttpService } from '@services/http.service';
import { ModalService } from '@services/modal.service';
import { AuthService } from '@services/auth.service';
import { SecurityService } from '@services/security.service';

let component: RegisterComponent;
let fixture: ComponentFixture<RegisterComponent>;
const textServiceMock = jasmine.createSpyObj('TextService', [
  'replaceSpecialCharacters',
]);
const routerMock = jasmine.createSpyObj('Router', ['navigate']);
const httpServiceMock = jasmine.createSpyObj('HttpService', ['postGameState']);
const authServiceMock = jasmine.createSpyObj('AuthService', [
  'isLoggedIn',
  'login',
]);
const captchaServiceMock = jasmine.createSpyObj('ReCaptchaV3Service', [
  'execute',
]);
const securityServiceMock = jasmine.createSpyObj('SecurityService', [
  'delayForBruteForce',
]);

describe('RegisterComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [RegisterComponent],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({
                email: 'any@email.pl',
                token: 'any_token',
              }),
            },
          },
        },
        { provide: SecurityService, useValue: securityServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: HttpService, useValue: httpServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: TextService, useValue: textServiceMock },
        { provide: ReCaptchaV3Service, useValue: captchaServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit_OnCorrectValues_SetsFormStatusValid', () => {
    let register: any = {
      Password: 'aaa',
      PasswordConfirm: 'aaa',
      DisplayName: 'any_name',
      Email: 'proper@email.com',
    };
    component.ngOnInit();
    component.form.controls['Password'].setValue(register.Password);
    component.form.controls['PasswordConfirm'].setValue(
      register.PasswordConfirm
    );
    component.form.controls['DisplayName'].setValue(register.DisplayName);
    component.form.controls['Email'].setValue(register.Email);

    expect(component.form.status).toBe('VALID');
  });

  it('ngOnInit_OnNotCorrectValues_SetsFormStatusInvalid', () => {
    let register: any = {
      Password: 'aaa',
      PasswordConfirm: 'aaa',
      DisplayName: 'any_name',
      Email: 'proper@email.com',
    };
    component.ngOnInit();
    component.form.controls['Password'].setValue(register.Password);
    component.form.controls['PasswordConfirm'].setValue(
      register.PasswordConfirm
    );
    component.form.controls['DisplayName'].setValue(register.DisplayName);
    component.form.controls['Email'].setValue(register.Email);

    component.form.controls['Password'].setValue('');
    expect(component.form.status).toBe('INVALID');

    component.form.controls['PasswordConfirm'].setValue('bbb');
    component.form.controls['Password'].setValue('aaa');
    expect(component.form.status).toBe('INVALID');

    component.form.controls['PasswordConfirm'].setValue('aaa');
    component.form.controls['Email'].setValue('not_email');
    expect(component.form.status).toBe('INVALID');

    component.form.controls['Email'].setValue('proper@email.com');
    component.form.controls['DisplayName'].setValue('');
    expect(component.form.status).toBe('INVALID');
  });
});
