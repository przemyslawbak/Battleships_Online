import { HubBuilderService } from './hub-builder.service';

describe('HubBuilderService', () => {
  let builderService: HubBuilderService;

  beforeEach(() => {
    builderService = new HubBuilderService();
  });

  it('Service_ShouldBeCreated', () => {
    expect(builderService).toBeTruthy();
  });
});
