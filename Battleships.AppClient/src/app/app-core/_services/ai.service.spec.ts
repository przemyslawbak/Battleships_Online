import { TestBed } from '@angular/core/testing';
import { AiService } from '@services/ai.service';
import { BoardService } from './board.service';
import { FleetService } from './fleet.service';

describe('AiService', () => {
  let aiService: AiService;
  let boardService: BoardService;
  let fleetService: FleetService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [BoardService, FleetService],
    });
    aiService = new AiService(boardService, fleetService);
  });

  it('Service_ShouldBeCreated', () => {
    expect(aiService).toBeTruthy();
  });
});
