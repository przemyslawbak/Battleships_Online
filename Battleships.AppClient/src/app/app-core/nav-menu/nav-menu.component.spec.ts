import { SignalRService } from './../_services/signal-r.service';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NavMenuComponent } from './nav-menu.component';
import { AuthService } from '@services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';

@Component({
  template: '',
})
class DummyComponent {}

describe('NavMenuComponent', () => {
  let fixture: ComponentFixture<NavMenuComponent>;
  let component: NavMenuComponent;
  const mockAuthService = jasmine.createSpyObj('AuthService', [
    'isLoggedIn',
    'getAuth',
    'isAdmin',
  ]);
  const mockSignalrService = jasmine.createSpyObj('SignalRService', [
    'stopConnection',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'connect-game', component: DummyComponent },
          { path: 'policies', component: DummyComponent },
          { path: '', component: DummyComponent },
          { path: 'join-site', component: DummyComponent },
          { path: 'edit-profile', component: DummyComponent },
          { path: 'admin', component: DummyComponent },
        ]),
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: SignalRService, useValue: mockSignalrService },
      ],
      declarations: [NavMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NavMenuComponent);
    component = fixture.componentInstance;
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });

  it('getUserDisplayName_OnNotLoggedInUser_ReturnsGuest', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);
    const result = component.getUserDisplayName();

    expect(result).toBe('Guest');
  });

  it('getUserDisplayName_OnLoggedInUser_ReturnsUserDisplayName', () => {
    const displayName: string = 'some_name';
    const user = { displayName: displayName };
    mockAuthService.isLoggedIn.and.returnValue(true);
    mockAuthService.getAuth.and.returnValue(user);

    const result = component.getUserDisplayName();

    expect(result).toBe(displayName);
  });

  it('getUserDisplayName_OnLoggedInUserWithNullDisplayName_ReturnsUserDisplayName', () => {
    const user = { displayName: null };
    mockAuthService.isLoggedIn.and.returnValue(true);
    mockAuthService.getAuth.and.returnValue(user);

    const result = component.getUserDisplayName();

    expect(result).toBe('User');
  });

  it('template_OnLoggedInUser_DoesNotDisplayJoinSiteElementAndDisplaySeveralElements', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.join-site')).toBeNull();
    expect(fixture.nativeElement.querySelector('.edit-profile')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.logout-user')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.admin-user')).toBeTruthy();
  });

  it('template_OnLoggedInUser_DoesNotDisplayJoinSiteElementAndNotDisplaySeveralElements', () => {
    mockAuthService.isLoggedIn.and.returnValue(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.join-site')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.edit-profile')).toBeNull();
    expect(fixture.nativeElement.querySelector('.logout-user')).toBeNull();
    expect(fixture.nativeElement.querySelector('.admin-user')).toBeNull();
  });

  it('template_OnAdminLoggedInOrNot_DisplaysOrNotAdminButton', () => {
    mockAuthService.isLoggedIn.and.returnValue(true);
    mockAuthService.isAdmin.and.returnValue(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.admin-button')).toBeTruthy();
    mockAuthService.isAdmin.and.returnValue(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.admin-button')).toBeNull();
  });
});
