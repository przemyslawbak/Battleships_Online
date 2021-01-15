import { PlayerService } from '@services/player.service';
import { TextService } from './text.service';

describe('TextService', () => {
  let textService: TextService;

  beforeEach(() => {
    textService = new TextService();
  });

  it('Service_ShouldBeCreated', () => {
    expect(textService).toBeTruthy();
  });
});
