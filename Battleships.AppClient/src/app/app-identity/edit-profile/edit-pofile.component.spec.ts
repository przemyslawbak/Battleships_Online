import { EditProfileComponent } from './edit-profile.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '@services/auth.service';
import { ModalService } from '@services/modal.service';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { HttpService } from '@services/http.service';
import { LoginResponse } from '@models/login-response.model';

let component: EditProfileComponent;
let fixture: ComponentFixture<EditProfileComponent>;
const authServiceMock = jasmine.createSpyObj('AuthService', [
  'setAuth',
  'getAuth',
  'logout',
]);
const modalServiceMock = jasmine.createSpyObj('ServiceMock', ['open']);
const routerMock = jasmine.createSpyObj('Router', ['navigate']);
const httpServiceMock = jasmine.createSpyObj('HttpService', ['putUpdatedUser']);

describe('EditProfileComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [EditProfileComponent],
      providers: [
        FormBuilder,
        { provide: HttpService, useValue: httpServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ModalService, useValue: modalServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditProfileComponent);
    component = fixture.componentInstance;
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });
});
