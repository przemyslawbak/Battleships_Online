import { ForgottenComponent } from './reset-pass.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { TextService } from '@services/text.service';
import { FormBuilder } from '@angular/forms';
import { HttpService } from '@services/http.service';
import { ModalService } from '@services/modal.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';

let component: ForgottenComponent;
let fixture: ComponentFixture<ForgottenComponent>;
const routerMock = jasmine.createSpyObj('Router', ['navigate']);
const httpServiceMock = jasmine.createSpyObj('HttpService', ['postGameState']);
const modalServiceMock = jasmine.createSpyObj('ServiceMock', ['add', 'remove']);
const captchaServiceMock = jasmine.createSpyObj('ReCaptchaV3Service', [
  'execute',
]);

describe('ForgottenComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [ForgottenComponent],
      providers: [
        FormBuilder,
        { provide: ModalService, useValue: modalServiceMock },
        { provide: HttpService, useValue: httpServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ReCaptchaV3Service, useValue: captchaServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgottenComponent);
    component = fixture.componentInstance;
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });

  it('hasError_OnVariousEmailValues_SetsFormValidOrNot', () => {
    component.ngOnInit();
    component.form.controls['Email'].setValue('is_not_email');
    expect(component.form.status).toBe('INVALID');

    component.form.controls['Email'].setValue('');
    expect(component.form.status).toBe('INVALID');

    component.form.controls['Email'].setValue('is@email.com');
    expect(component.form.status).toBe('VALID');
  });
});
