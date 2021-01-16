import { TestBed } from '@angular/core/testing';
import 'rxjs/add/observable/of';
import { HubConnectionService } from './hub-connection.service';
import { ModalService } from './modal.service';
import { SignalRService } from './signal-r.service';

describe('SignalRService', () => {
  let signalrService: SignalRService;
  const authServiceMock = jasmine.createSpyObj('AuthService', ['getAuth']);
  const routerMock = jasmine.createSpyObj('Router', ['navigate']);
  const modalServiceMock = jasmine.createSpyObj('ModalSevice', ['add']);
  let hubServiceMock: HubConnectionService;
  const gameServiceMock = jasmine.createSpyObj('GameService', [
    'setGame',
    'isGameStarted',
    'getGame',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HubConnectionService,
        { provide: ModalService, useValue: modalServiceMock },
      ],
    });
    hubServiceMock = TestBed.inject(HubConnectionService);
    signalrService = new SignalRService(
      authServiceMock,
      gameServiceMock,
      routerMock,
      hubServiceMock
    );
  });

  it('Service_ShouldBeCreated', () => {
    spyOn(hubServiceMock.messageChange, 'next');
    spyOn(hubServiceMock.gameChange, 'next');
    expect(signalrService).toBeTruthy();
  });
});
