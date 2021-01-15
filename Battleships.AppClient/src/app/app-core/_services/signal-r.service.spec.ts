import { SignalRService } from './signal-r.service';

describe('SignalRService', () => {
  let signalrService: SignalRService;
  const routerMock = jasmine.createSpyObj('Router', ['navigate']);
  const authServiceMock = jasmine.createSpyObj('AuthService', ['getAuth']);
  const modalServiceMock = jasmine.createSpyObj('ModalService', ['open']);
  const gameServiceMock = jasmine.createSpyObj('GameService', [
    'setGame',
    'isGameStarted',
    'getGame',
  ]);

  beforeEach(() => {
    signalrService = new SignalRService(
      modalServiceMock,
      authServiceMock,
      gameServiceMock,
      routerMock
    );
  });

  it('Service_ShouldBeCreated', () => {
    expect(signalrService).toBeTruthy();
  });
});
