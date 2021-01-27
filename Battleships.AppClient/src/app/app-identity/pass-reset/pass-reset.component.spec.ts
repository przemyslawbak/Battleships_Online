import { PassResetComponent } from './pass-reset.component';
import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { TextService } from '@services/text.service';
import { FormBuilder } from '@angular/forms';
import { HttpService } from '@services/http.service';
import { ModalService } from '@services/modal.service';

let component: PassResetComponent;
let fixture: ComponentFixture<PassResetComponent>;
const textServiceMock = jasmine.createSpyObj('TextService', [
  'replaceSpecialCharacters',
]);
const routerMock = jasmine.createSpyObj('Router', ['navigate']);
const httpServiceMock = jasmine.createSpyObj('HttpService', ['postGameState']);
const modalServiceMock = jasmine.createSpyObj('ServiceMock', ['add', 'remove']);

describe('PassResetComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [PassResetComponent],
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
        { provide: ModalService, useValue: modalServiceMock },
        { provide: HttpService, useValue: httpServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: TextService, useValue: textServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PassResetComponent);
    component = fixture.componentInstance;
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit_OnTwoTheSameNotEmptyPasswords_SetsFormStatusValid', () => {
    let reset: any = { Password: 'aaa', PasswordConfirm: 'aaa' };
    component.ngOnInit();
    component.form.controls['Password'].setValue(reset.Password);
    component.form.controls['PasswordConfirm'].setValue(reset.PasswordConfirm);

    expect(component.form.status).toBe('VALID');
  });

  it('ngOnInit_OnTwoTheDifferentNotEmptyPasswords_SetsFormStatusInvalid', () => {
    let reset: any = { Password: 'aaa', PasswordConfirm: 'bbb' };
    component.ngOnInit();
    component.form.controls['Password'].setValue(reset.Password);
    component.form.controls['PasswordConfirm'].setValue(reset.PasswordConfirm);

    expect(component.form.status).toBe('INVALID');
  });

  it('ngOnInit_OnTwoTheEmptyPassword_SetsFormStatusInvalid', () => {
    let reset: any = { Password: '', PasswordConfirm: '' };
    component.ngOnInit();
    component.form.controls['Password'].setValue(reset.Password);
    component.form.controls['PasswordConfirm'].setValue(reset.PasswordConfirm);

    expect(component.form.status).toBe('INVALID');
  });
});
