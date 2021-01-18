import { HubConnectionService } from './hub-connection.service';

describe('HubConnectionService', () => {
  let hubMock = {
    start(): Promise<void> {
      return Promise.resolve();
    },
    stop(): Promise<void> {
      return Promise.resolve();
    },
    onclose(callback: (error?: Error) => void): void {},
    off(name: string): void {},
    on(name: string): void {},
  };
  let hubService: HubConnectionService;
  const modalServiceMock = jasmine.createSpyObj('ModalService', [
    'add',
    'open',
    'close',
  ]);
  const builderServiceMock = jasmine.createSpyObj('HubBuilderService', [
    'buildNewService',
  ]);

  beforeEach(() => {
    hubService = new HubConnectionService(modalServiceMock, builderServiceMock);
    builderServiceMock.buildNewService.and.returnValue(hubMock);
  });

  it('Service_ShouldBeCreated', () => {
    expect(hubService).toBeTruthy();
  });

  it('isConnectionStarted_OnNotStartedConnection_ReturnsFalse', () => {
    expect(hubService.isConnectionStarted()).toBe(false);
  });

  it('isConnectionStarted_OnStartedConnection_ReturnsTrue', async () => {
    await hubService.createHubConnectionBuilder('any_token', 'any_url');
    await hubService.startHubConnection();
    expect(hubService.isConnectionStarted()).toBe(true);
  });

  it('disconnect_OnStartedConnectionAndGameStarted_SetsConnectionToNullAndCallsStopOnceAndCallsModalOpen', async () => {
    await hubService.createHubConnectionBuilder('any_token', 'any_url');
    await hubService.startHubConnection();
    await hubService.disconnect(true);

    expect(hubService.isConnectionStarted()).toBe(false);
  });
});
