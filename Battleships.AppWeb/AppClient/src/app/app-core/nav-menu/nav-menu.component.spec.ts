import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NavMenuComponent } from './nav-menu.component';
import { AuthService } from '@services/auth.service';

describe('NavMenuComponent', () => {
  let fixture: ComponentFixture<NavMenuComponent>;
  let component: NavMenuComponent;
  const mockAuthService = jasmine.createSpyObj('AuthService', [
    'isLoggedIn',
    'getAuth',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
      declarations: [NavMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NavMenuComponent);
    component = fixture.componentInstance;
  });

  it('getUserDisplayName returns `guest` for not logged in user', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);

    const result = component.getUserDisplayName();

    expect(result).toBe('guest');
  });

  it('getUserDisplayName returns displayName for logged in user for not null value', () => {
    const user = { displayName: 'some_name' };
    mockAuthService.isLoggedIn.and.returnValue(true);
    mockAuthService.getAuth.and.returnValue(user);

    const result = component.getUserDisplayName();

    expect(result).toBe('some_name');
  });

  it('getUserDisplayName returns `logged in user` for logged in user with null displayName', () => {
    const user = { displayName: null };
    mockAuthService.isLoggedIn.and.returnValue(true);
    mockAuthService.getAuth.and.returnValue(user);

    const result = component.getUserDisplayName();

    expect(result).toBe('logged in user');
  });
});
