import { WindowService } from './window.service';

describe('WindowService', () => {
  let service: WindowService;
  const modalServiceMock = jasmine.createSpyObj('ModalService', ['open']);
  const routerMock = jasmine.createSpyObj('Router', [
    'navigateByUrl',
    'navigate',
  ]);
  const authServiceMock = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
  const windowMock = jasmine.createSpyObj('windowFake', ['close']);

  beforeEach(() => {
    service = new WindowService(authServiceMock, routerMock, modalServiceMock);
    routerMock.navigate.calls.reset();
    routerMock.navigateByUrl.calls.reset();
    modalServiceMock.open.calls.reset();
    windowMock.close.calls.reset();
  });

  it('Service_ShouldBeCreated', () => {
    expect(service).toBeTruthy();
  });

  it('closePopUpWindow_OnWindowNotNull_ClosesAndMakesWindowNull', () => {
    service.closePopUpWindow(windowMock);

    expect(windowMock).toBeNull;
    expect(windowMock.close).toHaveBeenCalledTimes(1);
  });

  it('closePopUpWindow_OnWindowNull_NotClosesMakesWindowNull', () => {
    service.closePopUpWindow(null);

    expect(windowMock).toBeNull;
    expect(windowMock.close).toHaveBeenCalledTimes(0);
  });

  it('handleCloseExternalProvider_OnLoggedIn_CallsNavigateByUrlOnce', () => {
    authServiceMock.isLoggedIn.and.returnValue(true);
    let returnUrl: string = 'any_url';
    service.handleCloseExternalProvider(returnUrl, windowMock);

    expect(routerMock.navigate).toHaveBeenCalledTimes(0);
    expect(routerMock.navigateByUrl).toHaveBeenCalledTimes(1);
    expect(modalServiceMock.open).toHaveBeenCalledTimes(0);
  });

  it('handleCloseExternalProvider_OnNotLoggedIn_CallsNavigateByUrlNever', () => {
    authServiceMock.isLoggedIn.and.returnValue(false);
    let returnUrl: string = 'any_url';
    service.handleCloseExternalProvider(returnUrl, windowMock);

    expect(routerMock.navigate).toHaveBeenCalledTimes(1);
    expect(routerMock.navigateByUrl).toHaveBeenCalledTimes(0);
    expect(modalServiceMock.open).toHaveBeenCalledTimes(1);
  });
});
