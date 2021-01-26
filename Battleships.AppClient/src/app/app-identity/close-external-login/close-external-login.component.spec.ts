import { CloseComponent } from './close-external-login.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { AuthService } from '@services/auth.service';

let component: CloseComponent;
let fixture: ComponentFixture<CloseComponent>;
const authServiceMock = jasmine.createSpyObj('AuthService', ['setAuth']);

describe('CloseComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [CloseComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({
                email: 'any_email',
                user: 'any_user_name',
                token: 'any_token',
                refresh: 'any_refresh_token',
                display: 'any_display_name',
              }),
            },
          },
        },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CloseComponent);
    component = fixture.componentInstance;
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });
});
